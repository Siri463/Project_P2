# Fixes Applied for AWS Deployment Issues

## Issues Fixed:

### 1. Image Loading Problems (ERR_NAME_NOT_RESOLVED)
- **Problem**: Images showing "200x300?text=No+Image" causing DNS resolution errors
- **Fix**: Updated placeholder image URLs to use `https://via.placeholder.com/200x300?text=No+Image`
- **Files Changed**:
  - `frontend/src/app/core/services/event.service.ts`
  - `frontend/src/app/features/admin/events/event-list.component.ts`

### 2. API Save Error (415 Unsupported Media Type)
- **Problem**: Event save requests failing due to content type mismatch
- **Fix**: Added proper content type handling in Spring Boot controllers
- **Files Changed**:
  - `microservices/movie-service/src/main/java/com/revature/movieservice/controller/EventController.java`
  - Added `consumes = {"application/json", "multipart/form-data"}` to endpoints

### 3. Environment Configuration
- **Problem**: Frontend using old AWS IP address
- **Fix**: Updated production environment to use correct AWS IP `52.91.51.47:8080`
- **Files Changed**:
  - `frontend/src/environments/environment.prod.ts`

### 4. Image URL Resolution
- **Problem**: Hardcoded localhost URLs in image loading
- **Fix**: Updated to use environment configuration
- **Files Changed**:
  - `frontend/src/app/features/admin/events/event-form.component.ts`
  - `frontend/src/app/features/admin/events/event-list.component.ts`

### 5. API Service Improvements
- **Problem**: Inconsistent API call handling
- **Fix**: Created dedicated AdminService with proper headers
- **Files Added**:
  - `frontend/src/app/core/services/admin.service.ts`

## Deployment Steps:

1. **Build All Services**:
   ```bash
   # Run the deployment script
   deploy-fixes.bat
   ```

2. **Copy to AWS EC2**:
   ```bash
   # Copy JAR files to EC2
   scp microservices/*/target/*.jar ubuntu@52.91.51.47:~/jars/
   
   # Copy frontend build
   scp -r frontend/dist/revtickets-frontend/* ubuntu@52.91.51.47:~/frontend/
   ```

3. **Restart Services on AWS**:
   ```bash
   # SSH to EC2
   ssh ubuntu@52.91.51.47
   
   # Stop services
   docker-compose down
   
   # Rebuild images with new JARs
   docker-compose build
   
   # Start services
   docker-compose up -d
   ```

## Expected Results:
- ✅ Images will load properly (no more ERR_NAME_NOT_RESOLVED)
- ✅ Event save operations will work (no more 415 errors)
- ✅ All API calls will use correct AWS IP address
- ✅ Admin panel will function properly

## Testing:
1. Visit `http://52.91.51.47/admin/events`
2. Try creating/editing an event
3. Verify images load correctly
4. Check that save operations complete successfully