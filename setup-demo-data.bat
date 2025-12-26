@echo off
echo ========================================
echo Setting up Demo Data for RevTickets
echo ========================================

echo.
echo This script will help you prepare demo data:
echo 1. Create admin user
echo 2. Add sample movies
echo 3. Create venues and screens
echo 4. Schedule shows
echo.

echo Step 1: Waiting for services to be ready...
timeout /t 30

echo.
echo Step 2: Testing API Gateway connection...
curl -s http://localhost:8080/actuator/health >nul
if errorlevel 1 (
    echo ❌ API Gateway not responding. Please check services.
    pause
    exit /b 1
)
echo ✅ API Gateway is ready

echo.
echo ========================================
echo 📋 MANUAL DEMO DATA SETUP REQUIRED
echo ========================================
echo.
echo Please complete these steps manually:
echo.
echo 1. 👤 CREATE ADMIN USER:
echo    - Go to: http://localhost/register
echo    - Email: admin@revtickets.com
echo    - Password: admin123
echo    - Role: Admin
echo.
echo 2. 🎬 ADD SAMPLE MOVIES:
echo    - Login as admin
echo    - Go to Admin Panel → Movies
echo    - Add 3-4 popular movies with posters
echo.
echo 3. 🏢 CREATE VENUES:
echo    - Go to Admin Panel → Venues
echo    - Add "Cineplex Downtown" with 3 screens
echo    - Screen 1: 50 seats, Screen 2: 75 seats, Screen 3: 100 seats
echo.
echo 4. 📅 SCHEDULE SHOWS:
echo    - Go to Admin Panel → Shows
echo    - Create shows for today and tomorrow
echo    - Different time slots: 10:00 AM, 2:00 PM, 6:00 PM, 9:00 PM
echo.
echo 5. 🧪 TEST BOOKING FLOW:
echo    - Register a regular user
echo    - Browse movies and select show
echo    - Test seat selection (open 2 browsers)
echo    - Complete booking process
echo.

echo ========================================
echo 🎯 DEMO CHECKLIST
echo ========================================
echo.
echo Before your demo, verify:
echo [ ] All services running (docker ps)
echo [ ] Eureka shows 6 services registered
echo [ ] Admin user created and can login
echo [ ] At least 3 movies added with posters
echo [ ] Venue with multiple screens created
echo [ ] Shows scheduled for demo day
echo [ ] Test user can complete booking
echo [ ] Real-time seat selection works
echo.

echo Press any key to open admin panel...
pause >nul

start http://localhost/admin/login

echo.
echo 🎬 Good luck with your demo preparation!
echo.