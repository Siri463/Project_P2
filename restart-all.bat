@echo off
echo Stopping all services...

REM Kill all Java processes
taskkill /f /im java.exe 2>nul

REM Wait a moment
timeout /t 3 /nobreak >nul

echo Starting Eureka Server...
cd microservices\eureka-server
start "Eureka Server" cmd /k "mvn spring-boot:run"

echo Waiting for Eureka to start...
timeout /t 30 /nobreak >nul

echo Starting User Service...
cd ..\user-service
start "User Service" cmd /k "mvn spring-boot:run"

timeout /t 10 /nobreak >nul

echo Starting Movie Service...
cd ..\movie-service
start "Movie Service" cmd /k "mvn spring-boot:run"

timeout /t 10 /nobreak >nul

echo Starting API Gateway...
cd ..\api-gateway
start "API Gateway" cmd /k "mvn spring-boot:run"

echo All services starting...
echo Check http://localhost:8761 for Eureka Dashboard
echo Check http://52.91.51.47 for your app

cd ..\..