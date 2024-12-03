import os
import pytest
import random
from PIL import Image
import io

# Adjusting the import for the Flask app
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from app import create_app

@pytest.fixture
def temp_image():
    """Create a temporary test image."""
    # Create a random image
    img = Image.new('RGB', (100, 100), color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr

@pytest.fixture()
def client():
    """Create a test client for the Flask application."""
    app = create_app()  # Create an app instance here
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client