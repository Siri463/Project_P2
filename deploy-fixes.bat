@echo off
echo Deploying fixes to AWS...

echo Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    exit /b 1
)

echo Building backend services...
cd ..\microservices\movie-service
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Movie service build failed!
    exit /b 1
)

cd ..\user-service
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo User service build failed!
    exit /b 1
)

cd ..\api-gateway
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo API Gateway build failed!
    exit /b 1
)

cd ..\eureka-server
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Eureka server build failed!
    exit /b 1
)

echo All services built successfully!
echo Now copy the JAR files to your AWS EC2 instance and restart docker-compose

cd ..\..
echo Done!