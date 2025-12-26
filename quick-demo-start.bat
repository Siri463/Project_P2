@echo off
title RevTickets Demo Startup
color 0A

echo.
echo  ██████╗ ███████╗██╗   ██╗████████╗██╗ ██████╗██╗  ██╗███████╗████████╗███████╗
echo  ██╔══██╗██╔════╝██║   ██║╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝██╔════╝
echo  ██████╔╝█████╗  ██║   ██║   ██║   ██║██║     █████╔╝ █████╗     ██║   ███████╗
echo  ██╔══██╗██╔══╝  ╚██╗ ██╔╝   ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║   ╚════██║
echo  ██║  ██║███████╗ ╚████╔╝    ██║   ██║╚██████╗██║  ██╗███████╗   ██║   ███████║
echo  ╚═╝  ╚═╝╚══════╝  ╚═══╝     ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝
echo.
echo                           🎬 DEMO STARTUP SCRIPT 🎬
echo.

echo [1/5] Checking Docker status...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not found! Please start Docker Desktop first.
    pause
    exit /b 1
)
echo ✅ Docker is running

echo.
echo [2/5] Stopping any existing containers...
docker-compose -f docker-compose-production.yml down >nul 2>&1

echo.
echo [3/5] Starting databases first...
docker-compose -f docker-compose-production.yml up -d mysql mongodb
echo ⏳ Waiting for databases to initialize (30 seconds)...
timeout /t 30 >nul

echo.
echo [4/5] Starting all microservices...
docker-compose -f docker-compose-production.yml up -d

echo.
echo [5/5] Verifying service startup...
timeout /t 20 >nul

echo.
echo ========================================
echo 🎯 DEMO ENVIRONMENT READY!
echo ========================================
echo.
echo 📱 Frontend:        http://localhost
echo 🌐 API Gateway:     http://localhost:8080
echo 🔍 Eureka Dashboard: http://localhost:8761
echo 📊 Service Status:
echo.

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo ========================================
echo 🚀 READY FOR DEMO!
echo ========================================
echo.
echo 💡 Tips:
echo - Wait 2-3 minutes for all services to fully start
echo - Check Eureka dashboard to see all services registered
echo - Test login with admin credentials
echo.

echo Press any key to open demo URLs...
pause >nul

start http://localhost
start http://localhost:8761
start http://localhost:8080/actuator/health

echo.
echo 🎬 Break a leg with your demo!
echo.