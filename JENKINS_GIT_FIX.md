# Fix Jenkins Git Connection Issue

## Problem
`Could not resolve host: github.com`

## Solutions (Try in order)

### Solution 1: Check Internet Connection
```bash
# On Jenkins server, test connection
ping github.com
curl https://github.com

# If fails, check firewall/proxy settings
```

### Solution 2: Configure Git in Jenkins
1. Go to: **Manage Jenkins** → **Tools**
2. Find **Git** section
3. Add Git installation:
   - Name: `Default`
   - Path to Git executable: `/usr/bin/git` (Linux) or `C:\Program Files\Git\bin\git.exe` (Windows)
4. Save

### Solution 3: Use Pipeline Script Directly (Bypass SCM)

Instead of "Pipeline script from SCM", use "Pipeline script":

1. Edit your pipeline job
2. Pipeline section:
   - Definition: **Pipeline script** (not from SCM)
3. Paste this script directly:

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = 'subodhxo'
        DOCKER_HUB_PASS = 'Subodh@2002'
        GIT_REPO = 'https://github.com/Subodh-26/Rev-Tickets-Microservices.git'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
            }
        }
        
        stage('Build JARs') {
            steps {
                bat 'cd microservices\\eureka-server && mvn clean package -DskipTests'
                bat 'cd microservices\\api-gateway && mvn clean package -DskipTests'
                bat 'cd microservices\\user-service && mvn clean package -DskipTests'
                bat 'cd microservices\\movie-service && mvn clean package -DskipTests'
                bat 'cd microservices\\venue-service && mvn clean package -DskipTests'
                bat 'cd microservices\\booking-service && mvn clean package -DskipTests'
                bat 'cd microservices\\payment-service && mvn clean package -DskipTests'
            }
        }
        
        stage('Build Frontend') {
            steps {
                bat 'cd frontend && npm install && npm run build'
            }
        }
        
        stage('Build Docker Images') {
            steps {
                bat 'docker build -t subodhxo/revtickets-eureka:latest .\\microservices\\eureka-server'
                bat 'docker build -t subodhxo/revtickets-gateway:latest .\\microservices\\api-gateway'
                bat 'docker build -t subodhxo/revtickets-user:latest .\\microservices\\user-service'
                bat 'docker build -t subodhxo/revtickets-movie:latest .\\microservices\\movie-service'
                bat 'docker build -t subodhxo/revtickets-venue:latest .\\microservices\\venue-service'
                bat 'docker build -t subodhxo/revtickets-booking:latest .\\microservices\\booking-service'
                bat 'docker build -t subodhxo/revtickets-payment:latest .\\microservices\\payment-service'
                bat 'docker build -t subodhxo/revtickets-frontend:latest .\\frontend'
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                bat 'echo %DOCKER_HUB_PASS% | docker login -u %DOCKER_HUB_USER% --password-stdin'
                bat 'docker push subodhxo/revtickets-eureka:latest'
                bat 'docker push subodhxo/revtickets-gateway:latest'
                bat 'docker push subodhxo/revtickets-user:latest'
                bat 'docker push subodhxo/revtickets-movie:latest'
                bat 'docker push subodhxo/revtickets-venue:latest'
                bat 'docker push subodhxo/revtickets-booking:latest'
                bat 'docker push subodhxo/revtickets-payment:latest'
                bat 'docker push subodhxo/revtickets-frontend:latest'
            }
        }
    }
    
    post {
        always {
            bat 'docker logout'
        }
    }
}
```

4. Save and click **Build Now**

### Solution 4: Check DNS Settings
```bash
# On Jenkins server
cat /etc/resolv.conf

# Should have nameservers like:
# nameserver 8.8.8.8
# nameserver 8.8.4.4

# If missing, add them:
echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf
```

### Solution 5: Use Correct Repo URL

Your repo URL is: `https://github.com/Subodh-26/Rev-Tickets-Microservices`

Make sure it's correct in pipeline configuration.

### Solution 6: Test Git Manually
```bash
# On Jenkins server
git ls-remote https://github.com/Subodh-26/Rev-Tickets-Microservices.git

# If this works, Jenkins should work too
```

## Recommended: Use Pipeline Script Directly

This bypasses the initial Git connection test and lets Jenkins handle Git internally.
