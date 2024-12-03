# Image Compression Website

## Backend Setup and Running

### Prerequisites
- Python 3.8 or later
- Windows OS (for .bat scripts)

### Quick Start

#### Using Startup Scripts
1. `start_backend.bat`: Standard backend startup
   - Creates virtual environment if not exists
   - Installs requirements
   - Starts Flask development server

2. `start_backend_debug.bat`: Verbose debugging version
   - Same as standard script
   - Provides more detailed logging and version information

### Manual Setup

```bash
# Create virtual environment
python -m venv backend/venv

# Activate virtual environment
backend\venv\Scripts\activate

# Install requirements
pip install -r backend/requirements.txt

# Set environment variables
export FLASK_APP=src/app.py
export FLASK_ENV=development

# Run the application
flask run
```

### Running Tests
```bash
# Ensure you're in the backend directory
cd backend

# Run pytest
pytest tests/
```

## Features
- Image upload
- Image compression (WebP, JPEG)
- Watermarking
- Multiple image processing options
