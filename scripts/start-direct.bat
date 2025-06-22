@echo off
echo Starting Road Mapper Development Server (Direct Mode)...
echo.

:: Change to project root directory (parent of scripts)
cd /d "%~dp0\.."

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

:: Start Webpack directly with node
echo Starting Webpack development server...
echo.
node node_modules\webpack-dev-server\bin\webpack-dev-server.js

:: Keep window open if server crashes
pause