@echo off
echo Starting MathBridge Backend...
echo.

cd mathbridge-backend

echo Checking Java version...
java -version
echo.

echo Starting Spring Boot application...
echo Backend will be available at: http://localhost:8080
echo H2 Console: http://localhost:8080/h2-console
echo.

mvn spring-boot:run

pause
