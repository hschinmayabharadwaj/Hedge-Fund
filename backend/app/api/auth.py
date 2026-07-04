"""
Authentication Router
Handles user registration, login, MFA, and token management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from typing import Optional
import io
import qrcode

from app.core.database import get_db
from app.core.security import (
    jwt_service, password_service, mfa_service,
    Token, TokenData, get_current_user
)
from app.core.validators import (
    UserRegistration, UserLogin, UserUpdate, PasswordChange
)
from app.core.rate_limiter import rate_limit, login_rate_limiter
from app.core.config import get_settings
from app.models.database import User, Role, AuditLog, AuditAction, UserStatus, UserSession


router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
@rate_limit(cost=3)
async def register(
    user_data: UserRegistration,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user
    
    Security features:
    - Password strength validation
    - Input sanitization
    - Rate limiting
    - Audit logging
    """
    # Check if username exists
    result = await db.execute(
        select(User).where(User.username == user_data.username)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        username=user_data.username,
        email=user_data.email,
        status=UserStatus.ACTIVE
    )
    user.set_password(user_data.password)
    
    # Set optional fields
    if user_data.full_name:
        user.full_name = user_data.full_name
    if user_data.phone:
        user.phone = user_data.phone
    
    db.add(user)
    await db.flush()
    
    # Assign default role
    result = await db.execute(
        select(Role).where(Role.name == "user")
    )
    default_role = result.scalar_one_or_none()
    if default_role:
        user.roles.append(default_role)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=user.id,
        action=AuditAction.CREATE,
        resource_type="user",
        resource_id=user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        success=True
    )
    db.add(audit_log)
    
    await db.commit()
    
    return {
        "message": "User registered successfully",
        "user": user.to_dict()
    }


