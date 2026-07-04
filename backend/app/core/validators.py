"""
Input Validation and Sanitization Module
Protects against injection attacks, XSS, and other OWASP vulnerabilities
Implements strict input validation using Pydantic models
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator, EmailStr, constr, conint
from datetime import datetime
import re
import bleach
import html
from enum import Enum


# Regex patterns for validation
USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9_-]{3,50}$')
PHONE_PATTERN = re.compile(r'^\+?1?\d{9,15}$')
URL_PATTERN = re.compile(
    r'^https?://'  # http:// or https://
    r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
    r'localhost|'  # localhost
    r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
    r'(?::\d+)?'  # optional port
    r'(?:/?|[/?]\S+)$', re.IGNORECASE
)
SQL_INJECTION_PATTERN = re.compile(
    r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)|"
    r"(--|;|'|\"|\*|\/\*|\*\/|xp_|sp_)",
    re.IGNORECASE
)
XSS_PATTERN = re.compile(
    r'<script|javascript:|onerror=|onload=|<iframe|<object|<embed',
    re.IGNORECASE
)


class UserRole(str, Enum):
    """User roles enum"""
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"
    READONLY = "readonly"


class SanitizationService:
    """Service for sanitizing user input"""
    
    @staticmethod
    def sanitize_html(text: str, allowed_tags: List[str] = None) -> str:
        """
        Sanitize HTML content to prevent XSS
        Only allows safe HTML tags if specified
        """
        if not text:
            return ""
        
        if allowed_tags is None:
            # Default: no HTML tags allowed
            return bleach.clean(text, tags=[], strip=True)
        
        # Allow only specified safe tags
        return bleach.clean(
            text,
            tags=allowed_tags,
            attributes={'a': ['href', 'title'], 'img': ['src', 'alt']},
            strip=True
        )
    
    @staticmethod
    def escape_html(text: str) -> str:
        """Escape HTML entities"""
        if not text:
            return ""
        return html.escape(text)
    
    @staticmethod
    def check_sql_injection(text: str) -> tuple[bool, str]:
        """
        Check for SQL injection patterns
        Returns (is_safe, error_message)
        """
        if not text:
            return True, ""
        
        if SQL_INJECTION_PATTERN.search(text):
            return False, "Input contains potentially dangerous SQL patterns"
        
        return True, ""
    
    @staticmethod
    def check_xss(text: str) -> tuple[bool, str]:
        """
        Check for XSS patterns
        Returns (is_safe, error_message)
        """
        if not text:
            return True, ""
        
        if XSS_PATTERN.search(text):
            return False, "Input contains potentially dangerous script patterns"
        
        return True, ""
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename to prevent path traversal"""
        if not filename:
            return ""
        
        # Remove path separators and dangerous characters
        filename = filename.replace('/', '').replace('\\', '').replace('..', '')
        filename = re.sub(r'[^\w\s.-]', '', filename)
        
        # Limit length
        return filename[:255]
    
    @staticmethod
    def validate_no_path_traversal(path: str) -> tuple[bool, str]:
        """
        Validate that path doesn't contain traversal attempts
        Returns (is_safe, error_message)
        """
        if not path:
            return True, ""
        
        dangerous_patterns = ['..', '~/', '/etc/', '/root/', '\\\\', 'c:\\']
        
        path_lower = path.lower()
        for pattern in dangerous_patterns:
            if pattern in path_lower:
                return False, f"Path contains dangerous pattern: {pattern}"
        
        return True, ""


