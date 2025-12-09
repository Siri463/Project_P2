# Jenkins Credentials Setup - Step by Step

## Your Configuration Details

**Docker Hub:**
- Username: `subodhxo`
- Password: `Subodh@2002`

**GitHub Repo:**
- URL: `https://github.com/subodhxo/revtickets.git`

---

## Step 1: Access Jenkins

1. Open browser: `http://your-jenkins-server-ip:8080`
2. Login with admin credentials

---

## Step 2: Add Docker Hub Credentials

1. Go to: **Manage Jenkins** → **Credentials** → **System** → **Global credentials (unrestricted)**
2. Click **Add Credentials**
3. Fill in:
   - **Kind**: Username with password
   - **Scope**: Global
   - **Username**: `subodhxo`
   - **Password**: `Subodh@2002`
   - **ID**: `docker-hub-credentials`
   - **Description**: Docker Hub Login
4. Click **Create**

---

## Step 3: Add EC2 SSH Key

1. Click **Add Credentials** again
2. Fill in:
   - **Kind**: SSH Username with private key
   - **Scope**: Global
   - **ID**: `ec2-ssh-key`
   - **Username**: `ubuntu`
   - **Private Key**: Click **Enter directly**
   - Paste your EC2 `.pem` file content (entire content including BEGIN/END lines)
   - **Description**: EC2 SSH Access
3. Click **Create**

---

## Step 4: Add EC2 Host IP

1. Click **Add Credentials** again
2. Fill in:
   - **Kind**: Secret text
   - **Scope**: Global
   - **Secret**: `your-ec2-public-ip` (e.g., 54.123.45.67)
   - **ID**: `ec2-host`
   - **Description**: EC2 Host IP
3. Click **Create**

---

## Step 5: Add MySQL Password

1. Click **Add Credentials** again
2. Fill in:
   - **Kind**: Secret text
   - **Scope**: Global
   - **Secret**: `root123` (or your preferred password)
   - **ID**: `mysql-root-password`
   - **Description**: MySQL Root Password
3. Click **Create**

---

## Step 6: Add Stripe API Key

1. Click **Add Credentials** again
2. Fill in:
   - **Kind**: Secret text
   - **Scope**: Global
   - **Secret**: `your-stripe-api-key` (get from Stripe dashboard)
   - **ID**: `stripe-api-key`
   - **Description**: Stripe API Key
3. Click **Create**

---

## Step 7: Create Pipeline Job

1. Go to Jenkins Dashboard
2. Click **New Item**
3. Enter name: `RevTickets-Pipeline`
4. Select: **Pipeline**
5. Click **OK**

---

## Step 8: Configure Pipeline

1. In **General** section:
   - Check **GitHub project**
   - Project url: `https://github.com/subodhxo/revtickets/`

2. In **Build Triggers** section:
   - Check **GitHub hook trigger for GITScm polling** (if using webhooks)
   - OR check **Poll SCM** and set schedule: `H/5 * * * *` (every 5 minutes)

3. In **Pipeline** section:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/subodhxo/revtickets.git`
   - **Credentials**: None (for public repo) or add GitHub credentials
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile-Complete`

4. Click **Save**

---

## Step 9: Verify Credentials

Go to: **Manage Jenkins** → **Credentials** → **System** → **Global credentials**

You should see:
- ✅ docker-hub-credentials (Username with password)
- ✅ ec2-ssh-key (SSH Username with private key)
- ✅ ec2-host (Secret text)
- ✅ mysql-root-password (Secret text)
- ✅ stripe-api-key (Secret text)

---

## Step 10: Test Pipeline

1. Go to **RevTickets-Pipeline** job
2. Click **Build Now**
3. Click on build number (e.g., #1)
4. Click **Console Output**
5. Watch the build progress

---

## Expected Pipeline Flow

```
✓ Checkout - Pull from GitHub
✓ Build Microservices - Maven builds (7 services)
✓ Build Frontend - npm build
✓ Run Tests - Unit tests
✓ Build Docker Images - 8 images created
✓ Push to Docker Hub - Upload to subodhxo/*
✓ Deploy to EC2 - SSH and docker-compose up
✓ Health Check - Verify services running
```

---

## Troubleshooting

### Build Fails at Checkout
- Verify GitHub repo URL is correct
- Check if repo is public or add GitHub credentials

### Build Fails at Docker Login
- Verify Docker Hub credentials are correct
- Username: `subodhxo`
- Password: `Subodh@2002`

### Build Fails at Deploy
- Verify EC2 SSH key is correct
- Verify EC2 host IP is correct
- Check EC2 security group allows SSH (port 22)

### Services Don't Start on EC2
- SSH into EC2: `ssh -i your-key.pem ubuntu@ec2-ip`
- Check logs: `docker logs revtickets-eureka`
- Check containers: `docker ps -a`

---

## After Successful Build

Access your application:
- **Frontend**: http://your-ec2-ip
- **API Gateway**: http://your-ec2-ip:8080
- **Eureka Dashboard**: http://your-ec2-ip:8761

---

## Next Deployment

Just push code to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Jenkins will automatically build and deploy! 🚀
