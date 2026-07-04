@echo off
REM Secure Backend Quick Start Script for Windows

echo.
echo ================================
echo Secure Backend API - Quick Start
echo ================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if .env file exists
if not exist .env (
    echo [INFO] Creating .env file from template...
    copy .env.example .env
    
    echo.
    echo [WARNING] IMPORTANT: Generate encryption keys
    echo Run this Python command to generate keys:
    echo.
    echo python -c "from cryptography.fernet import Fernet; print('ENCRYPTION_KEY=' + Fernet.generate_key().decode()); print('FIELD_ENCRYPTION_KEY=' + Fernet.generate_key().decode())"
    echo.
    echo Then update the keys in the .env file
    echo.
    pause
) else (
    echo [OK] .env file exists
)

echo.
echo [INFO] Starting services...
echo.

REM Start services
docker-compose up -d

echo.
echo [INFO] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo [SUCCESS] Services are running:
echo.
echo API:        http://localhost:8000
echo Docs:       http://localhost:8000/docs
echo Health:     http://localhost:8000/health
echo Metrics:    http://localhost:8000/metrics
echo Prometheus: http://localhost:9090
echo.
echo View logs:
echo    docker-compose logs -f backend
echo.
echo Stop services:
echo    docker-compose down
echo.
echo Next steps:
echo    1. Create a user: POST /api/v1/auth/register
echo    2. Login: POST /api/v1/auth/login
echo    3. Access protected endpoints with Bearer token
echo.
echo Read the documentation:
echo    - README.md - General documentation
echo    - SECURITY.md - Security guide
echo    - API.md - API reference
echo.
pause
