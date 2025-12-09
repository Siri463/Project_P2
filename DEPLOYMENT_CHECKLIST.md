# RevTickets Deployment Checklist

## ✅ Pre-Deployment (Completed)

- [x] Code pushed to GitHub: `https://github.com/subodhxo/revtickets.git`
- [x] Dockerfiles created for all services
- [x] docker-compose-production.yml configured
- [x] Jenkinsfile-Complete updated with Docker Hub username
- [x] .gitignore created

---

## 📋 AWS Setup

### 1. Launch Jenkins EC2 Instance

**Instance Details:**
- [ ] Instance Type: t2.medium
- [ ] OS: Ubuntu 22.04 LTS
- [ ] Storage: 20GB
- [ ] Security Group: Allow ports 22, 8080

**Commands to run:**
```bash
# SSH into Jenkins EC2
ssh -i your-key.pem ubuntu@jenkins-ec2-ip

# Run installation script
wget https://raw.githubusercontent.com/subodhxo/revtickets/main/JENKINS_INSTALL.sh
chmod +x JENKINS_INSTALL.sh
./JENKINS_INSTALL.sh

# Get initial password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 2. Launch Application EC2 Instance

**Instance Details:**
- [ ] Instance Type: t2.large or t3.large
- [ ] OS: Ubuntu 22.04 LTS
- [ ] Storage: 30GB
- [ ] Security Group: Allow ports 22, 80, 443, 8080, 8761, 3306, 27017

**Commands to run:**
```bash
# SSH into Application EC2
ssh -i your-key.pem ubuntu@app-ec2-ip

# Run setup script
wget https://raw.githubusercontent.com/subodhxo/revtickets/main/EC2_SETUP_COMMANDS.sh
chmod +x EC2_SETUP_COMMANDS.sh
./EC2_SETUP_COMMANDS.sh

# Create .env file
nano /home/ubuntu/revtickets/.env
```

**Add to .env file:**
```env
MYSQL_ROOT_PASSWORD=root123
STRIPE_API_KEY=your_stripe_key_here
```

---

## 🔧 Jenkins Configuration

### 3. Access Jenkins
- [ ] Open: `http://jenkins-ec2-ip:8080`
- [ ] Enter initial admin password
- [ ] Install suggested plugins
- [ ] Create admin user

### 4. Install Additional Plugins
- [ ] Go to: Manage Jenkins → Plugins → Available Plugins
- [ ] Install:
  - Git plugin
  - Maven Integration plugin
  - Docker Pipeline plugin
  - SSH Agent plugin
  - Credentials Binding plugin

### 5. Add Credentials

Follow: `JENKINS_CREDENTIALS_SETUP.md`

**Required Credentials:**
- [ ] `docker-hub-credentials` - Username: `subodhxo`, Password: `Subodh@2002`
- [ ] `ec2-ssh-key` - Your EC2 private key
- [ ] `ec2-host` - Your application EC2 IP
- [ ] `mysql-root-password` - MySQL password
- [ ] `stripe-api-key` - Stripe API key

### 6. Create Pipeline Job
- [ ] New Item → Pipeline → Name: `RevTickets-Pipeline`
- [ ] Configure:
  - GitHub project: `https://github.com/subodhxo/revtickets/`
  - Pipeline from SCM
  - Git URL: `https://github.com/subodhxo/revtickets.git`
  - Branch: `*/main`
  - Script Path: `Jenkinsfile-Complete`
- [ ] Save

---

## 🚀 First Deployment

### 7. Run Pipeline
- [ ] Go to `RevTickets-Pipeline`
- [ ] Click **Build Now**
- [ ] Monitor Console Output

**Expected Duration:** 15-20 minutes

**Pipeline Stages:**
1. [ ] Checkout (30 sec)
2. [ ] Build Microservices (5-7 min)
3. [ ] Build Frontend (2-3 min)
4. [ ] Run Tests (2-3 min)
5. [ ] Build Docker Images (3-4 min)
6. [ ] Push to Docker Hub (2-3 min)
7. [ ] Deploy to EC2 (1-2 min)
8. [ ] Health Check (1 min)

