@echo off
setlocal enabledelayedexpansion

title FactoryBrain - Starting System...
color 0B

echo ===================================================
echo               FACTORYBRAIN LAUNCHER                
echo ===================================================
echo.

:: Resolve Directory
cd /d "%~dp0"
if exist "factorybrain\package.json" (
    cd factorybrain
)

if not exist "package.json" (
    color 0C
    echo [ERROR] package.json not found!
    echo Please make sure this file is inside the FactoryBrain directory.
    echo.
    pause
    exit /b 1
)

:: Check Node.js
echo [1/3] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js [v18 or higher] from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo       Node.js version: !NODE_VER!

:: Check Dependencies
echo.
echo [2/3] Checking project dependencies...
if not exist "node_modules\" (
    echo       node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] npm install failed!
        echo.
        pause
        exit /b 1
    )
) else (
    echo       Dependencies are ready.
)

:: Launch Browser in Background after 3s
echo.
echo [3/3] Launching FactoryBrain on http://localhost:3000 ...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

echo.
echo ===================================================
echo   FactoryBrain is starting...
echo   Local URL: http://localhost:3000
echo   Press Ctrl+C in this window to stop the server.
echo ===================================================
echo.

title FactoryBrain [Running - http://localhost:3000]
color 0A

call npm run dev

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERROR] FactoryBrain stopped with an error code: %errorlevel%
    pause
)
