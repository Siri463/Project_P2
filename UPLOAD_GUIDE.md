# Upload JAR Files to EC2 - Quick Guide

## Prerequisites
✅ JAR files built: Run `mvn clean package` in each service
✅ PEM key at: `C:\Users\subod\.ssh\microF.pem`
✅ EC2 IP: `174.129.48.3`
✅ EC2 folder exists: `/opt/revtickets/jars/`

## Option 1: Automated Script (Recommended)

**Run:**
```cmd
upload-jars-to-ec2.bat
```

This uploads all 7 JARs + images automatically.

---

## Option 2: Manual Upload (PowerShell)

**Step 1:** Open PowerShell
```
Win + X → Windows PowerShell
```

**Step 2:** Navigate to project
```powershell
cd "D:\Rev_TicketsFi\RevTickets\microservices"
```

**Step 3:** Upload each JAR
```powershell
scp -i "C:\Users\subod\.ssh\microF.pem" eureka-server\target\eureka-server-1.0.0.jar ubuntu@174.129.48.3:/opt/revtickets/jars/

scp -i "C:\Users\subod\.ssh\microF.pem" api-gateway\target\api-gateway-1.0.0.jar ubuntu@174.129.48.3:/opt/revtickets/jars/

scp -i "C:\Users\subod\.ssh\microF.pem" user-service\target\user-service-1.0.0.jar ubuntu@174.129.48.3:/opt/revtickets/jars/

scp -i "C:\Users\subod\.ssh\microF.pem" movie-service\target\movie-service-1.0.0.jar ubuntu@174.129.48.3:/opt/revtickets/jars/

scp -i "C:\Users\subod\.ssh\microF.pem" venue-service\target\venue-service-1.0.0.jar ubuntu@174.129.48.3:/opt/revtickets/jars/

scp -i "C:\Users\subod\.ssh\microF.pem" booking-service\target\booking-service-1.0.0.jar ubuntu@174.129.48.3:/opt/revtickets/jars/

scp -i "C:\Users\subod\.ssh\microF.pem" payment-service\target\payment-service-1.0.0.jar ubuntu@174.129.48.3:/opt/revtickets/jars/
```

**Step 4:** Upload images
```powershell
scp -i "C:\Users\subod\.ssh\microF.pem" -r movie-service\public\display\* ubuntu@174.129.48.3:/opt/revtickets/images/display/

scp -i "C:\Users\subod\.ssh\microF.pem" -r movie-service\public\banner\* ubuntu@174.129.48.3:/opt/revtickets/images/banner/
```

---

## Verify Upload

**SSH into EC2:**
```powershell
ssh -i "C:\Users\subod\.ssh\microF.pem" ubuntu@174.129.48.3
```

**Check files:**
```bash
ls -lh /opt/revtickets/jars/
ls -lh /opt/revtickets/images/display/
ls -lh /opt/revtickets/images/banner/
```

---

## Troubleshooting

**Permission denied:**
```powershell
icacls "C:\Users\subod\.ssh\microF.pem" /inheritance:r
icacls "C:\Users\subod\.ssh\microF.pem" /grant:r "%USERNAME%:R"
```

**Connection timeout:**
- Check EC2 security group allows port 22 from your IP
- Verify EC2 is running

**File not found:**
- Build JARs first: `cd microservices && build-all-services.bat`
- Check JAR names match in target folders
