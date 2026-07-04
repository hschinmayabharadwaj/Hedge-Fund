# Security Guide

## Table of Contents
- [Overview](#overview)
- [Security Architecture](#security-architecture)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [Input Validation](#input-validation)
- [Rate Limiting](#rate-limiting)
- [Audit Logging](#audit-logging)
- [Security Monitoring](#security-monitoring)
- [Incident Response](#incident-response)
- [Security Checklist](#security-checklist)

## Overview

This security guide provides comprehensive information about the security measures implemented in this FastAPI backend application. The system is designed to be secure by default and follows industry best practices and OWASP guidelines.

## Security Architecture

### Defense in Depth
The application implements multiple layers of security:

```
┌─────────────────────────────────────────┐
│         Security Headers (HSTS, CSP)    │
├─────────────────────────────────────────┤
│         Rate Limiting (Redis)           │
├─────────────────────────────────────────┤
│    Authentication (OAuth2/JWT + MFA)    │
├─────────────────────────────────────────┤
│    Authorization (RBAC Permissions)     │
├─────────────────────────────────────────┤
│    Input Validation (Pydantic)          │
├─────────────────────────────────────────┤
│    SQL Injection Prevention             │
├─────────────────────────────────────────┤
│    XSS Protection (Sanitization)        │
├─────────────────────────────────────────┤
│    Data Encryption (Fernet)             │
├─────────────────────────────────────────┤
│    Audit Logging (Complete Trail)       │
└─────────────────────────────────────────┘
```

### Network Security
- TLS/SSL for all connections
- Secure WebSocket (WSS)
- Network segmentation via Docker networks
- Firewall rules for port access

## Authentication & Authorization

### OAuth2 with JWT
**Token Structure:**
```json
{
  "sub": "username",
  "user_id": 123,
  "scopes": ["read", "write", "admin"],
  "exp": 1234567890,
  "iat": 1234567800,
  "type": "access"
}
```

**Token Lifecycle:**
- Access Token: 30 minutes (default)
- Refresh Token: 7 days (default)
- Tokens stored in database with session tracking
- Automatic expiration and cleanup

**Security Features:**
- HS256 algorithm (configurable)
- Secret key rotation support
- Token revocation via session invalidation
- Secure token storage with encryption

### Multi-Factor Authentication (MFA)

**TOTP Implementation:**
```python
# Enable MFA flow
1. User requests MFA setup
2. System generates secret key
3. System generates QR code URI
4. System generates 10 backup codes
5. User scans QR code with authenticator app
6. User verifies with 6-digit token
7. MFA enabled
```

**Backup Codes:**
- 10 single-use codes generated
- Encrypted in database
- Removed after use
- Can be regenerated

**Authenticator Apps Supported:**
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Any TOTP-compatible app

### Role-Based Access Control (RBAC)

**Default Roles:**
- `admin` - Full system access
- `user` - Standard user access
- `moderator` - Moderation capabilities
- `readonly` - Read-only access

**Permission Model:**
```python
# Example permission check
@router.get("/admin/users")
async def admin_users(
    current_user: TokenData = Security(get_current_user, scopes=["admin"])
):
    # Only accessible to users with 'admin' scope
    pass
```

**Fine-Grained Permissions:**
- Resource-level permissions
- Action-based permissions (read, write, delete)
- Custom permission combinations
- Permission inheritance

## Data Protection

### Encryption at Rest

**Field-Level Encryption:**
```python
# Encrypted fields in User model
class User(Base):
    _full_name = Column("full_name", Text)  # Encrypted
    _phone = Column("phone", Text)  # Encrypted
    _mfa_secret = Column("mfa_secret", Text)  # Encrypted
    
    @property
    def full_name(self):
        return encryption_service.decrypt_field(self._full_name)
```

**Encryption Algorithm:**
- Fernet (symmetric encryption)
- AES-128 in CBC mode with PKCS7 padding
- HMAC for authentication
- Timestamp for TTL support

**Key Management:**
- Separate keys for different data types
- Environment variable storage
- Key rotation procedure documented
- Encrypted key storage in production

### Encryption in Transit

**TLS/SSL Configuration:**
```yaml
# Production settings
- TLS 1.3 minimum
- Strong cipher suites only
- HSTS enabled (max-age: 31536000)
- Certificate pinning recommended
```

**Database Connections:**
```python
# PostgreSQL SSL
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db?ssl=require

# Redis SSL
REDIS_SSL=True
REDIS_SSL_CERT_REQS=required
```

**Kafka Security:**
```python
# SSL/SASL configuration
KAFKA_SECURITY_PROTOCOL=SASL_SSL
KAFKA_SASL_MECHANISM=SCRAM-SHA-256
KAFKA_SSL_CA_LOCATION=/path/to/ca-cert
```

### Message Encryption

**Kafka Message Encryption:**
```python
# Message structure
{
    "data": {
        # Actual message content
    },
    "metadata": {
        "timestamp": "2024-01-01T00:00:00Z",
        "encrypted": true,
        "version": "1.0"
    }
}
# Entire message encrypted with Fernet
```

## Input Validation

### Pydantic Models

**Validation Example:**
```python
class UserRegistration(BaseModel):
    username: constr(min_length=3, max_length=50, strip_whitespace=True)
    email: EmailStr
    password: constr(min_length=8, max_length=128)
    
    @validator('username')
    def validate_username(cls, v):
        # Check for SQL injection patterns
        # Check for XSS patterns
        # Validate format
        return v
```

### SQL Injection Prevention

**Parameterized Queries:**
```python
# ✅ SAFE - Parameterized
result = await db.execute(
    select(User).where(User.username == username)
)

# ❌ UNSAFE - String concatenation
query = f"SELECT * FROM users WHERE username = '{username}'"
```

**Pattern Detection:**
```python
# Dangerous patterns blocked
SQL_INJECTION_PATTERN = re.compile(
    r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)|"
    r"(--|;|'|\"|\*|\/\*|\*\/)",
    re.IGNORECASE
)
```

### XSS Protection

**HTML Sanitization:**
```python
# Bleach library for sanitization
sanitized = bleach.clean(
    text,
    tags=[],  # No HTML tags allowed by default
    strip=True
)
```

**Content Security Policy:**
```http
Content-Security-Policy: 
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    frame-ancestors 'none';
```

### File Upload Security

**Validation:**
```python
class FileUpload(BaseModel):
    filename: constr(min_length=1, max_length=255)
    content_type: constr(min_length=1, max_length=100)
    size: conint(ge=1, le=10485760)  # Max 10MB
    
    @validator('filename')
    def sanitize_filename(cls, v):
        # Remove path separators
        # Check for path traversal
        # Validate extension
        return sanitized_filename
```

**Allowed Content Types:**
- Images: jpeg, png, gif, webp
- Documents: pdf, txt, csv
- Data: json, xml

## Rate Limiting

### Token Bucket Algorithm

**Implementation:**
```python
# Redis-based distributed rate limiting
key = f"rate_limit:{user_id}:{window_seconds}"
current_count = redis.get(key)

if current_count + cost > max_requests:
    # Rate limit exceeded
    raise HTTPException(status_code=429)

redis.incrby(key, cost)
redis.expire(key, window_seconds)
```

### Rate Limit Configuration

**Default Limits:**
```python
RATE_LIMIT_PER_MINUTE = 60
RATE_LIMIT_PER_HOUR = 1000
RATE_LIMIT_PER_DAY = 10000
```

**Endpoint-Specific Limits:**
```python
@router.post("/expensive-operation")
@rate_limit(cost=5)  # Costs 5 tokens
async def expensive_op():
    pass

@router.post("/login")
@rate_limit(cost=2)  # Costs 2 tokens
async def login():
    pass
```

### Brute Force Protection

**Login Attempt Limiting:**
```python
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15

# After 5 failed attempts
# Account locked for 15 minutes
```

## Audit Logging

### Audit Trail

**Logged Events:**
- All authentication events (login, logout, failures)
- Data access (read operations)
- Data modifications (create, update, delete)
- Permission changes
- Configuration changes
- Security events

**Audit Log Structure:**
```python
{
    "id": 123,
    "user_id": 456,
    "action": "UPDATE",
    "resource_type": "user",
    "resource_id": 789,
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "request_method": "PUT",
    "request_path": "/api/v1/users/789",
    "changes": {"email": "old@example.com -> new@example.com"},
    "success": true,
    "timestamp": "2024-01-01T00:00:00Z"
}
```

### Security Events

**Event Types:**
- `auth_failure` - Authentication failures
- `permission_denied` - Authorization failures
- `rate_limit_exceeded` - Rate limit violations
- `suspicious_activity` - Anomalous behavior
- `data_breach_attempt` - Potential breach attempts

**Event Severity Levels:**
- `low` - Informational events
- `medium` - Potential security issues
- `high` - Confirmed security issues
- `critical` - Active attacks or breaches

## Security Monitoring

### Prometheus Metrics

**Security Metrics:**
```python
# Request metrics
http_requests_total{method="POST", endpoint="/api/v1/login", status="401"}

# Security event metrics
security_events_total{event_type="auth_failure"}
security_events_total{event_type="rate_limit_exceeded"}

# Performance metrics
http_request_duration_seconds{method="GET", endpoint="/api/v1/users"}
```

### Real-Time Monitoring

**Alerts to Configure:**
1. High rate of authentication failures
2. Unusual traffic patterns
3. Repeated rate limit violations
4. SQL injection attempts
5. XSS attack attempts
6. Unusual data access patterns
7. Multiple failed login attempts
8. Suspicious IP addresses

## Incident Response

### Security Incident Procedure

**1. Detection**
- Monitor security events dashboard
- Review audit logs regularly
- Set up automated alerts

**2. Analysis**
```bash
# Check recent failed logins
GET /api/v1/audit-logs?action=LOGIN_FAILED&limit=100

# Check security events
GET /api/v1/security-events?severity=high&resolved=false
```

**3. Containment**
```python
# Disable compromised user account
user.status = UserStatus.SUSPENDED
user.locked_until = datetime.utcnow() + timedelta(hours=24)

# Invalidate all user sessions
await db.execute(
    update(UserSession)
    .where(UserSession.user_id == user.id)
    .values(is_active=False)
)
```

**4. Recovery**
- Force password reset
- Revoke API keys
- Rotate encryption keys if necessary
- Review and patch vulnerabilities

**5. Post-Incident**
- Document incident
- Update security measures
- Notify affected users if required
- Conduct security review

### Emergency Contacts

```
Security Team: security@yourdomain.com
On-Call Engineer: +1-XXX-XXX-XXXX
Incident Response: incidents@yourdomain.com
```

## Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] Strong passwords for all services
- [ ] TLS/SSL certificates configured
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Rate limiting enabled
- [ ] Audit logging enabled
- [ ] MFA enabled for admin accounts
- [ ] Database backups configured
- [ ] Monitoring and alerts set up

### Regular Maintenance

- [ ] Review audit logs weekly
- [ ] Check security events daily
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Security audit annually
- [ ] Penetration testing annually
- [ ] Review user permissions quarterly
- [ ] Update incident response plan annually

### Monitoring

- [ ] Monitor failed login attempts
- [ ] Monitor rate limit violations
- [ ] Monitor unusual access patterns
- [ ] Monitor system performance
- [ ] Monitor error rates
- [ ] Monitor security events

### Code Reviews

- [ ] Input validation for all user inputs
- [ ] Parameterized queries for all database operations
- [ ] Proper error handling
- [ ] No sensitive data in logs
- [ ] No hardcoded secrets
- [ ] Proper authentication checks
- [ ] Proper authorization checks
- [ ] Rate limiting on sensitive endpoints

## Additional Resources

### Security Standards
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

### Best Practices
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/)
- [GDPR Compliance](https://gdpr.eu/)

### Tools
- [OWASP ZAP](https://www.zaproxy.org/) - Security scanning
- [Bandit](https://bandit.readthedocs.io/) - Python security linter
- [Safety](https://pyup.io/safety/) - Dependency vulnerability scanning

## Security Reporting

If you discover a security vulnerability, please email security@yourdomain.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Please do not:**
- Open public GitHub issues for security vulnerabilities
- Disclose the vulnerability publicly before it's fixed
- Exploit the vulnerability beyond proof-of-concept

We commit to:
- Acknowledge receipt within 24 hours
- Provide initial assessment within 72 hours
- Keep you informed of progress
- Credit you in security advisories (if desired)
