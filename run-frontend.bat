@echo off
echo Starting MathBridge Frontend...
echo.

cd mathbridge-frontend

echo Opening frontend in browser...
echo Frontend will be available at: http://localhost:8000
echo.

start http://localhost:8000
python -m http.server 8000

pause
