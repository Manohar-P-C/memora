@echo off
title Memora - Your Second Memory
color 0A

echo.
echo  ================================
echo    MEMORA - Your Second Memory
echo  ================================
echo.
echo  Starting local server...
echo  App will open at: http://localhost:3000
echo.
echo  [Keep this window open while using the app]
echo  [Close this window to stop the server]
echo.

cd /d "%~dp0memora"

:: Open browser after a short delay (runs in background)
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

:: Start the dev server
npm run dev

pause
