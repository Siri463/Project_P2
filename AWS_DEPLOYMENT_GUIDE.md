# RevTickets AWS Deployment Guide

Complete step-by-step guide to deploy RevTickets microservices on AWS EC2 and Angular frontend on AWS Amplify.

## Architecture Overview

**EC2 Instance (Single Server):**
- Eureka Server → 8761
- API Gateway → 8080
- User Service → 8081
- Movie Service → 8082
- Venue Service → 8083
- Booking Service → 8084
- Payment Service → 8085

**AWS Amplify:** Angular 18 Frontend

**Databases:** MySQL (8 databases) + MongoDB (for reviews)

---

## STEP 0: Prerequisites & Placeholders

Replace these before running commands:

- `YOUR_KEY.pem` - Your EC2 keypair file
- `YOUR_EC2_IP` - EC2 public IPv4 (e.g., 3.120.45.67)
- `GITHUB_REPO_URL` - Your Angular repo URL
- `AWS_REGION` - e.g., ap-south-1
- `YOUR_IP` - Your local IP for SSH access

---

## STEP 1: Create EC2 Instance

1. **AWS Console → EC2 → Launch Instance**
2. **AMI:** Ubuntu Server 22.04 LTS (HVM)
3. **Instance Type:** t2.large (minimum - you have 7 services + databases)
4. **Key Pair:** Create/download `YOUR_KEY.pem`
5. **Security Group Rules:**
   ```
   SSH (22) → Your IP only
   HTTP (80) → 0.0.0.0/0
   Custom TCP (8080-8085) → 0.0.0.0/0 (temporary)
   Custom TCP (8761) → 0.0.0.0/0 (temporary)
   MySQL (3306) → 0.0.0.0/0 (temporary, for setup)
   MongoDB (27017) → 0.0.0.0/0 (temporary, for setup)
   ```
6. **Storage:** 30 GB minimum
7. Launch and note `YOUR_EC2_IP`

---

## STEP 2: Connect and Install Dependencies

```bash
# Make key private
chmod 400 YOUR_KEY.pem

# Connect to EC2
ssh -i YOUR_KEY.pem ubuntu@YOUR_EC2_IP
```

On EC2, run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 17
sudo apt install -y openjdk-17-jdk

# Install MySQL
sudo apt install -y mysql-server

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install other tools
sudo apt install -y unzip wget git ufw

# Verify installations
java -version
mysql --version
mongod --version
```

---

## STEP 3: Setup MySQL Databases

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create databases
sudo mysql -u root -p << 'EOF'
CREATE DATABASE IF NOT EXISTS revtickets_user_db;
CREATE DATABASE IF NOT EXISTS revtickets_movie_db;
CREATE DATABASE IF NOT EXISTS revtickets_venue_db;
CREATE DATABASE IF NOT EXISTS booking_db;
CREATE DATABASE IF NOT EXISTS payment_db;

-- Create user and grant permissions
CREATE USER IF NOT EXISTS 'revtickets'@'localhost' IDENTIFIED BY 'RevTickets@2024';
GRANT ALL PRIVILEGES ON revtickets_user_db.* TO 'revtickets'@'localhost';
GRANT ALL PRIVILEGES ON revtickets_movie_db.* TO 'revtickets'@'localhost';
GRANT ALL PRIVILEGES ON revtickets_venue_db.* TO 'revtickets'@'localhost';
GRANT ALL PRIVILEGES ON booking_db.* TO 'revtickets'@'localhost';
GRANT ALL PRIVILEGES ON payment_db.* TO 'revtickets'@'localhost';
FLUSH PRIVILEGES;
EOF
```

---

## STEP 4: Prepare Application Directory

```bash
# Create directories
sudo mkdir -p /opt/revtickets/{jars,logs,images}
sudo chown -R ubuntu:ubuntu /opt/revtickets

# Create image directories for movie service
mkdir -p /opt/revtickets/images/{display,banner}
```

