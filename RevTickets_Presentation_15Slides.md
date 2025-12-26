# RevTickets - Movie Ticket Booking Platform

## Slide 1: RevTickets
**Microservices Movie Booking Platform**
- Real-time seat selection • Stripe payments • AWS deployment
- Spring Cloud + Angular 18 • WebSocket + CI/CD

## Slide 2: Tech Stack
**Backend:** Spring Boot 3.2 • MySQL + MongoDB • WebSocket
**Frontend:** Angular 18 • TypeScript • Tailwind CSS
**DevOps:** Docker • Jenkins • AWS EC2

## Slide 3: Architecture
```
Angular (:4200) → Gateway (:8080) ← Eureka (:8761)
                      ↓
    User • Movie • Venue • Booking • Payment
   :8081  :8082   :8083   :8084     :8085
```
**7 Services** with service discovery & load balancing

## Slide 4: Core Features
• JWT Authentication • Movie Search • Theater Management
• **Real-time Seat Selection** (WebSocket) • Stripe Payments
• Booking History • Admin Panel

## Slide 5: Database Design
**MySQL:** Users, bookings, venues, seats
**MongoDB:** Movies catalog, events
**Hybrid approach** for performance optimization

## Slide 6: Real-Time WebSocket
**SockJS + STOMP** • Endpoint: `/ws` • Topic: `/topic/seats/{showId}`
**Instant seat updates** → Prevents double booking

## Slide 7: API Gateway
**Centralized Routing (:8080)**
```
/api/users/** → User Service
/api/movies/** → Movie Service  
/api/bookings/** → Booking Service
```
**Load balancing • Service discovery • Fault tolerance**

## Slide 8: CI/CD Pipeline
**Git Push → Jenkins → AWS EC2**
```
1. Checkout → 2. Build (Maven+npm) → 3. Test
4. Docker Build → 5. Push Registry → 6. Deploy EC2
```
**Automated deployment** with docker-compose

## Slide 9: Jenkins Pipeline
```groovy
stage('Build') {
    sh 'mvn clean package && npm run build'
}
stage('Docker') {
    sh 'docker build -t revtickets-gateway ./api-gateway'
}
stage('Deploy') {
    sshagent(['ec2-key']) {
        sh 'ssh ubuntu@ec2-ip "docker-compose up -d"'
    }
}
```

## Slide 10: AWS Deployment
**EC2:** t2.large • Ubuntu 22.04 • 30GB EBS
**Ports:** 22, 80, 8080, 8761
**Stack:** Docker + Java 17 + MySQL/MongoDB containers

## Slide 11: Deployment Flow
```
Git Push → Jenkins → Docker Build → EC2 Deploy
    ↓           ↓         ↓           ↓
  Webhook    Build/Test  Registry   Live App
```
**Automated** docker-compose deployment

## Slide 12: Docker Compose
```yaml
services:
  mysql: { image: mysql:8.0, volumes: [mysql-data:/var/lib/mysql] }
  eureka: { image: revtickets-eureka, ports: ["8761:8761"] }
  gateway: { image: revtickets-gateway, ports: ["8080:8080"] }
  frontend: { image: revtickets-frontend, ports: ["80:80"] }
```

## Slide 13: Security & Monitoring
**Security:** JWT • BCrypt • HTTPS • AWS Security Groups
**Monitoring:** Eureka Dashboard • Actuator • CloudWatch

## Slide 14: Demo Flow
**Login → Browse → Select Theater → Real-time Seats → Payment → Confirmation**

## Slide 15: Results
✅ **Scalable microservices** with service discovery
✅ **Real-time experience** with WebSocket
✅ **Automated CI/CD** to AWS production
✅ **Enterprise-ready** architecture

**Questions?**