---

## ✅ Verification

### 8. Check Docker Hub
- [ ] Login to: `https://hub.docker.com/u/subodhxo`
- [ ] Verify 8 repositories created:
  - subodhxo/revtickets-eureka
  - subodhxo/revtickets-gateway
  - subodhxo/revtickets-user
  - subodhxo/revtickets-movie
  - subodhxo/revtickets-venue
  - subodhxo/revtickets-booking
  - subodhxo/revtickets-payment
  - subodhxo/revtickets-frontend

### 9. Check EC2 Containers
```bash
# SSH into application EC2
ssh -i your-key.pem ubuntu@app-ec2-ip

# Check running containers
docker ps

# Should see 10 containers running
```

### 10. Access Application
- [ ] Frontend: `http://app-ec2-ip`
- [ ] API Gateway: `http://app-ec2-ip:8080`
- [ ] Eureka Dashboard: `http://app-ec2-ip:8761`

### 11. Test Application
- [ ] Register new user
- [ ] Login
- [ ] Browse movies
- [ ] Select show and seats
- [ ] Complete booking

---

## 🔄 Continuous Deployment

### 12. Setup Auto-Deploy (Optional)

**GitHub Webhook:**
1. [ ] Go to GitHub repo → Settings → Webhooks
2. [ ] Add webhook:
   - Payload URL: `http://jenkins-ec2-ip:8080/github-webhook/`
   - Content type: application/json
   - Events: Just the push event
3. [ ] In Jenkins job, enable: "GitHub hook trigger for GITScm polling"

**Now every push to main branch will auto-deploy!**

---

## 📊 Monitoring

### 13. Setup Monitoring
- [ ] Check Eureka Dashboard: All services registered
- [ ] Check Docker stats: `docker stats`
- [ ] Check logs: `docker logs -f revtickets-gateway`
- [ ] Setup AWS CloudWatch (optional)

---

## 🛠️ Troubleshooting

### Common Issues:

**Build fails at Maven stage:**
```bash
# Check Java version on Jenkins
java -version  # Should be 17
```

**Docker build fails:**
```bash
# Check jenkins user in docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**Deployment fails:**
```bash
# Check SSH connection
ssh -i your-key.pem ubuntu@app-ec2-ip

# Check docker-compose file exists
ls -la /home/ubuntu/revtickets/
```

**Services not starting:**
```bash
# Check logs
docker logs revtickets-eureka
docker logs revtickets-gateway

# Restart services
cd /home/ubuntu/revtickets
docker-compose -f docker-compose-production.yml restart
```

---

## 📝 Important Notes

**Docker Hub Credentials:**
- Username: `subodhxo`
- Password: `Subodh@2002`
- Keep these secure in Jenkins credentials only

**EC2 Security:**
- Use security groups to restrict access
- Only open necessary ports
- Use strong passwords for MySQL
- Keep EC2 keys secure

**Cost Management:**
- Stop EC2 instances when not in use
- Use t2.micro for testing
- Monitor AWS billing

---

## 🎉 Success Criteria

Deployment is successful when:
- ✅ All 8 Docker images pushed to Docker Hub
- ✅ All 10 containers running on EC2
- ✅ Eureka shows all 6 services registered
- ✅ Frontend accessible and functional
- ✅ Can complete end-to-end booking flow

---

## 📞 Support

**Documentation:**
- Full Guide: `JENKINS_DEPLOYMENT_GUIDE.md`
- Credentials Setup: `JENKINS_CREDENTIALS_SETUP.md`
- Quick Reference: `QUICK_REFERENCE.md`

**Logs Location:**
- Jenkins: `/var/lib/jenkins/jobs/RevTickets-Pipeline/builds/`
- Docker: `docker logs <container-name>`
- Application: Inside containers at `/app/logs/`
