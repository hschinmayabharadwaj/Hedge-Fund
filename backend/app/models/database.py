"""
Database Models
SQLAlchemy models with field-level encryption and audit logging
"""
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text,
    ForeignKey, Table, Enum as SQLEnum, JSON, Index
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional
import enum

from app.core.security import encryption_service, password_service


Base = declarative_base()


# Association table for user roles
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE')),
    Column('role_id', Integer, ForeignKey('roles.id', ondelete='CASCADE'))
)


class UserStatus(str, enum.Enum):
    """User status enum"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class AuditAction(str, enum.Enum):
    """Audit action types"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    LOGIN_FAILED = "login_failed"
    PASSWORD_CHANGE = "password_change"
    MFA_ENABLE = "mfa_enable"
    MFA_DISABLE = "mfa_disable"


class User(Base):
    """User model with encrypted sensitive fields"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    email_verified = Column(Boolean, default=False)
    
    # Encrypted fields
    _full_name = Column("full_name", Text, nullable=True)
    _phone = Column("phone", Text, nullable=True)
    
    # Hashed password
    hashed_password = Column(String(255), nullable=False)
    
    # Status and flags
    status = Column(SQLEnum(UserStatus), default=UserStatus.ACTIVE, nullable=False)
    is_superuser = Column(Boolean, default=False)
    
    # MFA
    mfa_enabled = Column(Boolean, default=False)
    _mfa_secret = Column("mfa_secret", Text, nullable=True)
    _mfa_backup_codes = Column("mfa_backup_codes", JSON, nullable=True)
    
    # Session management
    last_login = Column(DateTime(timezone=True), nullable=True)
    last_activity = Column(DateTime(timezone=True), nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_user_status_deleted', 'status', 'deleted_at'),
        Index('idx_user_email_verified', 'email', 'email_verified'),
    )
    
    @property
    def full_name(self) -> Optional[str]:
        """Decrypt full name"""
        if self._full_name:
            return encryption_service.decrypt_field(self._full_name)
        return None
    
    @full_name.setter
    def full_name(self, value: Optional[str]):
        """Encrypt full name"""
        if value:
            self._full_name = encryption_service.encrypt_field(value)
        else:
            self._full_name = None
    
    @property
    def phone(self) -> Optional[str]:
        """Decrypt phone"""
        if self._phone:
            return encryption_service.decrypt_field(self._phone)
        return None
    
    @phone.setter
    def phone(self, value: Optional[str]):
        """Encrypt phone"""
        if value:
            self._phone = encryption_service.encrypt_field(value)
        else:
            self._phone = None
    
    @property
    def mfa_secret(self) -> Optional[str]:
        """Decrypt MFA secret"""
        if self._mfa_secret:
            return encryption_service.decrypt_field(self._mfa_secret)
        return None
    
    @mfa_secret.setter
    def mfa_secret(self, value: Optional[str]):
        """Encrypt MFA secret"""
        if value:
            self._mfa_secret = encryption_service.encrypt_field(value)
        else:
            self._mfa_secret = None
    
    @property
    def mfa_backup_codes(self) -> Optional[list]:
        """Get decrypted MFA backup codes"""
        if self._mfa_backup_codes:
            return [encryption_service.decrypt_field(code) for code in self._mfa_backup_codes]
        return None
    
    @mfa_backup_codes.setter
    def mfa_backup_codes(self, codes: Optional[list]):
        """Encrypt MFA backup codes"""
        if codes:
            self._mfa_backup_codes = [encryption_service.encrypt_field(code) for code in codes]
        else:
            self._mfa_backup_codes = None
    
    def set_password(self, password: str):
        """Set hashed password"""
        self.hashed_password = password_service.hash_password(password)
    
    def verify_password(self, password: str) -> bool:
        """Verify password"""
        return password_service.verify_password(password, self.hashed_password)
    
    def is_locked(self) -> bool:
        """Check if account is locked"""
        if self.locked_until and self.locked_until > datetime.utcnow():
            return True
        return False
    
    def to_dict(self) -> dict:
        """Convert to dictionary (exclude sensitive fields)"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'email_verified': self.email_verified,
            'full_name': self.full_name,
            'status': self.status.value,
            'mfa_enabled': self.mfa_enabled,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Role(Base):
    """Role model for RBAC"""
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    permissions = Column(JSON, default=list)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", secondary=user_roles, back_populates="roles")


class Permission(Base):
    """Permission model"""
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    resource = Column(String(100), nullable=False)
    action = Column(String(50), nullable=False)
    description = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    __table_args__ = (
        Index('idx_permission_resource_action', 'resource', 'action', unique=True),
    )


class APIKey(Base):
    """API Key model with encrypted keys"""
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    
    # Encrypted API key
    _key_hash = Column("key_hash", String(255), unique=True, nullable=False, index=True)
    
    scopes = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    
    last_used = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="api_keys")
    
    __table_args__ = (
        Index('idx_apikey_user_active', 'user_id', 'is_active'),
    )


class UserSession(Base):
    """User session model for session management"""
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Encrypted session token
    _session_token = Column("session_token", Text, unique=True, nullable=False, index=True)
    _refresh_token = Column("refresh_token", Text, unique=True, nullable=True)
    
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_activity = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    
    __table_args__ = (
        Index('idx_session_user_active', 'user_id', 'is_active'),
        Index('idx_session_expires', 'expires_at'),
    )


class AuditLog(Base):
    """Audit log model for security tracking"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    
    action = Column(SQLEnum(AuditAction), nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(Integer, nullable=True)
    
    # Request details
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    request_method = Column(String(10), nullable=True)
    request_path = Column(String(500), nullable=True)
    
    # Change details
    changes = Column(JSON, nullable=True)
    
    # Status
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    
    __table_args__ = (
        Index('idx_audit_user_action', 'user_id', 'action'),
        Index('idx_audit_resource', 'resource_type', 'resource_id'),
        Index('idx_audit_created', 'created_at'),
    )


class SecurityEvent(Base):
    """Security event model for threat detection"""
    __tablename__ = "security_events"
    
    id = Column(Integer, primary_key=True, index=True)
    
    event_type = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False)  # low, medium, high, critical
    
    user_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    ip_address = Column(String(45), nullable=True)
    
    description = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    __table_args__ = (
        Index('idx_security_event_type', 'event_type'),
        Index('idx_security_severity', 'severity'),
        Index('idx_security_resolved', 'resolved'),
    )
