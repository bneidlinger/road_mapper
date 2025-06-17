@echo off
echo Road Mapper Development Server (Webpack)
echo ========================================
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

:: Change to current directory
cd /d "%~dp0"

:: Start Webpack dev server using direct path
echo Starting Webpack development server...
echo Server will be available at: http://localhost:8080
echo.

node node_modules\webpack-dev-server\bin\webpack-dev-server.js

:: Keep window open if server crashes
pause