---

## STEP 5: Build and Upload JARs

**On your local machine:**

```bash
# Navigate to microservices directory
cd d:\Rev_TicketsFi\RevTickets\microservices

# Build all services
mvn clean package -DskipTests

# Upload JARs to EC2
scp -i YOUR_KEY.pem eureka-server/target/eureka-server-1.0.0.jar ubuntu@YOUR_EC2_IP:/opt/revtickets/jars/
scp -i YOUR_KEY.pem api-gateway/target/api-gateway-1.0.0.jar ubuntu@YOUR_EC2_IP:/opt/revtickets/jars/
scp -i YOUR_KEY.pem user-service/target/user-service-1.0.0.jar ubuntu@YOUR_EC2_IP:/opt/revtickets/jars/
scp -i YOUR_KEY.pem movie-service/target/movie-service-1.0.0.jar ubuntu@YOUR_EC2_IP:/opt/revtickets/jars/
scp -i YOUR_KEY.pem venue-service/target/venue-service-1.0.0.jar ubuntu@YOUR_EC2_IP:/opt/revtickets/jars/
scp -i YOUR_KEY.pem booking-service/target/booking-service-1.0.0.jar ubuntu@YOUR_EC2_IP:/opt/revtickets/jars/
scp -i YOUR_KEY.pem payment-service/target/payment-service-1.0.0.jar ubuntu@YOUR_EC2_IP:/opt/revtickets/jars/

# Upload movie images
scp -i YOUR_KEY.pem -r movie-service/public/display/* ubuntu@YOUR_EC2_IP:/opt/revtickets/images/display/
scp -i YOUR_KEY.pem -r movie-service/public/banner/* ubuntu@YOUR_EC2_IP:/opt/revtickets/images/banner/
```

---

## STEP 6: Update Application Properties

**On EC2, update database credentials in each service:**

```bash
# For each service, update application.properties
# Example for user-service:
nano /opt/revtickets/jars/user-service-application.properties
```

Create property files with correct credentials:

```properties
# user-service-application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/revtickets_user_db
spring.datasource.username=revtickets
spring.datasource.password=RevTickets@2024

# movie-service-application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/revtickets_movie_db
spring.datasource.username=revtickets
spring.datasource.password=RevTickets@2024
spring.data.mongodb.uri=mongodb://localhost:27017/revtickets_reviews
file.upload.dir=/opt/revtickets/images

# Similar for other services...
```

---

## STEP 7: Create Systemd Services

**1. Eureka Server:**

```bash
sudo tee /etc/systemd/system/eureka-server.service > /dev/null <<'EOF'
[Unit]
Description=Eureka Server
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/eureka-server-1.0.0.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/eureka-server.log
StandardError=append:/opt/revtickets/logs/eureka-server-error.log

[Install]
WantedBy=multi-user.target
EOF
```

**2. API Gateway:**

```bash
sudo tee /etc/systemd/system/api-gateway.service > /dev/null <<'EOF'
[Unit]
Description=API Gateway
After=eureka-server.service
Requires=eureka-server.service

[Service]
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/api-gateway-1.0.0.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/api-gateway.log
StandardError=append:/opt/revtickets/logs/api-gateway-error.log

[Install]
WantedBy=multi-user.target
EOF
```

**3. User Service:**

```bash
sudo tee /etc/systemd/system/user-service.service > /dev/null <<'EOF'
[Unit]
Description=User Service
After=eureka-server.service mysql.service
Requires=eureka-server.service mysql.service

[Service]
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/user-service-1.0.0.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/user-service.log
StandardError=append:/opt/revtickets/logs/user-service-error.log

[Install]
WantedBy=multi-user.target
EOF
```

**4. Movie Service:**