@router.post("/login", response_model=Token)
@rate_limit(cost=2)
async def login(
    credentials: UserLogin,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user and return JWT tokens
    
    Security features:
    - Brute force protection
    - Account lockout
    - MFA support
    - Session management
    - Audit logging
    """
    settings = get_settings()
    
    # Check rate limiting for login attempts
    allowed, lockout_seconds = await login_rate_limiter.check_login_attempts(
        credentials.username
    )
    
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked. Try again in {lockout_seconds} seconds"
        )
    
    # Get user
    result = await db.execute(
        select(User).where(User.username == credentials.username)
    )
    user = result.scalar_one_or_none()
    
    # Verify user exists and password is correct
    if not user or not user.verify_password(credentials.password):
        # Record failed attempt
        await login_rate_limiter.record_failed_attempt(credentials.username)
        
        # Create audit log
        if user:
            audit_log = AuditLog(
                user_id=user.id,
                action=AuditAction.LOGIN_FAILED,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("User-Agent"),
                success=False,
                error_message="Invalid credentials"
            )
            db.add(audit_log)
            await db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Check if account is locked
    if user.is_locked():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is temporarily locked"
        )
    
    # Check account status
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is {user.status.value}"
        )
    
    # Verify MFA if enabled
    if user.mfa_enabled:
        if not credentials.mfa_token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="MFA token required"
            )
        
        if not mfa_service.verify_totp(user.mfa_secret, credentials.mfa_token):
            # Check backup codes
            backup_codes = user.mfa_backup_codes or []
            if credentials.mfa_token not in backup_codes:
                await login_rate_limiter.record_failed_attempt(credentials.username)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid MFA token"
                )
            else:
                # Remove used backup code
                backup_codes.remove(credentials.mfa_token)
                user.mfa_backup_codes = backup_codes
    
    # Reset failed login attempts
    await login_rate_limiter.reset_attempts(credentials.username)
    user.failed_login_attempts = 0
    user.locked_until = None
    
    # Get user scopes from roles
    scopes = []
    for role in user.roles:
        scopes.extend(role.permissions)
    
    # Add default scopes
    if user.is_superuser:
        scopes.append("admin")
    scopes.append("user")
    scopes = list(set(scopes))  # Remove duplicates
    
    # Create tokens
    access_token = jwt_service.create_access_token(
        data={"sub": user.username, "user_id": user.id},
        scopes=scopes
    )
    refresh_token = jwt_service.create_refresh_token(
        data={"sub": user.username, "user_id": user.id}
    )
    
    # Create session
    session = UserSession(
        user_id=user.id,
        session_token=access_token,
        refresh_token=refresh_token,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    db.add(session)
    
    # Update user login info
    user.last_login = datetime.utcnow()
    user.last_activity = datetime.utcnow()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=user.id,
        action=AuditAction.LOGIN,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        success=True
    )
    db.add(audit_log)
    
    await db.commit()
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    settings = get_settings()
    
    # Verify refresh token
    try:
        token_data = jwt_service.verify_token(refresh_token, token_type="refresh")
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get user
    result = await db.execute(
        select(User).where(User.id == token_data.user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user or user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Verify session exists
    result = await db.execute(
        select(UserSession).where(
            UserSession.refresh_token == refresh_token,
            UserSession.is_active == True
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session"
        )
    
    # Get user scopes
    scopes = []
    for role in user.roles:
        scopes.extend(role.permissions)
    if user.is_superuser:
        scopes.append("admin")
    scopes.append("user")
    scopes = list(set(scopes))
    
    # Create new access token
    access_token = jwt_service.create_access_token(
        data={"sub": user.username, "user_id": user.id},
        scopes=scopes
    )
    
    # Update session
    session.session_token = access_token
    session.expires_at = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    session.last_activity = datetime.utcnow()
    
    user.last_activity = datetime.utcnow()
    
    await db.commit()
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/logout")
async def logout(
    request: Request,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Logout user and invalidate session
    """
    # Get authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        
        # Invalidate session
        result = await db.execute(
            select(UserSession).where(
                UserSession.session_token == token,
                UserSession.user_id == current_user.user_id
            )
        )
        session = result.scalar_one_or_none()
        
        if session:
            session.is_active = False
        
        # Create audit log
        audit_log = AuditLog(
            user_id=current_user.user_id,
            action=AuditAction.LOGOUT,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent"),
            success=True
        )
        db.add(audit_log)
        
        await db.commit()
    
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=dict)
async def get_current_user_info(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user information"""
    result = await db.execute(
        select(User).where(User.id == current_user.user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user.to_dict()


@router.put("/me", response_model=dict)
async def update_current_user(
    user_update: UserUpdate,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user information"""
    result = await db.execute(
        select(User).where(User.id == current_user.user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.email is not None:
        user.email = user_update.email
        user.email_verified = False  # Re-verify email
    if user_update.phone is not None:
        user.phone = user_update.phone
    
    await db.commit()
    
    return user.to_dict()


@router.post("/change-password")
async def change_password(
    password_change: PasswordChange,
    request: Request,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change user password"""
    result = await db.execute(
        select(User).where(User.id == current_user.user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    if not user.verify_password(password_change.current_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Set new password
    user.set_password(password_change.new_password)
    
    # Invalidate all sessions
    await db.execute(
        select(UserSession).where(
            UserSession.user_id == user.id,
            UserSession.is_active == True
        )
    )
    
    # Create audit log
    audit_log = AuditLog(
        user_id=user.id,
        action=AuditAction.PASSWORD_CHANGE,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        success=True
    )
    db.add(audit_log)
    
    await db.commit()
    
    return {"message": "Password changed successfully. Please login again."}


@router.post("/mfa/enable")
async def enable_mfa(
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Enable MFA for user"""
    result = await db.execute(
        select(User).where(User.id == current_user.user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is already enabled"
        )
    
    # Generate MFA secret
    secret = mfa_service.generate_secret()
    user.mfa_secret = secret
    
    # Generate backup codes
    backup_codes = mfa_service.generate_backup_codes()
    user.mfa_backup_codes = backup_codes
    
    # Get provisioning URI for QR code
    uri = mfa_service.get_totp_uri(secret, user.username)
    
    await db.commit()
    
    return {
        "message": "MFA secret generated. Scan QR code and verify to complete setup.",
        "secret": secret,
        "uri": uri,
        "backup_codes": backup_codes
    }


@router.post("/mfa/verify")
async def verify_and_enable_mfa(
    token: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify MFA token and complete MFA setup"""
    result = await db.execute(
        select(User).where(User.id == current_user.user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user or not user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA not initialized"
        )
    
    # Verify token
    if not mfa_service.verify_totp(user.mfa_secret, token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA token"
        )
    
    # Enable MFA
    user.mfa_enabled = True
    await db.commit()
    
    return {"message": "MFA enabled successfully"}


@router.post("/mfa/disable")
async def disable_mfa(
    password: str,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Disable MFA for user"""
    result = await db.execute(
        select(User).where(User.id == current_user.user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify password
    if not user.verify_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    # Disable MFA
    user.mfa_enabled = False
    user.mfa_secret = None
    user.mfa_backup_codes = None
    
    await db.commit()
    
    return {"message": "MFA disabled successfully"}
