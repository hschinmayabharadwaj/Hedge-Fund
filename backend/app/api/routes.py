"""
Secure API Router Example
Demonstrates RBAC, rate limiting, input validation, and audit logging
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Security
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import get_current_user, require_admin, TokenData
from app.core.validators import (
    MessageCreate, SearchQuery, PaginationParams,
    sanitization_service
)
from app.core.rate_limiter import rate_limit
from app.core.kafka_client import kafka_producer
from app.models.database import User, AuditLog, AuditAction, SecurityEvent


router = APIRouter(prefix="/api/v1", tags=["API"])


@router.get("/users", response_model=dict)
@rate_limit()
async def list_users(
    request: Request,
    pagination: PaginationParams = Depends(),
    current_user: TokenData = Security(get_current_user, scopes=["admin", "read"]),
    db: AsyncSession = Depends(get_db)
):
    """
    List users (Admin only)
    
    Security:
    - Requires admin or read scope
    - Rate limited
    - Paginated results
    """
    # Calculate offset
    offset = (pagination.page - 1) * pagination.page_size
    
    # Build query
    query = select(User).offset(offset).limit(pagination.page_size)
    
    # Add sorting
    if pagination.sort_by:
        if hasattr(User, pagination.sort_by):
            sort_column = getattr(User, pagination.sort_by)
            if pagination.sort_order == "desc":
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())
    
    # Execute query
    result = await db.execute(query)
    users = result.scalars().all()
    
    # Get total count
    count_result = await db.execute(select(func.count()).select_from(User))
    total = count_result.scalar_one()
    
    return {
        "users": [user.to_dict() for user in users],
        "pagination": {
            "page": pagination.page,
            "page_size": pagination.page_size,
            "total": total,
            "pages": (total + pagination.page_size - 1) // pagination.page_size
        }
    }


@router.get("/users/{user_id}", response_model=dict)
@rate_limit()
async def get_user(
    user_id: int,
    request: Request,
    current_user: TokenData = Security(get_current_user, scopes=["admin", "read"]),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user by ID
    
    Security:
    - Requires admin or read scope, or accessing own profile
    - Rate limited
    """
    # Users can access their own profile
    if current_user.user_id != user_id and "admin" not in current_user.scopes:
        if "read" not in current_user.scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user.to_dict()


@router.delete("/users/{user_id}", response_model=dict)
@rate_limit(cost=5)
async def delete_user(
    user_id: int,
    request: Request,
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete user (Admin only)
    
    Security:
    - Requires admin scope
    - Higher rate limit cost
    - Audit logged
    - Soft delete
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-deletion
    if user.id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Soft delete
    user.deleted_at = datetime.now(timezone.utc)
    user.status = "deleted"
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.user_id,
        action=AuditAction.DELETE,
        resource_type="user",
        resource_id=user_id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        success=True
    )
    db.add(audit_log)
    
    await db.commit()
    
    return {"message": "User deleted successfully"}


@router.post("/messages/send", response_model=dict)
@rate_limit(cost=2)
async def send_message(
    message: MessageCreate,
    request: Request,
    current_user: TokenData = Security(get_current_user, scopes=["write"]),
    db: AsyncSession = Depends(get_db)
):
    """
    Send message to Kafka
    
    Security:
    - Requires write scope
    - Input validation
    - Message encryption
    - Rate limited
    - Audit logged
    """
    # Validate message content
    for key, value in message.value.items():
        if isinstance(value, str):
            # Check for XSS
            is_safe, error = sanitization_service.check_xss(value)
            if not is_safe:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid content in field '{key}': {error}"
                )
    
    # Add user context to message
    enriched_message = {
        **message.value,
        "_user_id": current_user.user_id,
        "_username": current_user.username,
        "_timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Send to Kafka
    try:
        success = kafka_producer.produce(
            topic=message.topic,
            value=enriched_message,
            key=message.key,
            headers=message.headers,
            encrypt=True
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Failed to send message"
            )
        
        # Flush to ensure delivery
        kafka_producer.flush(timeout=5.0)
        
        # Create audit log
        audit_log = AuditLog(
            user_id=current_user.user_id,
            action=AuditAction.CREATE,
            resource_type="message",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent"),
            success=True,
            changes={"topic": message.topic}
        )
        db.add(audit_log)
        await db.commit()
        
        return {
            "message": "Message sent successfully",
            "topic": message.topic
        }
        
    except Exception as e:
        # Log error
        audit_log = AuditLog(
            user_id=current_user.user_id,
            action=AuditAction.CREATE,
            resource_type="message",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent"),
            success=False,
            error_message=str(e)
        )
        db.add(audit_log)
        await db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )


@router.post("/search", response_model=dict)
@rate_limit()
async def search(
    search_query: SearchQuery,
    request: Request,
    current_user: TokenData = Security(get_current_user, scopes=["read"]),
    db: AsyncSession = Depends(get_db)
):
    """
    Search across resources
    
    Security:
    - Requires read scope
    - Input sanitization
    - SQL injection prevention
    - Rate limited
    """
    # For demo, search users
    query_text = search_query.query.lower()
    
    # Build safe query
    query = select(User).where(
        (User.username.ilike(f"%{query_text}%")) |
        (User.email.ilike(f"%{query_text}%"))
    ).offset(search_query.offset).limit(search_query.limit)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return {
        "results": [user.to_dict() for user in users],
        "query": search_query.query,
        "count": len(users)
    }


@router.get("/audit-logs", response_model=dict)
@rate_limit()
async def get_audit_logs(
    request: Request,
    pagination: PaginationParams = Depends(),
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get audit logs (Admin only)
    
    Security:
    - Requires admin scope
    - Rate limited
    - Paginated
    """
    offset = (pagination.page - 1) * pagination.page_size
    
    query = select(AuditLog).order_by(
        AuditLog.created_at.desc()
    ).offset(offset).limit(pagination.page_size)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    # Get total count
    count_result = await db.execute(select(func.count()).select_from(AuditLog))
    total = count_result.scalar_one()
    
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
                "created_at": log.created_at.isoformat() if log.created_at else None
            }
            for log in logs
        ],
        "pagination": {
            "page": pagination.page,
            "page_size": pagination.page_size,
            "total": total,
            "pages": (total + pagination.page_size - 1) // pagination.page_size
        }
    }


@router.get("/security-events", response_model=dict)
@rate_limit()
async def get_security_events(
    request: Request,
    pagination: PaginationParams = Depends(),
    current_user: TokenData = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get security events (Admin only)
    
    Security:
    - Requires admin scope
    - Rate limited
    - Paginated
    """
    offset = (pagination.page - 1) * pagination.page_size
    
    query = select(SecurityEvent).order_by(
        SecurityEvent.created_at.desc()
    ).offset(offset).limit(pagination.page_size)
    
    result = await db.execute(query)
    events = result.scalars().all()
    
    # Get total count
    count_result = await db.execute(select(func.count()).select_from(SecurityEvent))
    total = count_result.scalar_one()
    
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
                "created_at": event.created_at.isoformat() if event.created_at else None
            }
            for event in events
        ],
        "pagination": {
            "page": pagination.page,
            "page_size": pagination.page_size,
            "total": total,
            "pages": (total + pagination.page_size - 1) // pagination.page_size
        }
    }


@router.get("/health", response_model=dict)
async def health_check():
    """
    Health check endpoint
    No authentication required
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
