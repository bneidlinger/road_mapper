@echo off
echo Starting Road Mapper Development Server (Direct Mode)...
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

:: Change to current directory
cd /d "%~dp0"

:: Start Vite directly with node
echo Starting Vite development server...
echo.
node "%~dp0node_modules\vite\bin\vite.js"

:: Keep window open if server crashes
pause