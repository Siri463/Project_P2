# 🚨 Emergency Troubleshooting Guide

## Quick Fixes During Demo

### 🔥 Services Not Starting

```bash
# Quick restart all
docker-compose -f docker-compose-production.yml down
docker-compose -f docker-compose-production.yml up -d

# Check what's running
docker ps

# If still failing, restart Docker Desktop
```

### 🔥 Port Conflicts

```bash
# Find what's using the port
netstat -ano | findstr :8080
netstat -ano | findstr :8761

# Kill the process
taskkill /PID <process_id> /F

# Restart services
docker-compose -f docker-compose-production.yml restart
```

### 🔥 Frontend Not Loading

```bash
# Quick frontend rebuild
cd frontend
npm run build
cd ..
docker build -t revtickets-frontend:latest ./frontend
docker-compose -f docker-compose-production.yml up -d frontend
```

### 🔥 Database Connection Issues

```bash
# Reset databases
docker-compose -f docker-compose-production.yml down -v
docker-compose -f docker-compose-production.yml up -d mysql mongodb
# Wait 30 seconds
timeout /t 30
docker-compose -f docker-compose-production.yml up -d
```

### 🔥 Eureka Services Not Registering

```bash
# Restart Eureka first
docker-compose -f docker-compose-production.yml restart eureka-server
# Wait 20 seconds
timeout /t 20
# Restart other services
docker-compose -f docker-compose-production.yml restart user-service movie-service venue-service booking-service payment-service api-gateway
```

## 🎬 Demo Backup Plans

### If Technical Issues Persist:

1. **Use Presentation Slides**: Focus on architecture and design
2. **Show Code in IDE**: Explain microservices patterns
3. **Use Postman**: Demonstrate API endpoints
4. **Screenshots/Videos**: Pre-recorded demo footage

### Key Points to Cover Even Without Live Demo:

1. **Microservices Architecture**: 7 independent services
2. **Service Discovery**: Eureka for dynamic registration
3. **API Gateway**: Centralized routing
4. **Real-time Features**: WebSocket implementation
5. **Database Design**: MySQL + MongoDB hybrid
6. **CI/CD Pipeline**: Jenkins automation
7. **Containerization**: Docker deployment

## 📞 Quick Commands Reference

```bash
# Check all services
docker ps --format "table {{.Names}}\t{{.Status}}"

# View logs
docker logs revtickets-gateway
docker logs revtickets-eureka

# Restart specific service
docker-compose -f docker-compose-production.yml restart gateway

# Full system restart
docker-compose -f docker-compose-production.yml down && docker-compose -f docker-compose-production.yml up -d

# Check service health
curl http://localhost:8080/actuator/health
curl http://localhost:8761/actuator/health
```

## 🎯 Stay Calm and Confident

Remember:
- Technical issues happen to everyone
- Focus on explaining your architecture and decisions
- Show your problem-solving skills
- Demonstrate your understanding of microservices concepts
- Your knowledge is more important than perfect execution