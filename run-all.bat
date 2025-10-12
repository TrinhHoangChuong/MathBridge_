@echo off
echo ========================================
echo    MathBridge Demo - Starting All
echo ========================================
echo.

echo Starting Backend and Frontend...
echo.

echo 1. Starting Backend (Spring Boot)...
start "MathBridge Backend" cmd /k "cd mathbridge-backend && mvn spring-boot:run"

echo Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo 2. Starting Frontend...
start "MathBridge Frontend" cmd /k "cd mathbridge-frontend && python -m http.server 8000"

echo Waiting for frontend to start...
timeout /t 3 /nobreak > nul

echo 3. Opening browser...
start http://localhost:8000

echo.
echo ========================================
echo    MathBridge Demo Started!
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:8000
echo H2 Console: http://localhost:8080/h2-console
echo.
echo Demo Accounts:
echo   Admin:   admin / admin123
echo   Student: student1 / student123
echo   Tutor:   tutor1 / tutor123
echo.
echo Press any key to exit...
pause > nul
