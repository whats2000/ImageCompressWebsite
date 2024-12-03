#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}Python is not installed. Please install Python 3.8 or later.${NC}"
    exit 1
fi

# Set the project root directory
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set the path for virtual environment
VENV_PATH="${PROJECT_ROOT}/backend/venv"

# Check if virtual environment exists
if [ ! -d "$VENV_PATH" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv "$VENV_PATH"
fi

# Activate virtual environment
source "$VENV_PATH/bin/activate"

# Navigate to backend directory
cd "$PROJECT_ROOT/backend"

# Upgrade pip
echo -e "${GREEN}Upgrading pip...${NC}"
pip install --upgrade pip

# Install requirements
echo -e "${GREEN}Installing requirements...${NC}"
pip install -r requirements.txt

# Set environment variables
export FLASK_APP=src/app.py
export FLASK_ENV=development
export FLASK_DEBUG=1

# Create necessary directories
echo -e "${GREEN}Checking and creating necessary directories...${NC}"
mkdir -p uploads compressed watermarked

# Display Python and pip versions
echo -e "${GREEN}Python version:${NC}"
python3 --version
echo -e "${GREEN}Pip version:${NC}"
pip --version

# Run the Flask application
echo -e "${GREEN}Starting Backend Server...${NC}"
flask run --host=0.0.0.0 --port=5000