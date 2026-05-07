@echo off
setlocal
set "PROJECT_ROOT=%~dp0"

echo ========================================
echo Starting Online Shop Services...
echo ========================================

:: Check for backend directory
if not exist "%PROJECT_ROOT%backend" (
    echo [ERROR] Backend directory not found at %PROJECT_ROOT%backend
    pause
    exit /b 1
)

:: Check for frontend directory
if not exist "%PROJECT_ROOT%frontend" (
    echo [ERROR] Frontend directory not found at %PROJECT_ROOT%frontend
    pause
    exit /b 1
)

:: Start Backend
echo [1/2] Starting Backend (Port 8080)...
start "Online Shop - Backend" /D "%PROJECT_ROOT%backend" cmd /k "mvn spring-boot:run"

:: Start Frontend
echo [2/2] Starting Frontend (Port 80)...
start "Online Shop - Frontend" /D "%PROJECT_ROOT%frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Services are starting in separate windows.
echo Frontend: http://localhost:80  (Network: http://192.168.0.105:80)
echo Backend:  http://localhost:8080 (Network: http://192.168.0.105:8080)
echo ========================================
echo.
pause
