#!/bin/bash

echo "Creating systemd service files for RevTickets..."

# Create directory for JARs if not exists
sudo mkdir -p /opt/revtickets/jars
sudo mkdir -p /opt/revtickets/logs

# 1. Eureka Server
sudo tee /etc/systemd/system/eureka-server.service > /dev/null <<EOF
[Unit]
Description=Eureka Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/eureka-server-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/eureka-server.log
StandardError=append:/opt/revtickets/logs/eureka-server.log

[Install]
WantedBy=multi-user.target
EOF

# 2. User Service
sudo tee /etc/systemd/system/user-service.service > /dev/null <<EOF
[Unit]
Description=User Service
After=network.target eureka-server.service
Requires=eureka-server.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/user-service-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/user-service.log
StandardError=append:/opt/revtickets/logs/user-service.log

[Install]
WantedBy=multi-user.target
EOF

# 3. Movie Service
sudo tee /etc/systemd/system/movie-service.service > /dev/null <<EOF
[Unit]
Description=Movie Service
After=network.target eureka-server.service
Requires=eureka-server.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/movie-service-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/movie-service.log
StandardError=append:/opt/revtickets/logs/movie-service.log

[Install]
WantedBy=multi-user.target
EOF

# 4. Venue Service
sudo tee /etc/systemd/system/venue-service.service > /dev/null <<EOF
[Unit]
Description=Venue Service
After=network.target eureka-server.service
Requires=eureka-server.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/venue-service-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/venue-service.log
StandardError=append:/opt/revtickets/logs/venue-service.log

[Install]
WantedBy=multi-user.target
EOF

# 5. Booking Service
sudo tee /etc/systemd/system/booking-service.service > /dev/null <<EOF
[Unit]
Description=Booking Service
After=network.target eureka-server.service
Requires=eureka-server.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/booking-service-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/booking-service.log
StandardError=append:/opt/revtickets/logs/booking-service.log

[Install]
WantedBy=multi-user.target
EOF

# 6. Payment Service
sudo tee /etc/systemd/system/payment-service.service > /dev/null <<EOF
[Unit]
Description=Payment Service
After=network.target eureka-server.service
Requires=eureka-server.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/payment-service-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/payment-service.log
StandardError=append:/opt/revtickets/logs/payment-service.log

[Install]
WantedBy=multi-user.target
EOF

# 7. API Gateway
sudo tee /etc/systemd/system/api-gateway.service > /dev/null <<EOF
[Unit]
Description=API Gateway
After=network.target user-service.service movie-service.service venue-service.service booking-service.service payment-service.service
Requires=eureka-server.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/api-gateway-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/api-gateway.log
StandardError=append:/opt/revtickets/logs/api-gateway.log

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable all services to start on boot
sudo systemctl enable eureka-server user-service movie-service venue-service booking-service payment-service api-gateway

echo "✅ All systemd services created and enabled!"
echo ""
echo "Start services with:"
echo "sudo systemctl start eureka-server"
echo "sleep 30"
echo "sudo systemctl start user-service movie-service venue-service booking-service payment-service"
echo "sleep 20"
echo "sudo systemctl start api-gateway"
