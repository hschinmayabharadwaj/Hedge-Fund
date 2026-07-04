# Full-Stack Secure Application

A production-ready, secure, and scalable full-stack application with FastAPI backend, Next.js frontend, Apache Kafka messaging, and Redis caching.

## 📁 Project Structure

```
D:\pgsql fullstack\
├── backend/          # FastAPI Backend API
│   ├── app/         # Application code
│   ├── Dockerfile   # Backend container
│   ├── docker-compose.yml
│   └── README.md    # Backend documentation
│
└── frontend/        # Next.js Frontend Application
    ├── src/         # Source code
    ├── Dockerfile   # Frontend container
    ├── docker-compose.yml
    └── README.md    # Frontend documentation
```

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (for containerized deployment)
- **Python 3.11+** (for backend development)
- **Node.js 18+** (for frontend development)

### Option 1: Docker (Recommended)

#### Start Backend Services
```bash
cd backend
docker-compose up -d
```
Backend will be available at: http://localhost:8000

#### Start Frontend
```bash
cd frontend
docker-compose up -d
```
Frontend will be available at: http://localhost:3000

### Option 2: Local Development

#### Backend Setup
```bash
cd backend

# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

#### Frontend Setup
```bash
cd frontend

# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Client Layer                        │
│           (Browser, Mobile, Desktop)                 │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────┐
│              Next.js Frontend (Port 3000)            │
│  • React 18 + Next.js 14                            │
│  • Real-time Market Monitoring                       │
│  • AI-Powered Predictions                            │
│  • TailwindCSS + Custom Components                   │
└────────────────────┬────────────────────────────────┘
                     │ REST API / WebSocket
                     ▼
┌─────────────────────────────────────────────────────┐
│            FastAPI Backend (Port 8000)               │
│  • OAuth2/JWT Authentication + MFA                   │
│  • Role-Based Access Control (RBAC)                  │
│  • Rate Limiting & Security Headers                  │
│  • Input Validation & Sanitization                   │
│  • Comprehensive Audit Logging                       │
└──────┬───────────┬───────────┬──────────────────────┘
       │           │           │
       ▼           ▼           ▼
┌───────────┐ ┌─────────┐ ┌──────────┐
│PostgreSQL │ │  Redis  │ │  Kafka   │
│ Database  │ │  Cache  │ │ Message  │
│           │ │  Rate   │ │  Queue   │
│ Port 5432 │ │Limiting │ │Port 9092 │
└───────────┘ └─────────┘ └──────────┘
                Port 6379
```

## 🔐 Security Features

### Backend Security
✅ **Authentication & Authorization**
- OAuth2 with JWT tokens
- Multi-Factor Authentication (TOTP)
- Role-Based Access Control (RBAC)
- Session management

✅ **Data Protection**
- Field-level encryption (Fernet)
- Password hashing (BCrypt, 12 rounds)
- Message encryption (Kafka)
- TLS/SSL support

✅ **Attack Prevention**
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting (Redis)
- Brute force protection
- Path traversal prevention

✅ **Monitoring & Logging**
- Complete audit trail
- Security event tracking
- Prometheus metrics
- Real-time monitoring

✅ **OWASP Top 10 Compliance**
- All vulnerabilities addressed
- Security-by-design architecture
- Regular security updates

### Frontend Security
✅ Secure API integration
✅ Token-based authentication
✅ Input validation
✅ XSS prevention
✅ Secure session handling

## 📊 Tech Stack

### Backend
- **Framework:** FastAPI 0.104+
- **Database:** PostgreSQL 15+
- **Cache:** Redis 7+
- **Message Queue:** Apache Kafka 3.5+
- **Authentication:** OAuth2/JWT
- **ORM:** SQLAlchemy 2.0+ (async)
- **Monitoring:** Prometheus

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** TailwindCSS 3
- **State Management:** Zustand
- **Real-time:** WebSocket
- **ORM:** Prisma (optional)

### DevOps
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **CI/CD:** GitHub Actions (configurable)
- **Monitoring:** Prometheus + Grafana

## 📚 Documentation

### Backend Documentation
- [Backend README](./backend/README.md) - Setup and usage
- [Security Guide](./backend/SECURITY.md) - Security details
- [API Reference](./backend/API.md) - API documentation
- [Architecture](./backend/ARCHITECTURE.md) - Technical design

### Frontend Documentation
- [Frontend README](./frontend/README.md) - Setup and usage
- [Project Summary](./frontend/PROJECT_SUMMARY.md) - Overview

## 🔧 Configuration

### Backend Configuration
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
- `SECRET_KEY` - Application secret
- `JWT_SECRET_KEY` - JWT signing key
- `ENCRYPTION_KEY` - Fernet encryption key
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `KAFKA_BOOTSTRAP_SERVERS` - Kafka brokers

### Frontend Configuration
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL
- `DATABASE_URL` - Database (if using Prisma)

## 🎯 Features

### Backend Features
- ✅ User authentication with MFA
- ✅ Role-based authorization
- ✅ Secure message queue (Kafka)
- ✅ Distributed rate limiting
- ✅ Comprehensive audit logging
- ✅ Real-time WebSocket support
- ✅ Field-level encryption
- ✅ API key management
- ✅ Prometheus metrics

### Frontend Features
- ✅ Real-time market monitoring
- ✅ AI-powered predictions
- ✅ Interactive data visualization
- ✅ Responsive design
- ✅ Dark mode support
- ✅ User dashboard
- ✅ Authentication UI
- ✅ WebSocket integration

## 🚀 Deployment

### Development
```bash
# Backend
cd backend && docker-compose up -d