```bash
sudo tee /etc/systemd/system/movie-service.service > /dev/null <<'EOF'
[Unit]
Description=Movie Service
After=eureka-server.service mysql.service mongod.service
Requires=eureka-server.service mysql.service mongod.service

[Service]
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/movie-service-1.0.0.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/movie-service.log
StandardError=append:/opt/revtickets/logs/movie-service-error.log

[Install]
WantedBy=multi-user.target
EOF
```

**5. Venue Service:**

```bash
sudo tee /etc/systemd/system/venue-service.service > /dev/null <<'EOF'
[Unit]
Description=Venue Service
After=eureka-server.service mysql.service
Requires=eureka-server.service mysql.service

[Service]
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/venue-service-1.0.0.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/venue-service.log
StandardError=append:/opt/revtickets/logs/venue-service-error.log

[Install]
WantedBy=multi-user.target
EOF
```

**6. Booking Service:**

```bash
sudo tee /etc/systemd/system/booking-service.service > /dev/null <<'EOF'
[Unit]
Description=Booking Service
After=eureka-server.service mysql.service
Requires=eureka-server.service mysql.service

[Service]
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/booking-service-1.0.0.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/booking-service.log
StandardError=append:/opt/revtickets/logs/booking-service-error.log

[Install]
WantedBy=multi-user.target
EOF
```

**7. Payment Service:**

```bash
sudo tee /etc/systemd/system/payment-service.service > /dev/null <<'EOF'
[Unit]
Description=Payment Service
After=eureka-server.service mysql.service
Requires=eureka-server.service mysql.service

[Service]
User=ubuntu
WorkingDirectory=/opt/revtickets/jars
ExecStart=/usr/bin/java -jar /opt/revtickets/jars/payment-service-1.0.0.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
StandardOutput=append:/opt/revtickets/logs/payment-service.log
StandardError=append:/opt/revtickets/logs/payment-service-error.log

[Install]
WantedBy=multi-user.target
EOF
```

---

## STEP 8: Enable and Start Services

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable all services
sudo systemctl enable eureka-server api-gateway user-service movie-service venue-service booking-service payment-service

# Start services in order
sudo systemctl start eureka-server
sleep 30  # Wait for Eureka to start

sudo systemctl start user-service movie-service venue-service booking-service payment-service
sleep 20  # Wait for services to register

sudo systemctl start api-gateway

# Check status
sudo systemctl status eureka-server
sudo systemctl status api-gateway
sudo systemctl status user-service
sudo systemctl status movie-service
sudo systemctl status venue-service
sudo systemctl status booking-service
sudo systemctl status payment-service

