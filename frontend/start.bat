@echo off
REM Frontend Quick Start Script for Windows

echo.
echo ================================
echo Frontend Application - Quick Start
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Check if npm is installed
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [OK] npm is installed
npm --version
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo [INFO] Installing dependencies...
    echo.
    npm install
    echo.
) else (
    echo [OK] Dependencies already installed
)

REM Check if .env file exists
if not exist .env (
    echo [INFO] Creating .env file from template...
    copy .env.example .env
    echo.
    echo [WARNING] Please update the .env file with your configuration
    echo.
    pause
) else (
    echo [OK] .env file exists
)

echo.
echo [INFO] Starting development server...
echo.

REM Start development server
start npm run dev

echo.
echo [SUCCESS] Development server is starting...
echo.
echo Frontend:  http://localhost:3000
echo.
echo Press Ctrl+C in the new window to stop the server
echo.
pause