# Frontend
cd frontend && npm run dev
```

### Production

#### Using Docker Compose
```bash
# Build and start all services
docker-compose up -d
```

#### Using Docker
```bash
# Backend
cd backend
docker build -t backend:latest .
docker run -p 8000:8000 backend:latest

# Frontend
cd frontend
docker build -t frontend:latest .
docker run -p 3000:3000 frontend:latest
```

#### Manual Deployment
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Frontend
cd frontend
npm install
npm run build
npm start
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:e2e
```

## 📈 Monitoring

### Prometheus Metrics
- Backend: http://localhost:8000/metrics
- Frontend: http://localhost:3000/metrics (if configured)

### Health Checks
- Backend: http://localhost:8000/health
- Frontend: http://localhost:3000/

### Logs
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend
```

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users` - List users (Admin)
- `GET /api/v1/users/{id}` - Get user
- `DELETE /api/v1/users/{id}` - Delete user (Admin)

### Messaging
- `POST /api/v1/messages/send` - Send Kafka message

### Monitoring
- `GET /api/v1/audit-logs` - Audit logs (Admin)
- `GET /api/v1/security-events` - Security events (Admin)

For complete API documentation, see [API.md](./backend/API.md)

## 🛠️ Development

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## 📦 Project Statistics

### Backend
- **Python Files:** 11
- **Lines of Code:** ~3,500
- **API Endpoints:** 18+
- **Security Features:** 25+

### Frontend
- **Components:** 10+
- **Pages:** 5+
- **Utilities:** 7
- **State Stores:** 1+

### Total
- **Files Created:** 50+
- **Total Lines:** ~10,000+
- **Documentation:** 6 comprehensive guides

## ✅ Production Checklist

### Backend
- [ ] Configure production secrets
- [ ] Enable HTTPS/TLS
- [ ] Set up database backups
- [ ] Configure monitoring alerts
- [ ] Set up log aggregation
- [ ] Review security settings
- [ ] Test authentication flows
- [ ] Verify rate limiting
- [ ] Check audit logging

### Frontend
- [ ] Update API URLs for production
- [ ] Configure CDN for assets
- [ ] Enable production optimizations
- [ ] Set up error tracking
- [ ] Configure analytics
- [ ] Test responsive design
- [ ] Verify API integration
- [ ] Check performance metrics

## 🆘 Troubleshooting

### Backend Issues
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Reset database
docker-compose down -v
docker-compose up -d
```

### Frontend Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Check frontend logs
docker-compose logs frontend
```

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Verify network connectivity
- Check firewall rules

### Redis Connection Issues
- Verify REDIS_URL is correct
- Check Redis is running
- Verify password (if configured)

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📧 Support

- **Backend Issues:** See [backend/README.md](./backend/README.md)
- **Frontend Issues:** See [frontend/README.md](./frontend/README.md)
- **Security Issues:** security@yourdomain.com
- **General Support:** support@yourdomain.com

## 🎉 Quick Links

- **Backend API Docs:** http://localhost:8000/docs
- **Backend Health:** http://localhost:8000/health
- **Backend Metrics:** http://localhost:8000/metrics
- **Frontend App:** http://localhost:3000
- **Prometheus:** http://localhost:9090

---

## 🚀 Get Started Now!

### Windows Users:
```cmd
cd backend
start.bat

cd ..\frontend
start.bat
```

### Linux/Mac Users:
```bash
cd backend
./start.sh

cd ../frontend
./start.sh
```

### Using Docker:
```bash
# Start all services
cd backend
docker-compose up -d

cd ../frontend
npm run dev
```

---

**Project Structure:** Both frontend and backend are now properly organized in separate directories with complete documentation, configuration, and deployment setup.

**Next Steps:**
1. Configure environment variables in both directories
2. Start backend services
3. Start frontend application
4. Access the application at http://localhost:3000
5. Read the documentation for detailed information

For detailed setup and usage instructions, see the README files in each directory.
