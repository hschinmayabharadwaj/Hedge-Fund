"""
Security Module
Implements OAuth2, JWT, password hashing, encryption, and security middleware
Protects against OWASP Top 10 vulnerabilities
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from cryptography.fernet import Fernet
from pydantic import BaseModel, ValidationError
import secrets
import hashlib
import pyotp
import base64

from app.core.config import get_settings


# Password hashing configuration
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Strong hashing with 12 rounds
)

# OAuth2 configuration
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="api/v1/auth/login",
    scopes={
        "user": "Regular user access",
        "admin": "Administrative access",
        "read": "Read-only access",
        "write": "Write access",
        "delete": "Delete access",
    }
)


# Token Models
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    scopes: List[str] = []
    exp: Optional[datetime] = None


class RefreshToken(BaseModel):
    refresh_token: str


# Encryption utilities
class EncryptionService:
    """Service for encrypting/decrypting sensitive data"""
    
    def __init__(self):
        settings = get_settings()
        self.fernet = Fernet(settings.ENCRYPTION_KEY.get_secret_value().encode())
        self.field_fernet = Fernet(settings.FIELD_ENCRYPTION_KEY.get_secret_value().encode())
    
    def encrypt_data(self, data: str) -> str:
        """Encrypt string data"""
        if not data:
            return ""
        return self.fernet.encrypt(data.encode()).decode()
    
    def decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt string data"""
        if not encrypted_data:
            return ""
        return self.fernet.decrypt(encrypted_data.encode()).decode()
    
    def encrypt_field(self, data: str) -> str:
        """Encrypt individual field (e.g., PII data)"""
        if not data:
            return ""
        return self.field_fernet.encrypt(data.encode()).decode()
    
    def decrypt_field(self, encrypted_data: str) -> str:
        """Decrypt individual field"""
        if not encrypted_data:
            return ""
        return self.field_fernet.decrypt(encrypted_data.encode()).decode()
    
    @staticmethod
    def hash_data(data: str) -> str:
        """One-way hash for non-reversible data (e.g., audit trails)"""
        return hashlib.sha256(data.encode()).hexdigest()


# Password utilities
class PasswordService:
    """Service for password operations"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """Generate cryptographically secure random token"""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, str]:
        """
        Validate password meets security requirements
        Returns (is_valid, error_message)
        """
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if len(password) > 128:
            return False, "Password must not exceed 128 characters"
        
        if not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter"
        
        if not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter"
        
        if not any(c.isdigit() for c in password):
            return False, "Password must contain at least one digit"
        
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            return False, "Password must contain at least one special character"
        
        # Check for common passwords (you should expand this list)
        common_passwords = ["password", "12345678", "qwerty", "abc123", "password123"]
        if password.lower() in common_passwords:
            return False, "Password is too common, please choose a stronger password"
        
        return True, ""


# JWT utilities
class JWTService:
    """Service for JWT token operations"""
    
    @staticmethod
    def create_access_token(
        data: dict,
        scopes: List[str] = None,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        settings = get_settings()
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "access",
            "scopes": scopes or []
        })
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY.get_secret_value(),
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create JWT refresh token"""
        settings = get_settings()
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "refresh"
        })
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY.get_secret_value(),
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> TokenData:
        """Verify and decode JWT token"""
        settings = get_settings()
        
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY.get_secret_value(),
                algorithms=[settings.JWT_ALGORITHM]
            )
            
            # Verify token type
            if payload.get("type") != token_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            username: str = payload.get("sub")
            user_id: int = payload.get("user_id")
            scopes: List[str] = payload.get("scopes", [])
            exp = payload.get("exp")
            
            if username is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials"
                )
            
            return TokenData(
                username=username,
                user_id=user_id,
                scopes=scopes,
                exp=datetime.fromtimestamp(exp) if exp else None
            )
            
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Could not validate credentials: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"}
            )


# MFA utilities
class MFAService:
    """Multi-Factor Authentication service"""
    
    @staticmethod
    def generate_secret() -> str:
        """Generate MFA secret"""
        return pyotp.random_base32()
    
    @staticmethod
    def get_totp_uri(secret: str, username: str) -> str:
        """Get TOTP URI for QR code generation"""
        settings = get_settings()
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(
            name=username,
            issuer_name=settings.MFA_ISSUER_NAME
        )
    
    @staticmethod
    def verify_totp(secret: str, token: str) -> bool:
        """Verify TOTP token"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)  # Allow 1 time step tolerance
    
    @staticmethod
    def generate_backup_codes(count: int = 10) -> List[str]:
        """Generate backup codes for MFA"""
        return [secrets.token_hex(4).upper() for _ in range(count)]


# Security dependencies
async def get_current_user(
    security_scopes: SecurityScopes,
    token: str = Depends(oauth2_scheme)
) -> TokenData:
    """
    Dependency to get current authenticated user
    Validates JWT token and checks required scopes
    """
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value}
    )
    
    try:
        token_data = JWTService.verify_token(token, token_type="access")
        
        # Check if token has required scopes
        for scope in security_scopes.scopes:
            if scope not in token_data.scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions",
                    headers={"WWW-Authenticate": authenticate_value}
                )
        
        return token_data
        
    except HTTPException:
        raise


async def get_current_active_user(
    current_user: TokenData = Depends(get_current_user)
) -> TokenData:
    """Dependency to ensure user is active"""
    # Add additional checks here (e.g., check if user is disabled in DB)
    return current_user


async def require_admin(
    current_user: TokenData = Depends(get_current_user)
) -> TokenData:
    """Dependency to require admin role"""
    if "admin" not in current_user.scopes:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# Security headers middleware
def add_security_headers(response):
    """Add security headers to response"""
    settings = get_settings()
    
    if settings.ENABLE_HSTS:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    if settings.ENABLE_CSP:
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self'; "
            "frame-ancestors 'none';"
        )
    
    if settings.ENABLE_X_FRAME_OPTIONS:
        response.headers["X-Frame-Options"] = "DENY"
    
    if settings.ENABLE_X_CONTENT_TYPE_OPTIONS:
        response.headers["X-Content-Type-Options"] = "nosniff"
    
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    return response


# Create service instances
encryption_service = EncryptionService()
password_service = PasswordService()
jwt_service = JWTService()
mfa_service = MFAService()
