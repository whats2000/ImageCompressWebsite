# Image Compression Website

## Backend Setup and Running

### Prerequisites
- Python 3.8 or later
- Windows or Unix-like OS (Linux/macOS)

### Quick Start

#### Windows
1. `start_backend.bat`: Standard backend startup
   - Creates virtual environment if not exists
   - Installs requirements
   - Starts Flask development server

2. `start_backend_debug.bat`: Verbose debugging version
   - Same as standard script
   - Provides more detailed logging and version information

#### Unix/Linux/macOS
1. `start_backend.sh`: Standard backend startup
   ```bash
   chmod +x start_backend.sh
   ./start_backend.sh
   ```

2. `start_backend_debug.sh`: Verbose debugging version
   ```bash
   chmod +x start_backend_debug.sh
   ./start_backend_debug.sh
   ```

### Manual Setup

```bash
# Create virtual environment
python3 -m venv backend/venv

# Activate virtual environment
source backend/venv/bin/activate  # Unix
backend\venv\Scripts\activate     # Windows

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

## Cross-Platform Support
- Startup scripts for Windows (.bat)
- Startup scripts for Unix/Linux/macOS (.sh)
- Consistent virtual environment setup
- Automatic requirement installation
