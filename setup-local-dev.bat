@echo off
echo ========================================
echo RevTickets Local Development Setup
echo ========================================

echo Step 1: Building all microservices...
call build-and-deploy-local.bat

echo Step 2: Starting databases first...
docker-compose -f docker-compose-production.yml up -d mysql mongodb

echo Waiting for databases to be ready...
timeout /t 30

echo Step 3: Starting all services...
docker-compose -f docker-compose-production.yml up -d

echo Step 4: Checking service status...
timeout /t 20
docker ps

echo ========================================
echo Setup Complete! Access URLs:
echo ========================================
echo Frontend: http://localhost
echo API Gateway: http://localhost:8080
echo Eureka Dashboard: http://localhost:8761
echo ========================================

pause