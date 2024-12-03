#!/bin/bash

# Debugging startup script with verbose output

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to log messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    log_error "Python is not installed. Please install Python 3.8 or later."
    exit 1
fi

# Set the project root directory
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set the path for virtual environment
VENV_PATH="${PROJECT_ROOT}/backend/venv"

# Check if virtual environment exists
if [ ! -d "$VENV_PATH" ]; then
    log_warning "Virtual environment not found. Creating new environment..."
    python3 -m venv "$VENV_PATH"
    if [ $? -ne 0 ]; then
        log_error "Failed to create virtual environment"
        exit 1
    fi
fi

# Activate virtual environment
log_info "Activating virtual environment..."
source "$VENV_PATH/bin/activate"

# Navigate to backend directory
cd "$PROJECT_ROOT/backend" || exit

# Upgrade pip
log_info "Upgrading pip..."
pip install --upgrade pip

# Install requirements
log_info "Installing requirements..."
pip install -r requirements.txt

# Set environment variables
export FLASK_APP=src/app.py
export FLASK_ENV=development
export FLASK_DEBUG=1

# Create necessary directories
log_info "Checking and creating necessary directories..."
mkdir -p uploads compressed watermarked

# Display system information
echo ""
log_info "System Information:"
log_info "Project Root: $PROJECT_ROOT"
log_info "Virtual Env: $VENV_PATH"

# Display Python and pip versions
log_info "Python version:"
python3 --version
log_info "Pip version:"
pip --version

# Diagnostic checks
log_info "Checking backend files..."
ls -l src/

# Run the Flask application
echo ""
log_info "Starting Backend Server in DEBUG mode..."
flask run --host=0.0.0.0 --port=5000 --debugger