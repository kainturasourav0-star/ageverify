@echo off
title CryptoAge — Privacy-Preserving Age Verification
color 0B
echo.
echo  ╔════════════════════════════════════════╗
echo  ║   🛡️  CryptoAge — Starting Server...    ║
echo  ╚════════════════════════════════════════╝
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo  ❌ Node.js not found! Install from https://nodejs.org
    pause
    exit
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo  📦 Installing dependencies...
    npm install
    echo.
)

echo  ✅ Starting CryptoAge server...
echo  📱 Open your browser to: http://localhost:3000/app.html
echo  Press Ctrl+C to stop the server.
echo.

node server.js
pause
