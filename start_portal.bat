@echo off
title CampusPulse - College Event Portal
color 0B
echo =====================================================================
echo       CampusPulse - College Event Management & QR Ticketing Portal
echo =====================================================================
echo.
echo [1/2] Starting Backend Server (Port: 5000)...
start "CampusPulse Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && node server.js"

echo [2/2] Starting Frontend Server (Port: 3000)...
start "CampusPulse Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo =====================================================================
echo  Portal successfully running!
echo  - Frontend: http://localhost:3000
echo  - Backend API: http://localhost:5000
echo  (Jab band karna ho, dono opened command prompt windows close kar dein)
echo =====================================================================
pause
