@echo off
echo ========================================
echo Uploading JAR files to EC2
echo ========================================
echo.

set PEM_KEY=C:\Users\subod\.ssh\microF.pem
set EC2_IP=174.129.48.3
set EC2_USER=ubuntu
set EC2_PATH=/opt/revtickets/jars/

cd /d "%~dp0microservices"

echo [1/7] Uploading eureka-server...
scp -i "%PEM_KEY%" eureka-server\target\eureka-server-1.0.0.jar %EC2_USER%@%EC2_IP%:%EC2_PATH%

echo [2/7] Uploading api-gateway...
scp -i "%PEM_KEY%" api-gateway\target\api-gateway-1.0.0.jar %EC2_USER%@%EC2_IP%:%EC2_PATH%

echo [3/7] Uploading user-service...
scp -i "%PEM_KEY%" user-service\target\user-service-1.0.0.jar %EC2_USER%@%EC2_IP%:%EC2_PATH%

echo [4/7] Uploading movie-service...
scp -i "%PEM_KEY%" movie-service\target\movie-service-1.0.0.jar %EC2_USER%@%EC2_IP%:%EC2_PATH%

echo [5/7] Uploading venue-service...
scp -i "%PEM_KEY%" venue-service\target\venue-service-1.0.0.jar %EC2_USER%@%EC2_IP%:%EC2_PATH%

echo [6/7] Uploading booking-service...
scp -i "%PEM_KEY%" booking-service\target\booking-service-1.0.0.jar %EC2_USER%@%EC2_IP%:%EC2_PATH%

echo [7/7] Uploading payment-service...
scp -i "%PEM_KEY%" payment-service\target\payment-service-1.0.0.jar %EC2_USER%@%EC2_IP%:%EC2_PATH%

echo.
echo ========================================
echo Uploading movie images...
echo ========================================

echo Uploading display images...
scp -i "%PEM_KEY%" -r movie-service\public\display\* %EC2_USER%@%EC2_IP%:/opt/revtickets/images/display/

echo Uploading banner images...
scp -i "%PEM_KEY%" -r movie-service\public\banner\* %EC2_USER%@%EC2_IP%:/opt/revtickets/images/banner/

echo.
echo ========================================
echo Upload Complete!
echo ========================================
echo.
echo Verifying files on EC2...
ssh -i "%PEM_KEY%" %EC2_USER%@%EC2_IP% "ls -lh /opt/revtickets/jars/"

pause
