# API Documentation

## Base URL
```
Development: http://localhost:8000
Production: https://api.yourdomain.com
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```http
Authorization: Bearer <access_token>
```

## Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Success message"
}
```

### Error Response
```json
{
  "detail": "Error message",
  "errors": [...]  // Optional validation errors
}
```

## Rate Limiting

Rate limit information is included in response headers:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1234567890
Retry-After: 60  // Only on 429 responses
```

## Endpoints

### Authentication

#### POST /api/v1/auth/register
Register a new user account.

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecureP@ssw0rd123!",
  "full_name": "John Doe",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "status": "active",
    "mfa_enabled": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Errors:**
- `400` - Validation error or user already exists
- `422` - Invalid input data
- `429` - Rate limit exceeded

---

#### POST /api/v1/auth/login
Authenticate and receive access tokens.

**Request:**
```json
{
  "username": "john_doe",
  "password": "SecureP@ssw0rd123!",
  "mfa_token": "123456"  // Required if MFA enabled
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Errors:**
- `401` - Invalid credentials or MFA token
- `403` - Account locked, suspended, or MFA required
- `429` - Too many failed login attempts

---

#### POST /api/v1/auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

---

#### POST /api/v1/auth/logout
Logout and invalidate current session.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

---

#### GET /api/v1/auth/me
Get current user information.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "status": "active",
  "mfa_enabled": true,
  "last_login": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### PUT /api/v1/auth/me
Update current user information.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "full_name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+1234567890"
}
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john.smith@example.com",
  "full_name": "John Smith",
  "status": "active"
}
```

---

#### POST /api/v1/auth/change-password
Change user password.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "current_password": "OldP@ssw0rd123!",
  "new_password": "NewP@ssw0rd456!",
  "confirm_password": "NewP@ssw0rd456!"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully. Please login again."
}
```

---

### Multi-Factor Authentication

#### POST /api/v1/auth/mfa/enable
Enable MFA for current user.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "MFA secret generated. Scan QR code and verify to complete setup.",
  "secret": "JBSWY3DPEHPK3PXP",
  "uri": "otpauth://totp/SecureBackendAPI:john_doe?secret=JBSWY3DPEHPK3PXP&issuer=SecureBackendAPI",
  "backup_codes": [
    "A1B2C3D4",
    "E5F6G7H8",
    "I9J0K1L2",
    "M3N4O5P6",
    "Q7R8S9T0",
    "U1V2W3X4",
    "Y5Z6A7B8",
    "C9D0E1F2",
    "G3H4I5J6",
    "K7L8M9N0"
  ]
}
```

---

#### POST /api/v1/auth/mfa/verify
Verify MFA token and complete MFA setup.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `token` (required) - 6-digit TOTP token

**Response (200):**
```json
{
  "message": "MFA enabled successfully"
}
```

---

#### POST /api/v1/auth/mfa/disable
Disable MFA for current user.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `password` (required) - Current password for verification

**Response (200):**
```json
{
  "message": "MFA disabled successfully"
}
```

---

### User Management

#### GET /api/v1/users
List all users (Admin only).

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `page_size` (optional) - Items per page (default: 20, max: 100)
- `sort_by` (optional) - Sort field (e.g., "username", "created_at")
- `sort_order` (optional) - Sort order ("asc" or "desc")

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 100,
    "pages": 5
  }
}
```

**Required Scopes:** `admin` or `read`

---

#### GET /api/v1/users/{user_id}
Get user by ID.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "status": "active",
  "mfa_enabled": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `403` - Not enough permissions
- `404` - User not found

---

#### DELETE /api/v1/users/{user_id}
Delete user (Admin only).

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

**Required Scopes:** `admin`

---

### Messaging