# View logs
tail -f /opt/revtickets/logs/*.log
```

---

## STEP 9: Configure Firewall (UFW)

```bash
# Allow SSH from your IP only
sudo ufw allow from YOUR_IP to any port 22

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow API Gateway (public)
sudo ufw allow 8080/tcp

# Deny direct access to other services (they go through API Gateway)
# sudo ufw deny 8081:8085/tcp
# sudo ufw deny 8761/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

## STEP 10: Test Services

```bash
# Test Eureka
curl http://YOUR_EC2_IP:8761

# Test API Gateway
curl http://YOUR_EC2_IP:8080/api/movies

# Test individual services (if ports open)
curl http://YOUR_EC2_IP:8081/api/admin/dashboard/stats
curl http://YOUR_EC2_IP:8082/api/movies
curl http://YOUR_EC2_IP:8083/api/venues
curl http://YOUR_EC2_IP:8084/api/shows
curl http://YOUR_EC2_IP:8085/api/payments/health
```

---

## STEP 11: Deploy Angular Frontend on AWS Amplify

**1. Push to GitHub:**

```bash
cd d:\Rev_TicketsFi\RevTickets\frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin GITHUB_REPO_URL
git push -u origin main
```

**2. Create `amplify.yml` in frontend root:**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g @angular/cli@18
        - npm ci
    build:
      commands:
        - ng build --configuration production
  artifacts:
    baseDirectory: dist/frontend/browser
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**3. Update `environment.prod.ts`:**

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://YOUR_EC2_IP:8080/api'
};
```

**4. AWS Amplify Console:**

- Go to AWS Amplify → Host web app
- Connect GitHub repository
- Select branch (main)
- Build settings: Use the amplify.yml
- Environment variables:
  - `API_URL` = `http://YOUR_EC2_IP:8080/api`
- Deploy

**5. Get Amplify URL:**

After deployment, note your Amplify URL: `https://yourapp.amplifyapp.com`

---

## STEP 12: Configure CORS

Update each service's CORS configuration to allow Amplify domain:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins(
                        "http://localhost:4200",
                        "https://yourapp.amplifyapp.com"
                    )
                    .allowedMethods("*")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

Rebuild and redeploy services.

---

## STEP 13: Setup SSL (Optional but Recommended)

**Option 1: Use AWS Application Load Balancer**

1. Create ALB in front of EC2
2. Add SSL certificate from AWS Certificate Manager
3. Configure target groups for port 8080
4. Update Amplify to use ALB HTTPS URL

**Option 2: Use Nginx Reverse Proxy with Let's Encrypt**

```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/revtickets

# Add SSL with certbot
sudo certbot --nginx -d yourdomain.com
```

---

## STEP 14: Monitoring & Maintenance

**View Logs:**

```bash
# Service logs
sudo journalctl -u user-service -f
tail -f /opt/revtickets/logs/user-service.log

# All services
tail -f /opt/revtickets/logs/*.log
```

**Restart Services:**

```bash
sudo systemctl restart user-service
sudo systemctl restart all  # Restart all
```

**Check Service Status:**

```bash
sudo systemctl status user-service
```

---

## Troubleshooting

**Service won't start:**
```bash
sudo journalctl -u service-name -n 100
```

**Database connection issues:**
```bash
mysql -u revtickets -p
# Test connection
```

**Port already in use:**
```bash
sudo lsof -i :8080
sudo kill -9 PID
```

**Out of memory:**
```bash
# Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Cost Optimization

- Use t2.large or t3.large (7 services need resources)
- Enable CloudWatch alarms for CPU/Memory
- Use RDS for MySQL (managed, auto-backup)
- Use DocumentDB for MongoDB (managed)
- Consider ECS/EKS for better scaling

---

## Security Checklist

- ✅ Restrict SSH to your IP only
- ✅ Use strong database passwords
- ✅ Enable UFW firewall
- ✅ Use HTTPS (SSL certificate)
- ✅ Regular security updates: `sudo apt update && sudo apt upgrade`
- ✅ Enable CloudWatch logging
- ✅ Use IAM roles instead of access keys
- ✅ Regular backups (AMI snapshots)

---

## Quick Commands Reference

```bash
# Start all services
sudo systemctl start eureka-server api-gateway user-service movie-service venue-service booking-service payment-service

# Stop all services
sudo systemctl stop eureka-server api-gateway user-service movie-service venue-service booking-service payment-service

# Restart all services
sudo systemctl restart eureka-server api-gateway user-service movie-service venue-service booking-service payment-service

# View all logs
tail -f /opt/revtickets/logs/*.log

# Check all service status
sudo systemctl status eureka-server api-gateway user-service movie-service venue-service booking-service payment-service
```

---

## Support

For issues, check:
1. Service logs: `/opt/revtickets/logs/`
2. System logs: `sudo journalctl -xe`
3. Database connectivity: `mysql -u revtickets -p`
4. Port availability: `sudo lsof -i :PORT`

---

**Deployment Complete! 🎉**

Your RevTickets application is now live on AWS!
- Backend: `http://YOUR_EC2_IP:8080`
- Frontend: `https://yourapp.amplifyapp.com`
- Eureka Dashboard: `http://YOUR_EC2_IP:8761`
