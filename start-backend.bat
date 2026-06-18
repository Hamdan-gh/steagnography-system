@echo off
echo ============================================
echo Starting StegaGen Processing Engine
echo ============================================
echo.

cd python-engine

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

echo.
echo Checking for virtual environment...
if exist venv (
    echo Activating virtual environment...
    call venv\Scripts\activate
) else (
    echo WARNING: Virtual environment not found
    echo Consider creating one with: python -m venv venv
    echo.
)

echo.
echo Installing/checking dependencies...
pip install -r requirements.txt --quiet

echo.
echo ============================================
echo Starting Flask server on port 5000...
echo Press Ctrl+C to stop
echo ============================================
echo.

python app.py

pause