# Validation Models
class UserRegistration(BaseModel):
    """User registration validation model"""
    username: constr(min_length=3, max_length=50, strip_whitespace=True)
    email: EmailStr
    password: constr(min_length=8, max_length=128)
    full_name: Optional[constr(min_length=1, max_length=200, strip_whitespace=True)] = None
    phone: Optional[str] = Field(None, max_length=20)
    
    @validator('username')
    def validate_username(cls, v):
        """Validate username format"""
        if not USERNAME_PATTERN.match(v):
            raise ValueError(
                'Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens'
            )
        
        # Check for SQL injection and XSS
        is_safe, error = SanitizationService.check_sql_injection(v)
        if not is_safe:
            raise ValueError(error)
        
        return v.lower()
    
    @validator('password')
    def validate_password(cls, v):
        """Validate password strength"""
        from app.core.security import password_service
        is_valid, error = password_service.validate_password_strength(v)
        if not is_valid:
            raise ValueError(error)
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number"""
        if v and not PHONE_PATTERN.match(v):
            raise ValueError('Invalid phone number format')
        return v
    
    @validator('full_name')
    def sanitize_full_name(cls, v):
        """Sanitize full name"""
        if not v:
            return v
        
        # Check for dangerous patterns
        is_safe, error = SanitizationService.check_xss(v)
        if not is_safe:
            raise ValueError(error)
        
        return SanitizationService.sanitize_html(v)


class UserLogin(BaseModel):
    """User login validation model"""
    username: constr(min_length=3, max_length=50, strip_whitespace=True)
    password: constr(min_length=8, max_length=128)
    mfa_token: Optional[constr(min_length=6, max_length=6)] = None
    
    @validator('username')
    def validate_username(cls, v):
        """Validate username"""
        # Check for injection attempts
        is_safe, error = SanitizationService.check_sql_injection(v)
        if not is_safe:
            raise ValueError("Invalid username format")
        
        return v.lower()


class UserUpdate(BaseModel):
    """User update validation model"""
    full_name: Optional[constr(min_length=1, max_length=200, strip_whitespace=True)] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    
    @validator('full_name')
    def sanitize_full_name(cls, v):
        """Sanitize full name"""
        if not v:
            return v
        return SanitizationService.sanitize_html(v)
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number"""
        if v and not PHONE_PATTERN.match(v):
            raise ValueError('Invalid phone number format')
        return v


class PasswordChange(BaseModel):
    """Password change validation model"""
    current_password: constr(min_length=8, max_length=128)
    new_password: constr(min_length=8, max_length=128)
    confirm_password: constr(min_length=8, max_length=128)
    
    @validator('new_password')
    def validate_new_password(cls, v, values):
        """Validate new password"""
        from app.core.security import password_service
        
        # Check if new password is different from current
        if 'current_password' in values and v == values['current_password']:
            raise ValueError('New password must be different from current password')
        
        # Validate strength
        is_valid, error = password_service.validate_password_strength(v)
        if not is_valid:
            raise ValueError(error)
        
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        """Ensure passwords match"""
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v


class MessageCreate(BaseModel):
    """Message creation validation model (for Kafka)"""
    topic: constr(min_length=1, max_length=200, strip_whitespace=True)
    key: Optional[constr(max_length=500)] = None
    value: Dict[str, Any]
    headers: Optional[Dict[str, str]] = None
    
    @validator('topic')
    def validate_topic(cls, v):
        """Validate topic name"""
        # Only allow alphanumeric, hyphens, underscores, and dots
        if not re.match(r'^[a-zA-Z0-9._-]+$', v):
            raise ValueError('Invalid topic name format')
        return v
    
    @validator('value')
    def validate_value(cls, v):
        """Validate message value"""
        # Ensure value is not too large (10MB limit)
        import json
        value_size = len(json.dumps(v).encode('utf-8'))
        if value_size > 10 * 1024 * 1024:  # 10MB
            raise ValueError('Message value exceeds 10MB limit')
        return v


class SearchQuery(BaseModel):
    """Search query validation model"""
    query: constr(min_length=1, max_length=500, strip_whitespace=True)
    limit: Optional[conint(ge=1, le=100)] = 10
    offset: Optional[conint(ge=0)] = 0
    filters: Optional[Dict[str, Any]] = None
    
    @validator('query')
    def sanitize_query(cls, v):
        """Sanitize search query"""
        # Check for SQL injection
        is_safe, error = SanitizationService.check_sql_injection(v)
        if not is_safe:
            raise ValueError("Invalid search query")
        
        # Check for XSS
        is_safe, error = SanitizationService.check_xss(v)
        if not is_safe:
            raise ValueError("Invalid search query")
        
        return SanitizationService.escape_html(v)