#### POST /api/v1/messages/send
Send message to Kafka topic.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "topic": "events",
  "key": "event_123",
  "value": {
    "type": "user_action",
    "action": "login",
    "timestamp": "2024-01-01T00:00:00Z",
    "metadata": {
      "user_id": 1,
      "ip_address": "192.168.1.1"
    }
  },
  "headers": {
    "correlation_id": "abc123",
    "source": "api"
  }
}
```

**Response (200):**
```json
{
  "message": "Message sent successfully",
  "topic": "secure-app.events"
}
```

**Required Scopes:** `write`

**Notes:**
- Messages are encrypted by default
- Maximum message size: 10MB
- User context automatically added to messages

---

### Search

#### POST /api/v1/search
Search across resources.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "query": "john",
  "limit": 10,
  "offset": 0,
  "filters": {
    "status": "active"
  }
}
```

**Response (200):**
```json
{
  "results": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "status": "active"
    }
  ],
  "query": "john",
  "count": 1
}
```

**Required Scopes:** `read`

---

### Audit Logs

#### GET /api/v1/audit-logs
Get audit logs (Admin only).

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional) - Page number
- `page_size` (optional) - Items per page
- `action` (optional) - Filter by action type
- `user_id` (optional) - Filter by user ID

**Response (200):**
```json
{
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "action": "LOGIN",
      "resource_type": null,
      "resource_id": null,
      "ip_address": "192.168.1.1",
      "success": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1000,
    "pages": 50
  }
}
```

**Required Scopes:** `admin`

---

### Security Events

#### GET /api/v1/security-events
Get security events (Admin only).

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional) - Page number
- `page_size` (optional) - Items per page
- `severity` (optional) - Filter by severity (low, medium, high, critical)
- `resolved` (optional) - Filter by resolution status

**Response (200):**
```json
{
  "events": [
    {
      "id": 1,
      "event_type": "failed_login_attempt",
      "severity": "medium",
      "description": "Multiple failed login attempts detected",
      "user_id": 1,
      "ip_address": "192.168.1.1",
      "resolved": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 50,
    "pages": 3
  }
}
```

**Required Scopes:** `admin`

---

### Health & Monitoring

#### GET /health
System health check (No authentication required).

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

#### GET /metrics
Prometheus metrics endpoint.

**Response (200):**
```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",endpoint="/api/v1/users",status="200"} 42

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",endpoint="/api/v1/users",le="0.1"} 40
...
```

---

## Error Codes

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable

### Error Detail Codes

```json
{
  "detail": {
    "error": "rate_limit_exceeded",
    "limit": 60,
    "retry_after": 45,
    "window": "minute"
  }
}
```

## Webhooks

Webhooks can be configured to receive real-time notifications for events.

### Webhook Payload
```json
{
  "event": "user.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  },
  "signature": "sha256=..."
}
```

### Signature Verification
```python
import hmac
import hashlib

def verify_webhook_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

## SDK Examples

### Python
```python
import requests

class SecureAPIClient:
    def __init__(self, base_url, access_token=None):
        self.base_url = base_url
        self.access_token = access_token
        
    def login(self, username, password, mfa_token=None):
        response = requests.post(
            f"{self.base_url}/api/v1/auth/login",
            json={
                "username": username,
                "password": password,
                "mfa_token": mfa_token
            }
        )
        data = response.json()
        self.access_token = data["access_token"]
        return data
    
    def get_users(self, page=1, page_size=20):
        response = requests.get(
            f"{self.base_url}/api/v1/users",
            params={"page": page, "page_size": page_size},
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        return response.json()

# Usage
client = SecureAPIClient("http://localhost:8000")
client.login("john_doe", "SecureP@ssw0rd123!")
users = client.get_users()
```

### JavaScript
```javascript
class SecureAPIClient {
  constructor(baseURL, accessToken = null) {
    this.baseURL = baseURL;
    this.accessToken = accessToken;
  }
  
  async login(username, password, mfaToken = null) {
    const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, mfa_token: mfaToken })
    });
    const data = await response.json();
    this.accessToken = data.access_token;
    return data;
  }
  
  async getUsers(page = 1, pageSize = 20) {
    const response = await fetch(
      `${this.baseURL}/api/v1/users?page=${page}&page_size=${pageSize}`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }
    );
    return await response.json();
  }
}

// Usage
const client = new SecureAPIClient('http://localhost:8000');
await client.login('john_doe', 'SecureP@ssw0rd123!');
const users = await client.getUsers();
```
