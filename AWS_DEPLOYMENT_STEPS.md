# RevTickets AWS Deployment Guide

## BEFORE YOU START
Replace these placeholders in application.yml files:
- `REPLACE_WITH_RDS_ENDPOINT` → Your RDS endpoint (e.g., revtickets-mysql.xxxxxx.us-east-1.rds.amazonaws.com)
- `REPLACE_WITH_DOCDB_ENDPOINT` → Your DocumentDB endpoint (e.g., revtickets-docdb.cluster-xxxxxx.us-east-1.docdb.amazonaws.com)

---

## PHASE 1: AWS Setup (30 min)

### 1.1 Create RDS MySQL
```
AWS Console → RDS → Create database
- Engine: MySQL 8.0
- Template: Free tier
- DB identifier: revtickets-mysql
- Master username: admin
- Master password: Root@123
- DB name: revtickets
- Public access: Yes
- Security group: revtickets-rds-sg
```
**Copy the endpoint URL**

### 1.2 Create DocumentDB
```
AWS Console → DocumentDB → Create cluster
- Cluster identifier: revtickets-docdb
- Instance class: db.t3.medium
- Master username: admin
- Master password: Root@123
- VPC: Same as RDS
- Security group: revtickets-docdb-sg
```
**Copy the cluster endpoint URL**

### 1.3 Launch EC2 Instance
```
AWS Console → EC2 → Launch Instance
- Name: revtickets-app
- AMI: Ubuntu Server 22.04 LTS
- Instance type: t2.medium
- Key pair: Create new → revtickets-key.pem (download it)
- Security group: revtickets-ec2-sg
  - SSH (22) → Your IP
  - Custom TCP (8761, 8080-8085) → 0.0.0.0/0
- Storage: 20 GB
```
**Copy the Public IPv4 address**

### 1.4 Update Security Groups
```
RDS Security Group (revtickets-rds-sg):
- Add inbound: MySQL (3306) from revtickets-ec2-sg

DocumentDB Security Group (revtickets-docdb-sg):
- Add inbound: TCP (27017) from revtickets-ec2-sg
```

---

## PHASE 2: Update Code (15 min)

### 2.1 Replace Database Endpoints
Open these files and replace placeholders with actual endpoints:
- `microservices/user-service/src/main/resources/application.yml`
- `microservices/movie-service/src/main/resources/application.yml`
- `microservices/venue-service/src/main/resources/application.yml`
- `microservices/booking-service/src/main/resources/application.yml`
- `microservices/payment-service/src/main/resources/application.yml`

### 2.2 Commit and Push to GitHub
```bash
git add .
git commit -m "Configure for AWS deployment"
git push origin main
```

---

## PHASE 3: Build JARs Locally (10 min)

```bash
cd d:\Rev_TicketsFi\RevTickets\microservices

# Clean and build all services
mvn clean package -DskipTests
```

**Verify JARs created in each target/ folder**

---

## PHASE 4: Setup EC2 (20 min)

### 4.1 Connect to EC2
```bash
# Windows PowerShell
cd path\to\your\key
ssh -i revtickets-key.pem ubuntu@YOUR_EC2_IP
```

### 4.2 Install Java
```bash
sudo apt update
sudo apt install -y openjdk-17-jdk wget
java -version

mkdir -p ~/services ~/logs
```

### 4.3 Download DocumentDB Certificate
```bash
cd ~
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
```

### 4.4 Upload JARs from Local Machine
```bash
# Run from Windows PowerShell (NOT on EC2)
scp -i revtickets-key.pem d:\Rev_TicketsFi\RevTickets\microservices\eureka-server\target\eureka-server-1.0.0.jar ubuntu@YOUR_EC2_IP:~/services/
scp -i revtickets-key.pem d:\Rev_TicketsFi\RevTickets\microservices\api-gateway\target\api-gateway-1.0.0.jar ubuntu@YOUR_EC2_IP:~/services/
scp -i revtickets-key.pem d:\Rev_TicketsFi\RevTickets\microservices\user-service\target\user-service-1.0.0.jar ubuntu@YOUR_EC2_IP:~/services/
scp -i revtickets-key.pem d:\Rev_TicketsFi\RevTickets\microservices\movie-service\target\movie-service-1.0.0.jar ubuntu@YOUR_EC2_IP:~/services/
scp -i revtickets-key.pem d:\Rev_TicketsFi\RevTickets\microservices\venue-service\target\venue-service-1.0.0.jar ubuntu@YOUR_EC2_IP:~/services/
scp -i revtickets-key.pem d:\Rev_TicketsFi\RevTickets\microservices\booking-service\target\booking-service-1.0.0.jar ubuntu@YOUR_EC2_IP:~/services/
scp -i revtickets-key.pem d:\Rev_TicketsFi\RevTickets\microservices\payment-service\target\payment-service-1.0.0.jar ubuntu@YOUR_EC2_IP:~/services/
```

---

## PHASE 5: Create Systemd Services (15 min)

### 5.1 Create Service Files (Run on EC2)

