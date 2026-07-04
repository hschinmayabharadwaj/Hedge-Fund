# Secure Backend API

A production-ready, secure, and scalable FastAPI backend with Apache Kafka, Redis, PostgreSQL, OAuth2/JWT authentication, comprehensive security features, and OWASP vulnerability mitigation.

## 🔐 Security Features

### Authentication & Authorization
- **OAuth2/JWT** - Industry-standard token-based authentication
- **Multi-Factor Authentication (MFA)** - TOTP-based 2FA with backup codes
- **Role-Based Access Control (RBAC)** - Fine-grained permissions system
- **Session Management** - Secure session tracking with automatic expiration
- **Password Security** - BCrypt hashing with strong password requirements

### Data Protection
- **Encryption at Rest** - Field-level encryption for sensitive data using Fernet
- **Encryption in Transit** - TLS/SSL for all connections
- **Message Encryption** - Kafka messages encrypted before transmission
- **Secure Token Storage** - Encrypted session tokens and API keys

### Input Validation & Sanitization
- **Pydantic Models** - Strict input validation with type checking
- **SQL Injection Prevention** - Parameterized queries and pattern detection
- **XSS Protection** - HTML sanitization and dangerous pattern filtering
- **Path Traversal Prevention** - Filename and path validation
- **File Upload Validation** - Content type and size restrictions

### Rate Limiting & DDoS Protection
- **Distributed Rate Limiting** - Redis-based token bucket algorithm
- **Multiple Time Windows** - Per-minute, per-hour, and per-day limits
- **Login Attempt Limiting** - Brute force protection with account lockout
- **Configurable Costs** - Higher costs for expensive operations

### Security Headers
- **HSTS** - HTTP Strict Transport Security
- **CSP** - Content Security Policy
- **X-Frame-Options** - Clickjacking protection
- **X-Content-Type-Options** - MIME sniffing protection
- **Referrer-Policy** - Referrer information control

### Monitoring & Auditing
- **Audit Logging** - Complete audit trail of all actions
- **Security Event Tracking** - Real-time security event detection
- **Prometheus Metrics** - Performance and security metrics
- **Structured Logging** - JSON logging for analysis

## 🏗️ Architecture

```
┌─────────────────┐
│   FastAPI App   │
│  (Rate Limited) │
└────────┬────────┘
         │
    ┌────┴────┬───────────┬──────────┐
    │         │           │          │
┌───┴───┐ ┌──┴───┐ ┌─────┴─────┐ ┌──┴─────┐
│  JWT  │ │Redis │ │PostgreSQL │ │ Kafka  │
│ Auth  │ │Cache │ │  Database │ │Message │
└───────┘ └──────┘ └───────────┘ └────────┘
```

### Technology Stack
- **FastAPI** - Modern, fast web framework
- **PostgreSQL** - Robust relational database
- **Redis** - In-memory cache and rate limiting
- **Apache Kafka** - Distributed event streaming
- **SQLAlchemy** - Async ORM with encryption
- **Pydantic** - Data validation and settings
- **Prometheus** - Metrics and monitoring

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Kafka 3.5+

### Installation

1. **Clone and navigate to backend directory**
```bash
cd "D:\pgsql fullstack\backend"
```

2. **Create environment file**
```bash
cp .env.example .env
```

3. **Generate encryption keys**
```python
from cryptography.fernet import Fernet

# Generate encryption keys
encryption_key = Fernet.generate_key()
field_encryption_key = Fernet.generate_key()

print(f"ENCRYPTION_KEY={encryption_key.decode()}")
print(f"FIELD_ENCRYPTION_KEY={field_encryption_key.decode()}")
```

4. **Update .env with your configuration**
```env
# Generate strong random strings for secrets
SECRET_KEY=your-secret-key-min-32-chars
JWT_SECRET_KEY=your-jwt-secret-key-min-32-chars
ENCRYPTION_KEY=your-fernet-encryption-key
FIELD_ENCRYPTION_KEY=your-field-encryption-key
```

5. **Start services with Docker Compose**
```bash
docker-compose up -d
```

6. **Initialize database**
```bash
docker-compose exec backend python -c "
from app.core.database import init_db
import asyncio
asyncio.run(init_db())
"
```

