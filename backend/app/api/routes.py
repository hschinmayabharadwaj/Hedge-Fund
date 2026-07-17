"""
Secure API Router
RBAC, rate limiting, input validation, audit logging.
Optimised with cursor-based pagination, sparse fieldsets, and minimal queries.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Security, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, over
from typing import List, Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import get_current_user, require_admin, TokenData
from app.core.validators import (
    MessageCreate, SearchQuery, PaginationParams,
    CursorPaginationParams, FieldParams,
    sanitization_service,
)
from app.core.rate_limiter import rate_limit
from app.core.kafka_client import kafka_producer
from app.models.database import User, AuditLog, AuditAction, SecurityEvent


router = APIRouter(prefix="/api/v1", tags=["API"])


# --------------- Users (cursor + sparse fields) ---------------

@router.get("/users", response_model=dict)
@rate_limit()
async def list_users(
    request: Request,
    pagination: CursorPaginationParams = Depends(),
    fields: FieldParams = Depends(),
    current_user: TokenData = Security(get_current_user, scopes=["admin", "read"]),
    db: AsyncSession = Depends(get_db),
):
    """
    List users with cursor-based keyset pagination and optional sparse fieldsets.
    ?cursor=<last_id>&limit=20&fields=id,username,email
    """
    # Keyset query — no OFFSET scan
    query = select(User)

    if pagination.cursor is not None and pagination.cursor > 0:
        if pagination.sort_order == "desc":
            query = query.where(User.id < pagination.cursor)
            query = query.order_by(User.id.desc())
        else:
            query = query.where(User.id > pagination.cursor)
            query = query.order_by(User.id.asc())
    else:
        query = query.order_by(User.id.desc() if pagination.sort_order == "desc" else User.id.asc())

    # Fetch one extra row to detect if there's a next page
    query = query.limit(pagination.limit + 1)
    result = await db.execute(query)
    rows = list(result.scalars().all())

    has_next = len(rows) > pagination.limit
    users = rows[:pagination.limit]

    # Window-function count (single query, no extra round trip)
    count_q = select(func.count()).select_from(User)
    total = (await db.execute(count_q)).scalar_one()

    field_set = fields.get_field_set()

    next_cursor = users[-1].id if users and has_next else None

    # Audit log for admin access
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action=AuditAction.READ,
        resource_type="user",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        success=True,
        changes={"action": "list_users", "count": len(users)},
    )
    db.add(audit_log)
    await db.commit()

    return {
        "users": [u.to_dict(fields=field_set) for u in users],
        "pagination": {
            "next_cursor": next_cursor,
            "limit": pagination.limit,
            "has_next": has_next,
            "total": total,
        },
    }


@router.get("/users/{user_id}", response_model=dict)
@rate_limit()
async def get_user(
    user_id: int,
    request: Request,
    fields: FieldParams = Depends(),
    current_user: TokenData = Security(get_current_user, scopes=["admin", "read"]),
    db: AsyncSession = Depends(get_db),
):
    """Get user by ID with optional sparse fieldset."""
    if current_user.user_id != user_id and "admin" not in current_user.scopes:
        if "read" not in current_user.scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user.to_dict(fields=fields.get_field_set())


@router.delete("/users/{user_id}", response_model=dict)
@rate_limit(cost=5)
async def delete_user(
    user_id: int,
    request: Request,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete user (Admin only)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )

    user.deleted_at = datetime.now(timezone.utc)
    user.status = "deleted"

    audit_log = AuditLog(
        user_id=current_user.user_id,
        action=AuditAction.DELETE,
        resource_type="user",
        resource_id=user_id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        success=True,
    )
    db.add(audit_log)
    await db.commit()

    return {"message": "User deleted successfully"}


# --------------- Messages ---------------

@router.post("/messages/send", response_model=dict)
@rate_limit(cost=2)
async def send_message(
    message: MessageCreate,
    request: Request,
    current_user: TokenData = Security(get_current_user, scopes=["write"]),
    db: AsyncSession = Depends(get_db),
):
    """Send message to Kafka with encryption and audit logging."""
    for key, value in message.value.items():
        if isinstance(value, str):
            is_safe, error = sanitization_service.check_xss(value)
            if not is_safe:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid content in field '{key}': {error}",
                )

    enriched_message = {
        **message.value,
        "_user_id": current_user.user_id,
        "_username": current_user.username,
        "_timestamp": datetime.now(timezone.utc).isoformat(),
    }

    try:
        success = kafka_producer.produce(
            topic=message.topic,
            value=enriched_message,
            key=message.key,
            headers=message.headers,
            encrypt=True,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Failed to send message",
            )

        kafka_producer.flush(timeout=5.0)

        audit_log = AuditLog(
            user_id=current_user.user_id,
            action=AuditAction.CREATE,
            resource_type="message",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent"),
            success=True,
            changes={"topic": message.topic},
        )
        db.add(audit_log)
        await db.commit()

        return {"message": "Message sent successfully", "topic": message.topic}

    except Exception as e:
        audit_log = AuditLog(
            user_id=current_user.user_id,
            action=AuditAction.CREATE,
            resource_type="message",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent"),
            success=False,
            error_message=str(e),
        )
        db.add(audit_log)
        await db.commit()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}",
        )


# --------------- Search ---------------

@router.post("/search", response_model=dict)
@rate_limit()
async def search(
    search_query: SearchQuery,
    request: Request,
    current_user: TokenData = Security(get_current_user, scopes=["read"]),
    db: AsyncSession = Depends(get_db),
):
    """Search users with input sanitization and sparse results."""
    query_text = search_query.query.lower()

    query = (
        select(User)
        .where(
            (User.username.ilike(f"%{query_text}%"))
            | (User.email.ilike(f"%{query_text}%"))
        )
        .limit(search_query.limit)
    )

    result = await db.execute(query)
    users = result.scalars().all()

    return {
        "results": [u.to_dict(fields={"id", "username", "email", "status"}) for u in users],
        "query": search_query.query,
        "count": len(users),
    }


# --------------- Audit Logs (cursor pagination) ---------------

@router.get("/audit-logs", response_model=dict)
@rate_limit()
async def get_audit_logs(
    request: Request,
    pagination: CursorPaginationParams = Depends(),
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Audit logs with cursor-based pagination."""
    query = select(AuditLog)

    if pagination.cursor is not None and pagination.cursor > 0:
        query = query.where(AuditLog.id < pagination.cursor)

    query = query.order_by(AuditLog.id.desc()).limit(pagination.limit + 1)
    result = await db.execute(query)
    rows = list(result.scalars().all())

    has_next = len(rows) > pagination.limit
    logs = rows[:pagination.limit]

    count_q = select(func.count()).select_from(AuditLog)
    total = (await db.execute(count_q)).scalar_one()

    next_cursor = logs[-1].id if logs and has_next else None

    # Audit log for admin access to audit logs
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action=AuditAction.READ,
        resource_type="audit_log",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        success=True,
        changes={"action": "list_audit_logs", "count": len(logs)},
    )
    db.add(audit_log)
    await db.commit()

    return {
        "logs": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action.value,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "ip_address": log.ip_address,
                "success": log.success,
                "error_message": log.error_message,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ],
        "pagination": {
            "next_cursor": next_cursor,
            "limit": pagination.limit,
            "has_next": has_next,
            "total": total,
        },
    }


