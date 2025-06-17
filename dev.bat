@echo off
echo Road Mapper Development Server
echo ==============================
echo.

:: Change to script directory
cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules" (
    echo [!] Dependencies not found. Installing...
    call npm install
    
    :: Install Windows-specific Rollup binary
    echo [!] Installing Windows compatibility packages...
    call npm install @rollup/rollup-win32-x64-msvc --save-optional
    echo.
)

:: Check Node.js version
echo [i] Node.js version:
node --version
echo.

:: Try to start Vite server
echo [*] Starting development server...
echo.

:: First try npm run dev
call npm run dev

:: If that fails, try direct execution
if errorlevel 1 (
    echo.
    echo [!] npm run dev failed, trying direct execution...
    node "%~dp0node_modules\vite\bin\vite.js"
)

:: Keep window open
echo.
pause