7. **Access the API**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Metrics: http://localhost:8000/metrics
- Prometheus: http://localhost:9090

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecureP@ssw0rd123!",
  "full_name": "John Doe",
  "phone": "+1234567890"
}
```

#### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecureP@ssw0rd123!",
  "mfa_token": "123456"  # Optional, required if MFA enabled
}

Response:
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### Enable MFA
```bash
POST /api/v1/auth/mfa/enable
Authorization: Bearer <access_token>

Response:
{
  "message": "MFA secret generated...",
  "secret": "BASE32SECRET",
  "uri": "otpauth://totp/...",
  "backup_codes": ["CODE1", "CODE2", ...]
}
```

### Secure API Endpoints

#### List Users (Admin Only)
```bash
GET /api/v1/users?page=1&page_size=20
Authorization: Bearer <access_token>
```

#### Send Message to Kafka
```bash
POST /api/v1/messages/send
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "topic": "events",
  "key": "event_123",
  "value": {
    "type": "user_action",
    "data": { "action": "login" }
  }
}
```

#### Search
```bash
POST /api/v1/search
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "query": "john",
  "limit": 10,
  "offset": 0
}
```

## 🔒 Security Best Practices

### Environment Configuration
1. **Never commit .env files**
2. **Use strong, unique secrets** (min 32 characters)
3. **Rotate keys regularly** (every 90 days recommended)
4. **Enable HTTPS in production**
5. **Use secure Redis password**
6. **Configure Kafka SSL/SASL**

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- At least 1 special character
- No common passwords

### Rate Limits (Default)
- 60 requests per minute
- 1000 requests per hour
- 10000 requests per day
- Higher costs for expensive operations

### Database Security
- All sensitive fields encrypted
- Password hashing with BCrypt (12 rounds)
- Parameterized queries prevent SQL injection
- Audit logging for all operations

## 🛡️ OWASP Top 10 Mitigation

### A01:2021 - Broken Access Control
✅ Role-based access control (RBAC)
✅ Permission checks on all endpoints
✅ Session management with expiration

### A02:2021 - Cryptographic Failures
✅ Fernet encryption for data at rest
✅ TLS/SSL for data in transit
✅ Secure key management
✅ BCrypt for password hashing

### A03:2021 - Injection
✅ Parameterized SQL queries
✅ Input validation with Pydantic
✅ SQL injection pattern detection
✅ XSS sanitization

### A04:2021 - Insecure Design
✅ Security-by-design architecture
✅ Threat modeling implemented
✅ Secure development lifecycle

### A05:2021 - Security Misconfiguration
✅ Secure default configuration
✅ Security headers enforced
✅ Minimal error disclosure
✅ Regular security updates

### A06:2021 - Vulnerable Components
✅ Dependency scanning
✅ Regular updates
✅ Version pinning

### A07:2021 - Authentication Failures
✅ Strong password requirements
✅ MFA support
✅ Account lockout
✅ Secure session management

### A08:2021 - Data Integrity Failures
✅ Message encryption
✅ Digital signatures
✅ Integrity verification

### A09:2021 - Security Logging
✅ Comprehensive audit logging
✅ Security event tracking
✅ Centralized logging
✅ Log integrity protection

### A10:2021 - Server-Side Request Forgery
✅ URL validation
✅ Allowlist for external requests
✅ Network segmentation

## 📊 Monitoring

### Prometheus Metrics
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration histogram
- `security_events_total` - Security events counter

### Health Checks
```bash
GET /health
```

### Audit Logs
All user actions are logged with:
- User ID and username
- Action type (CREATE, READ, UPDATE, DELETE, LOGIN, etc.)
- Resource type and ID
- IP address and user agent
- Timestamp
- Success/failure status

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov

# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

## 🚢 Deployment

### Production Checklist
- [ ] Set `ENVIRONMENT=production` in .env
- [ ] Set `DEBUG=False`
- [ ] Use strong, unique secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up SSL for Redis
- [ ] Configure Kafka SSL/SASL
- [ ] Enable all security headers
- [ ] Set up log aggregation
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts
- [ ] Disable /docs and /redoc endpoints

### Docker Deployment
```bash
# Build production image
docker build -t secure-backend:latest .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment
```bash
# Create namespace
kubectl create namespace secure-backend

# Apply manifests
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n secure-backend
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For security issues, please email: security@yourdomain.com

For general support: support@yourdomain.com
