@echo off
setlocal enabledelayedexpansion

:: Verbose debugging script for backend startup

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python 3.8 or later.
    pause
    exit /b 1
)

:: Set the project root directory
set "PROJECT_ROOT=%~dp0"

:: Set the path for virtual environment
set "VENV_PATH=%PROJECT_ROOT%backend\venv"

:: Check if virtual environment exists
if not exist "%VENV_PATH%" (
    echo [INFO] Creating virtual environment...
    python -m venv "%VENV_PATH%"
)

:: Activate virtual environment
echo [INFO] Activating virtual environment...
call "%VENV_PATH%\Scripts\activate"

:: Navigate to backend directory
cd "%PROJECT_ROOT%backend"

:: Upgrade pip
echo [INFO] Upgrading pip...
python -m pip install --upgrade pip

:: Install requirements
echo [INFO] Installing requirements...
pip install -r requirements.txt

:: Set environment variables
set FLASK_APP=src\app.py
set FLASK_ENV=development
set FLASK_DEBUG=1

:: Create uploads directory if it doesn't exist
echo [INFO] Checking and creating necessary directories...
if not exist "uploads" (
    mkdir uploads
    echo [INFO] Created uploads directory
)
if not exist "compressed" (
    mkdir compressed
    echo [INFO] Created compressed directory
)
if not exist "watermarked" (
    mkdir watermarked
    echo [INFO] Created watermarked directory
)

:: Display Python and pip versions
echo [INFO] Python version:
python --version
echo [INFO] Pip version:
pip --version

:: Run the Flask application
echo [INFO] Starting Backend Server...
flask run --host=0.0.0.0 --port=5000

pause