class FileUpload(BaseModel):
    """File upload validation model"""
    filename: constr(min_length=1, max_length=255, strip_whitespace=True)
    content_type: constr(min_length=1, max_length=100)
    size: conint(ge=1, le=10485760)  # Max 10MB
    
    @validator('filename')
    def sanitize_filename(cls, v):
        """Sanitize filename"""
        # Check for path traversal
        is_safe, error = SanitizationService.validate_no_path_traversal(v)
        if not is_safe:
            raise ValueError(error)
        
        return SanitizationService.sanitize_filename(v)
    
    @validator('content_type')
    def validate_content_type(cls, v):
        """Validate content type"""
        allowed_types = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'text/csv',
            'application/json', 'application/xml'
        ]
        
        if v not in allowed_types:
            raise ValueError(f'Content type {v} not allowed')
        
        return v


class APIKeyCreate(BaseModel):
    """API key creation validation model"""
    name: constr(min_length=1, max_length=100, strip_whitespace=True)
    scopes: List[str]
    expires_in_days: Optional[conint(ge=1, le=365)] = 90
    
    @validator('name')
    def sanitize_name(cls, v):
        """Sanitize API key name"""
        return SanitizationService.sanitize_html(v)
    
    @validator('scopes')
    def validate_scopes(cls, v):
        """Validate scopes"""
        allowed_scopes = ['read', 'write', 'delete', 'admin']
        
        if not v:
            raise ValueError('At least one scope is required')
        
        for scope in v:
            if scope not in allowed_scopes:
                raise ValueError(f'Invalid scope: {scope}')
        
        return list(set(v))  # Remove duplicates


class WebhookCreate(BaseModel):
    """Webhook creation validation model"""
    url: constr(min_length=1, max_length=500, strip_whitespace=True)
    events: List[str]
    secret: Optional[constr(min_length=16, max_length=128)] = None
    active: bool = True
    
    @validator('url')
    def validate_url(cls, v):
        """Validate webhook URL"""
        if not URL_PATTERN.match(v):
            raise ValueError('Invalid URL format')
        
        # Only allow HTTPS in production
        from app.core.config import is_production
        if is_production() and not v.startswith('https://'):
            raise ValueError('Webhook URL must use HTTPS in production')
        
        return v
    
    @validator('events')
    def validate_events(cls, v):
        """Validate webhook events"""
        allowed_events = [
            'user.created', 'user.updated', 'user.deleted',
            'message.sent', 'message.received', 'payment.completed'
        ]
        
        if not v:
            raise ValueError('At least one event is required')
        
        for event in v:
            if event not in allowed_events:
                raise ValueError(f'Invalid event: {event}')
        
        return list(set(v))


class PaginationParams(BaseModel):
    """Pagination parameters validation"""
    page: conint(ge=1) = 1
    page_size: conint(ge=1, le=100) = 20
    sort_by: Optional[constr(max_length=50)] = None
    sort_order: Optional[str] = "asc"
    
    @validator('sort_order')
    def validate_sort_order(cls, v):
        """Validate sort order"""
        if v and v.lower() not in ['asc', 'desc']:
            raise ValueError('sort_order must be "asc" or "desc"')
        return v.lower() if v else "asc"
    
    @validator('sort_by')
    def validate_sort_by(cls, v):
        """Validate sort_by field"""
        if v:
            # Only allow alphanumeric and underscores
            if not re.match(r'^[a-zA-Z0-9_]+$', v):
                raise ValueError('Invalid sort_by field name')
        return v


# Export sanitization service
sanitization_service = SanitizationService()
