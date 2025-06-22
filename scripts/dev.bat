@echo off
echo Road Mapper Development Server (Webpack)
echo ========================================
echo.

:: Change to project root directory (parent of scripts)
cd /d "%~dp0\.."

:: Check if node_modules exists
if not exist "node_modules" (
    echo [!] Dependencies not found. Installing...
    call npm install
    echo.
)

:: Check Node.js version
echo [i] Node.js version:
node --version
echo.

:: Start Webpack dev server
echo [*] Starting development server...
echo.

:: Run npm dev script
call npm run dev

:: Keep window open
echo.
pause