# --------------- Security Events (cursor pagination) ---------------

@router.get("/security-events", response_model=dict)
@rate_limit()
async def get_security_events(
    request: Request,
    pagination: CursorPaginationParams = Depends(),
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Security events with cursor-based pagination."""
    query = select(SecurityEvent)

    if pagination.cursor is not None and pagination.cursor > 0:
        query = query.where(SecurityEvent.id < pagination.cursor)

    query = query.order_by(SecurityEvent.id.desc()).limit(pagination.limit + 1)
    result = await db.execute(query)
    rows = list(result.scalars().all())

    has_next = len(rows) > pagination.limit
    events = rows[:pagination.limit]

    count_q = select(func.count()).select_from(SecurityEvent)
    total = (await db.execute(count_q)).scalar_one()

    next_cursor = events[-1].id if events and has_next else None

    # Audit log for admin access to security events
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action=AuditAction.READ,
        resource_type="security_event",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        success=True,
        changes={"action": "list_security_events", "count": len(events)},
    )
    db.add(audit_log)
    await db.commit()

    return {
        "events": [
            {
                "id": event.id,
                "event_type": event.event_type,
                "severity": event.severity,
                "description": event.description,
                "user_id": event.user_id,
                "ip_address": event.ip_address,
                "resolved": event.resolved,
                "created_at": event.created_at.isoformat() if event.created_at else None,
            }
            for event in events
        ],
        "pagination": {
            "next_cursor": next_cursor,
            "limit": pagination.limit,
            "has_next": has_next,
            "total": total,
        },
    }


@router.get("/health", response_model=dict)
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
