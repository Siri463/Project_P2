# Jenkins Pipeline Setup - Simple Guide

## Prerequisites

1. **Jenkins installed** on your server/local machine
2. **Docker installed** on Jenkins server
3. **Maven installed** on Jenkins server
4. **Node.js installed** on Jenkins server

---

## Step 1: Install Jenkins Plugins

1. Go to: **Manage Jenkins** → **Plugins** → **Available Plugins**
2. Install:
   - Git plugin
   - Pipeline plugin
   - Docker Pipeline plugin
3. Restart Jenkins

---

## Step 2: Create Pipeline Job

1. Jenkins Dashboard → **New Item**
2. Enter name: `RevTickets-Pipeline`
3. Select: **Pipeline**
4. Click **OK**

---

## Step 3: Configure Pipeline

### In Pipeline Configuration:

**Pipeline Section:**
- Definition: **Pipeline script from SCM**
- SCM: **Git**
- Repository URL: `https://github.com/subodhxo/revtickets.git`
- Branch: `*/main`
- Script Path: `Jenkinsfile`

Click **Save**

---

## Step 4: Run Pipeline

1. Go to `RevTickets-Pipeline`
2. Click **Build Now**
3. Click on build number (e.g., #1)
4. Click **Console Output** to watch progress

---

## What the Pipeline Does

### Stage 1: Checkout
- Pulls code from GitHub

### Stage 2: Build JARs
- Builds 7 microservices using Maven
- Creates JAR files in target/ folders

### Stage 3: Build Frontend
- Installs npm dependencies
- Builds Angular application

### Stage 4: Build Docker Images
- Creates 8 separate Docker images:
  1. subodhxo/revtickets-eureka
  2. subodhxo/revtickets-gateway
  3. subodhxo/revtickets-user
  4. subodhxo/revtickets-movie
  5. subodhxo/revtickets-venue
  6. subodhxo/revtickets-booking
  7. subodhxo/revtickets-payment
  8. subodhxo/revtickets-frontend

### Stage 5: Push to Docker Hub
- Logs into Docker Hub
- Pushes all 8 images to your account

---

## Verify on Docker Hub

1. Go to: `https://hub.docker.com/u/subodhxo`
2. You should see 8 repositories

---

## Run Containers Locally

After pipeline completes, run on any machine with Docker:

```bash
# Pull and run Eureka
docker pull subodhxo/revtickets-eureka:latest
docker run -d -p 8761:8761 --name eureka subodhxo/revtickets-eureka:latest

# Pull and run Gateway
docker pull subodhxo/revtickets-gateway:latest
docker run -d -p 8080:8080 --name gateway subodhxo/revtickets-gateway:latest

# Pull and run User Service
docker pull subodhxo/revtickets-user:latest
docker run -d -p 8081:8081 --name user subodhxo/revtickets-user:latest

# Pull and run Movie Service
docker pull subodhxo/revtickets-movie:latest
docker run -d -p 8082:8082 --name movie subodhxo/revtickets-movie:latest

# Pull and run Venue Service
docker pull subodhxo/revtickets-venue:latest
docker run -d -p 8083:8083 --name venue subodhxo/revtickets-venue:latest

# Pull and run Booking Service
docker pull subodhxo/revtickets-booking:latest
docker run -d -p 8084:8084 --name booking subodhxo/revtickets-booking:latest

# Pull and run Payment Service
docker pull subodhxo/revtickets-payment:latest
docker run -d -p 8085:8085 --name payment subodhxo/revtickets-payment:latest

# Pull and run Frontend
docker pull subodhxo/revtickets-frontend:latest
docker run -d -p 80:80 --name frontend subodhxo/revtickets-frontend:latest
```

---

## Or Use Docker Compose

```bash
docker-compose -f docker-compose-production.yml up -d
```

---

## Troubleshooting

### Build fails at Maven stage
```bash
# Check Maven is installed
mvn -version

# Install Maven on Jenkins server
sudo apt install maven -y
```

### Build fails at npm stage
```bash
# Check Node.js is installed
node -version

# Install Node.js on Jenkins server
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
```

### Docker build fails
```bash
# Check Docker is running
docker ps

# Add jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Docker push fails
```bash
# Verify credentials in Jenkinsfile
# Username: subodhxo
# Password: Subodh@2002
```

---

## Expected Build Time

- Checkout: 30 seconds
- Build JARs: 5-7 minutes
- Build Frontend: 2-3 minutes
- Build Docker Images: 3-4 minutes
- Push to Docker Hub: 2-3 minutes

**Total: ~15-20 minutes**

---

## Success Indicators

✅ Console shows: "Finished: SUCCESS"
✅ All 8 images on Docker Hub
✅ Each image tagged as "latest"
✅ Images can be pulled and run

---

## Next Build

Just push code to GitHub:
```bash
git add .
git commit -m "Update"
git push origin main
```

Then click **Build Now** in Jenkins again!
