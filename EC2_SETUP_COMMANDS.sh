#!/bin/bash

echo "=========================================="
echo "RevTickets EC2 Setup Script"
echo "=========================================="

# Update system
echo "[1/7] Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "[2/7] Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
echo "[3/7] Installing Docker Compose..."
sudo apt install docker-compose -y

# Add user to docker group
echo "[4/7] Adding user to docker group..."
sudo usermod -aG docker ubuntu
newgrp docker

# Install Java (optional, for debugging)
echo "[5/7] Installing Java..."
sudo apt install openjdk-17-jdk -y

# Create project directory
echo "[6/7] Creating project directory..."
mkdir -p /home/ubuntu/revtickets
cd /home/ubuntu/revtickets

# Download docker-compose file
echo "[7/7] Downloading docker-compose file..."
wget https://raw.githubusercontent.com/subodhxo/revtickets/main/docker-compose-production.yml

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Create .env file with your secrets"
echo "2. Run: docker-compose -f docker-compose-production.yml up -d"
echo ""
echo "Verify installation:"
docker --version
docker-compose --version
java -version
