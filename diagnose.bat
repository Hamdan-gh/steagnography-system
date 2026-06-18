@echo off
echo ============================================================
echo StegaGen API - Quick Diagnosis
echo ============================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

echo Checking if requests library is installed...
python -c "import requests" >nul 2>&1
if errorlevel 1 (
    echo Installing requests library...
    pip install requests
)

echo.
echo Running diagnosis...
echo.

python quick_diagnosis.py

echo.
echo ============================================================
pause
