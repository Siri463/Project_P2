#!/bin/bash

echo "=========================================="
echo "Jenkins Installation Script"
echo "=========================================="

# Update system
echo "[1/8] Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Java 17
echo "[2/8] Installing Java 17..."
sudo apt install openjdk-17-jdk -y
java -version

# Add Jenkins repository
echo "[3/8] Adding Jenkins repository..."
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
echo "[4/8] Installing Jenkins..."
sudo apt update
sudo apt install jenkins -y

# Start Jenkins
echo "[5/8] Starting Jenkins..."
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Install Docker
echo "[6/8] Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# Add jenkins user to docker group
echo "[7/8] Adding jenkins to docker group..."
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Install Maven
echo "[8/8] Installing Maven..."
sudo apt install maven -y

# Install Node.js
echo "[8/8] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

echo ""
echo "=========================================="
echo "Jenkins Installation Complete!"
echo "=========================================="
echo ""
echo "Access Jenkins at: http://$(curl -s ifconfig.me):8080"
echo ""
echo "Get initial admin password:"
echo "sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
echo ""
echo "Installed versions:"
java -version
mvn -version
node --version
npm --version
docker --version
