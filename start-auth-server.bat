@echo off
echo ====================================
echo Starting StegaGen Auth Server
echo ====================================
echo.

cd server

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

if not exist .env (
    echo ERROR: .env file not found!
    echo.
    echo Please create server/.env file with your configuration.
    echo See server/.env.example for template.
    echo.
    pause
    exit /b 1
)

echo Starting server on port 3001...
echo.
call npm start

pause
