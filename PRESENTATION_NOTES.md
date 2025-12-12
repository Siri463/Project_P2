# RevTickets - API Gateway Pattern & Deployment Flow

## 1. API GATEWAY PATTERN

### What is API Gateway?
- **Single Entry Point** for all client requests
- Routes requests to appropriate microservices
- Acts as a reverse proxy

### Why API Gateway?

**Without API Gateway:**
```
Frontend → User Service (8081)
Frontend → Movie Service (8082)
Frontend → Booking Service (8084)
Frontend → Payment Service (8085)
```
❌ Multiple endpoints to manage
❌ CORS configuration on every service
❌ Security on every service
❌ Client needs to know all service URLs

**With API Gateway:**
```
Frontend → API Gateway (8080) → Routes to correct service
```
✅ Single endpoint (http://localhost:8080/api)
✅ Centralized CORS, security, logging
✅ Client doesn't know internal architecture
✅ Easy to add/remove services

### Our API Gateway Implementation

**Technology:** Spring Cloud Gateway

**Port:** 8080

**Routes Configuration:**
```yaml
/api/auth/**          → User Service (8081)
/api/admin/users/**   → User Service (8081)
/api/admin/dashboard/** → User Service (8081)

/api/movies/**        → Movie Service (8082)
/api/events/**        → Movie Service (8082)
/api/reviews/**       → Movie Service (8082)

/api/venues/**        → Venue Service (8083)

/api/bookings/**      → Booking Service (8084)
/api/shows/**         → Booking Service (8084)
/api/seats/**         → Booking Service (8084)

/api/payments/**      → Payment Service (8085)
```

### Key Features

**1. Service Discovery Integration**
- Uses Eureka Server (8761)
- Automatically discovers service instances
- Load balancing across multiple instances

**2. Request Routing**
```
Client Request: GET /api/movies/1
    ↓
API Gateway receives at port 8080
    ↓
Checks route: /api/movies/** → movie-service
    ↓
Queries Eureka: Where is movie-service?
    ↓
Eureka responds: localhost:8082
    ↓
Gateway forwards: GET http://localhost:8082/api/movies/1
    ↓
Response sent back to client
```

**3. Cross-Cutting Concerns**
- CORS handling
- Request/Response logging
- Error handling
- Timeout management

### Benefits in RevTickets

1. **Simplified Frontend**
   - One base URL: `http://localhost:8080/api`
   - No need to manage multiple service URLs

2. **Security**
   - Authentication/Authorization at gateway level
   - Internal services not exposed directly

3. **Scalability**
   - Can run multiple instances of any service
   - Gateway load balances automatically

4. **Monitoring**
   - Centralized logging of all requests
   - Easy to track API usage

---

## 2. DEPLOYMENT FLOW OVERVIEW

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    AWS AMPLIFY                          │
│              Angular 18 Frontend                        │
│         https://revtickets.amplifyapp.com              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   AWS EC2 Instance                      │
│                  (Ubuntu 22.04 LTS)                     │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Eureka Server (8761)                     │  │
│  │         Service Discovery                        │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↑                               │
│                         │ Register                      │
│  ┌──────────────────────┴───────────────────────────┐  │
│  │         API Gateway (8080)                       │  │
│  │         Spring Cloud Gateway                     │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │ Routes                        │
│         ┌───────────────┼───────────────┐              │
│         ↓               ↓               ↓              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│  │User Service │ │Movie Service│ │Venue Service│     │
│  │   (8081)    │ │   (8082)    │ │   (8083)    │     │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘     │
│         │               │               │              │
│  ┌─────────────┐ ┌─────────────┐                      │
│  │Booking Svc  │ │Payment Svc  │                      │
│  │   (8084)    │ │   (8085)    │                      │
│  └──────┬──────┘ └──────┬──────┘                      │
│         │               │                              │
│  ┌──────┴───────────────┴──────┐                      │
│  │      MySQL (3306)           │                      │
│  │  - revtickets_user_db       │                      │
│  │  - revtickets_movie_db      │                      │
│  │  - revtickets_venue_db      │                      │
│  │  - booking_db               │                      │
│  │  - payment_db               │                      │
│  └─────────────────────────────┘                      │
│                                                         │
│  ┌─────────────────────────────┐                      │
│  │    MongoDB (27017)          │                      │
│  │  - revtickets_reviews       │                      │
│  └─────────────────────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### Deployment Steps

**Phase 1: Local Development**
```
1. Develop microservices (Spring Boot)
2. Develop frontend (Angular 18)
3. Test locally with all services running
4. Build JARs: mvn clean package
```

**Phase 2: EC2 Setup**
```
1. Launch EC2 instance (Ubuntu 22.04, t2.large)
2. Install dependencies:
   - Java 17
   - MySQL 8.0
   - MongoDB 6.0
3. Configure security groups (ports 22, 80, 8080-8085, 8761)
4. Create databases and users
```

**Phase 3: Service Deployment**
```
1. Upload JARs to EC2 (/opt/revtickets/jars/)
2. Create systemd service files for each microservice
3. Start services in order:
   a. Eureka Server (8761) - wait 30s
   b. All microservices (8081-8085) - wait 20s
   c. API Gateway (8080)
4. Verify all services registered with Eureka
```

**Phase 4: Frontend Deployment**
```
1. Push Angular code to GitHub
2. Connect AWS Amplify to GitHub repo
3. Configure build settings (amplify.yml)
4. Set environment variable: API_URL=http://EC2_IP:8080/api
5. Deploy - Amplify builds and hosts automatically
```

**Phase 5: Production Hardening**
```
1. Configure UFW firewall
2. Setup SSL/TLS (Let's Encrypt or AWS Certificate Manager)
3. Enable CloudWatch monitoring
4. Configure auto-restart for services
5. Setup database backups
```

### Service Startup Sequence

**Critical Order:**
```
1. MySQL & MongoDB (databases must be ready)
   ↓
2. Eureka Server (service registry)
   ↓ (wait 30 seconds)
3. Microservices (register with Eureka)
   - User Service
   - Movie Service
   - Venue Service
   - Booking Service
   - Payment Service
   ↓ (wait 20 seconds for registration)
4. API Gateway (needs services to be registered)
   ↓
5. Frontend (connects to API Gateway)
```

**Why this order?**
- Services need databases to start
- Services need Eureka to register
- Gateway needs services to route requests
- Frontend needs Gateway to make API calls

### Request Flow in Production

**Example: User books a movie ticket**

```
1. User clicks "Book Ticket" on Angular app
   ↓
2. Angular sends: POST https://revtickets.amplifyapp.com/api/bookings
   ↓
3. Request goes to API Gateway (EC2:8080)
   ↓
4. Gateway checks authentication (JWT token)
   ↓
5. Gateway routes to Booking Service (EC2:8084)
   ↓
6. Booking Service:
   - Validates show availability
   - Calls Movie Service (via Gateway) for movie details
   - Calls Venue Service (via Gateway) for seat info
   - Creates booking in booking_db
   - Updates available seats
   ↓
7. Booking Service calls Payment Service (EC2:8085)
   ↓
8. Payment Service processes payment
   ↓
9. Response flows back through Gateway to Frontend
   ↓
10. User sees booking confirmation
```

### Monitoring & Maintenance

**Health Checks:**
```bash
# Eureka Dashboard
http://EC2_IP:8761

# Service Health
http://EC2_IP:8080/api/movies/health
http://EC2_IP:8080/api/bookings/health

# Logs
/opt/revtickets/logs/service-name.log
```

**Auto-Restart:**
- Systemd configured with `Restart=always`
- Services auto-restart on failure
- Services auto-start on EC2 reboot

**Scaling Strategy:**
```
Current: Single EC2 instance
Future:
- Multiple EC2 instances behind Load Balancer
- RDS for MySQL (managed database)
- DocumentDB for MongoDB
- ElastiCache for Redis (caching)
- ECS/EKS for container orchestration
```

---

## 3. KEY PRESENTATION POINTS

### API Gateway Pattern Benefits

✅ **Single Entry Point**
- One URL for all APIs
- Simplified client configuration

✅ **Service Abstraction**
- Clients don't know internal architecture
- Easy to refactor/replace services

✅ **Cross-Cutting Concerns**
- Authentication/Authorization
- Logging & Monitoring
- Rate Limiting
- CORS handling

✅ **Load Balancing**
- Distributes requests across service instances
- Automatic failover

✅ **Service Discovery**
- Dynamic service registration
- No hardcoded URLs

### Deployment Flow Benefits

✅ **Microservices Architecture**
- Independent deployment
- Technology flexibility
- Fault isolation

✅ **Cloud-Native**
- AWS Amplify for frontend (CDN, auto-scaling)
- EC2 for backend (full control)
- Managed databases (future: RDS, DocumentDB)

✅ **DevOps Ready**
- Systemd for service management
- Automated restarts
- Centralized logging

✅ **Scalable**
- Can add more EC2 instances
- Load balancer ready
- Database replication ready

---

## 4. DEMO FLOW

**1. Show Architecture Diagram**
- Explain each component
- Highlight API Gateway role

**2. Show Eureka Dashboard**
- Open http://EC2_IP:8761
- Show all registered services

**3. Show API Gateway Routes**
- Show application.yml configuration
- Explain route mapping

**4. Live Request Demo**
```
Frontend → API Gateway → Movie Service
Show browser network tab
Show request going to /api/movies
Show response from movie-service
```

**5. Show Service Logs**
```bash
tail -f /opt/revtickets/logs/api-gateway.log
# Make a request from frontend
# Show log entry in real-time
```

**6. Show Systemd Management**
```bash
sudo systemctl status api-gateway
sudo systemctl restart movie-service
# Show auto-restart in action
```

**7. Show Scalability**
- Explain how to add more instances
- Show load balancing capability

---

## 5. Q&A PREPARATION

**Q: Why not use Nginx instead of Spring Cloud Gateway?**
A: Spring Cloud Gateway integrates with Eureka for service discovery, provides better Java ecosystem integration, and offers built-in circuit breakers and retry logic.

**Q: What if API Gateway fails?**
A: We can run multiple Gateway instances behind a load balancer. Systemd auto-restarts failed services.

**Q: How do you handle authentication?**
A: JWT tokens validated at API Gateway level. User Service issues tokens, Gateway validates them before routing.

**Q: Why single EC2 instead of containers?**
A: Simpler deployment for MVP. Future: migrate to ECS/EKS for better scaling and management.

**Q: How do you handle database failures?**
A: Currently: Systemd restarts services. Future: Use RDS with Multi-AZ for high availability.

**Q: What about HTTPS?**
A: Frontend on Amplify has HTTPS. Backend: Add ALB with SSL certificate or use Nginx with Let's Encrypt.

---

## 6. CONCLUSION

**RevTickets demonstrates:**
- ✅ Modern microservices architecture
- ✅ API Gateway pattern for centralized routing
- ✅ Service discovery with Eureka
- ✅ Cloud deployment on AWS
- ✅ Separation of frontend and backend
- ✅ Scalable and maintainable design

**Production Ready Features:**
- Auto-restart on failure
- Centralized logging
- Health monitoring
- Database persistence
- CORS handling
- JWT authentication

**Future Enhancements:**
- Container orchestration (Docker + Kubernetes)
- CI/CD pipeline (Jenkins/GitHub Actions)
- Managed databases (RDS, DocumentDB)
- Caching layer (Redis/ElastiCache)
- Message queue (RabbitMQ/SQS)
- Distributed tracing (Zipkin/X-Ray)
