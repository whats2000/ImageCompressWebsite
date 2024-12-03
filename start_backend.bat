@echo off
setlocal enabledelayedexpansion

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3.8 or later.
    pause
    exit /b 1
)

:: Set the project root directory
set "PROJECT_ROOT=%~dp0"

:: Set the path for virtual environment
set "VENV_PATH=%PROJECT_ROOT%backend\venv"

:: Check if virtual environment exists
if not exist "%VENV_PATH%" (
    echo Creating virtual environment...
    python -m venv "%VENV_PATH%"
)

:: Activate virtual environment
call "%VENV_PATH%\Scripts\activate"

:: Navigate to backend directory
cd "%PROJECT_ROOT%backend"

:: Install requirements
pip install -r requirements.txt

:: Set environment variables
set FLASK_APP=src\app.py
set FLASK_ENV=development
set FLASK_DEBUG=1

:: Create uploads directory if it doesn't exist
if not exist "uploads" mkdir uploads
if not exist "compressed" mkdir compressed
if not exist "watermarked" mkdir watermarked

:: Run the Flask application
echo Starting Backend Server...
flask run --host=0.0.0.0 --port=5000

pause