```bash
# Eureka Server
sudo tee /etc/systemd/system/eureka.service > /dev/null <<'EOF'
[Unit]
Description=Eureka Server
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/services
ExecStart=/usr/bin/java -jar eureka-server-1.0.0.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# API Gateway
sudo tee /etc/systemd/system/api-gateway.service > /dev/null <<'EOF'
[Unit]
Description=API Gateway
After=eureka.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/services
ExecStart=/usr/bin/java -jar api-gateway-1.0.0.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# User Service
sudo tee /etc/systemd/system/user-service.service > /dev/null <<'EOF'
[Unit]
Description=User Service
After=eureka.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/services
ExecStart=/usr/bin/java -jar user-service-1.0.0.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Movie Service
sudo tee /etc/systemd/system/movie-service.service > /dev/null <<'EOF'
[Unit]
Description=Movie Service
After=eureka.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/services
ExecStart=/usr/bin/java -jar movie-service-1.0.0.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Venue Service
sudo tee /etc/systemd/system/venue-service.service > /dev/null <<'EOF'
[Unit]
Description=Venue Service
After=eureka.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/services
ExecStart=/usr/bin/java -jar venue-service-1.0.0.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Booking Service
sudo tee /etc/systemd/system/booking-service.service > /dev/null <<'EOF'
[Unit]
Description=Booking Service
After=eureka.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/services
ExecStart=/usr/bin/java -jar booking-service-1.0.0.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Payment Service
sudo tee /etc/systemd/system/payment-service.service > /dev/null <<'EOF'
[Unit]
Description=Payment Service
After=eureka.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/services
ExecStart=/usr/bin/java -jar payment-service-1.0.0.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

### 5.2 Start Services
```bash
sudo systemctl daemon-reload
sudo systemctl enable eureka api-gateway user-service movie-service venue-service booking-service payment-service

# Start Eureka first
sudo systemctl start eureka
sleep 30

# Start all other services
sudo systemctl start api-gateway user-service movie-service venue-service booking-service payment-service

# Check status
sudo systemctl status eureka
sudo systemctl status api-gateway
sudo systemctl status user-service

# View logs
sudo journalctl -u eureka -f
sudo journalctl -u api-gateway -f
```

---

## PHASE 6: Create API Gateway (15 min)

### 6.1 Create REST API
```
AWS Console → API Gateway → Create API → REST API (Regional)
- API name: revtickets-api
- Endpoint Type: Regional
```

### 6.2 Create Resources and Methods
```
1. Create Resource: /api
2. Under /api, create Resource: {proxy+}
3. On {proxy+}, create Method: ANY
   - Integration type: HTTP Proxy
   - Endpoint URL: http://YOUR_EC2_IP:8080/{proxy}
   - Check "Use HTTP Proxy integration"
```

### 6.3 Enable CORS
```
Actions → Enable CORS
- Access-Control-Allow-Origin: *
- Enable CORS
```

### 6.4 Deploy API
```
Actions → Deploy API
- Stage name: prod
- Deploy
```

**Copy Invoke URL**: `https://abc123.execute-api.us-east-1.amazonaws.com/prod`

---

## PHASE 7: Deploy Frontend on Amplify (20 min)

### 7.1 Update Frontend Environment
Create/update `frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://YOUR_API_GATEWAY_URL/prod/api'
};
```

Commit and push to GitHub.

### 7.2 Create Amplify App
```
AWS Console → Amplify → New app → Host web app
- Connect GitHub repository
- Branch: main
- App name: revtickets-frontend
```

### 7.3 Build Settings
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build -- --configuration production
  artifacts:
    baseDirectory: dist/frontend
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 7.4 Deploy
```
Save and Deploy
```

**Copy Amplify URL**: `https://main.xxxxxx.amplifyapp.com`

---

## PHASE 8: Test Deployment (10 min)

### 8.1 Test Backend
```bash
# Test Eureka
curl http://YOUR_EC2_IP:8761

# Test API Gateway
curl https://YOUR_API_GATEWAY_URL/prod/api/movies
curl https://YOUR_API_GATEWAY_URL/prod/api/venues
```

### 8.2 Test Frontend
Open Amplify URL in browser and test:
- Login/Register
- Browse movies
- Book tickets
- Make payment

---

## PHASE 9: Security Hardening (10 min)

### 9.1 Restrict EC2 Ports
```
EC2 Security Group (revtickets-ec2-sg):
- Remove: 8761, 8081-8085 from 0.0.0.0/0
- Keep only: 8080 from 0.0.0.0/0 (for API Gateway)
- Keep: SSH (22) from Your IP
```

### 9.2 Restrict Database Access
```
RDS Security Group:
- Remove public access
- Keep only: MySQL (3306) from revtickets-ec2-sg

DocumentDB Security Group:
- Remove public access
- Keep only: TCP (27017) from revtickets-ec2-sg
```

---

## Troubleshooting

### Services not starting
```bash
sudo journalctl -u service-name -n 100
```

### Database connection errors
- Verify RDS/DocumentDB endpoints in application.yml
- Check security group rules
- Test connection: `telnet RDS_ENDPOINT 3306`

### API Gateway 502 errors
- Check EC2 services are running: `sudo systemctl status api-gateway`
- Verify port 8080 is accessible: `curl http://localhost:8080/api/movies`

### Frontend not connecting
- Verify API Gateway URL in environment.prod.ts
- Check CORS is enabled on API Gateway
- Check browser console for errors

---

## Cost Estimate (Monthly)
- EC2 t2.medium: ~$30
- RDS db.t3.micro: ~$15
- DocumentDB db.t3.medium: ~$70
- API Gateway: ~$3.50 (1M requests)
- Amplify: ~$0-5
- **Total: ~$120-125/month**

---

## Useful Commands

### Check all services
```bash
sudo systemctl status eureka api-gateway user-service movie-service venue-service booking-service payment-service
```

### Restart a service
```bash
sudo systemctl restart service-name
```

### View logs
```bash
sudo journalctl -u service-name -f
```

### Stop all services
```bash
sudo systemctl stop eureka api-gateway user-service movie-service venue-service booking-service payment-service
```
