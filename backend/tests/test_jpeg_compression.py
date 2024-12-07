import os
import sys
import numpy as np
import pytest
from PIL import Image

# Adjust a Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from utils.jpeg_compression import jpeg_compression

def test_jpeg_compression_basic():
    """
    Test basic functionality of JPEG compression
    """
    # Create a test image (a simple small image)
    test_image = Image.new('RGB', (100, 100), color='red')
    
    # Compress the image
    compressed_image = jpeg_compression(test_image)
    
    # Check basic properties
    assert compressed_image is not None, "Compressed image should not be None"
    assert isinstance(compressed_image, Image.Image), "Should return a PIL Image"
    assert compressed_image.size == (100, 100), "Image size should remain the same"

def test_jpeg_compression_quality_levels():
    """
    Test different quality levels of compression
    """
    # Create a test image
    test_image = Image.new('RGB', (200, 200), color='blue')
    
    # Test various quality levels
    quality_levels = [1, 50, 85, 100]
    
    for quality in quality_levels:
        compressed_image = jpeg_compression(test_image, quality)
        
        # Verify compression
        assert compressed_image is not None, f"Compression failed for quality {quality}"
        assert compressed_image.size == (200, 200), f"Image size changed for quality {quality}"

def test_jpeg_compression_color_preservation():
    """
    Test that image colors are approximately preserved after compression
    """
    # Create a test image with various colors
    test_image = Image.new('RGB', (150, 150), color='purple')
    
    # Compress the image
    compressed_image = jpeg_compression(test_image, quality=85)
    
    # Compare color statistics
    original_array = np.array(test_image)
    compressed_array = np.array(compressed_image)
    
    # Check color similarity (allowing some variance due to compression)
    color_diff = np.mean(np.abs(original_array - compressed_array))
    assert color_diff < 50, f"Color preservation failed. Significant color change detected: {color_diff}"

def test_jpeg_compression_invalid_input():
    """
    Test error handling for invalid inputs
    """
    # Test with None
    with pytest.raises(ValueError, match="Input image cannot be None"):
        jpeg_compression(None)
    
    # Test with invalid image type
    with pytest.raises(TypeError, match="Expected PIL Image"):
        jpeg_compression("not an image")
    
    # Test with invalid quality values
    with pytest.raises(ValueError, match="Quality must be between 1 and 100"):
        jpeg_compression(Image.new('RGB', (50, 50), color='green'), quality=0)
    
    with pytest.raises(ValueError, match="Quality must be between 1 and 100"):
        jpeg_compression(Image.new('RGB', (50, 50), color='green'), quality=101)
    
    with pytest.raises(TypeError, match="Quality must be an integer"):
        jpeg_compression(Image.new('RGB', (50, 50), color='green'), quality="not an int")

def test_jpeg_compression_memory_efficiency():
    """
    Test that compression doesn't create excessively large images
    """
    # Create a larger test image
    test_image = Image.new('RGB', (1000, 1000), color='yellow')
    
    # Compress the image
    compressed_image = jpeg_compression(test_image, quality=50)
    
    # Check image dimensions
    assert compressed_image.size == (1000, 1000), "Image size should remain consistent"
    
    # Optional: Check memory efficiency (rough estimate)
    compressed_array = np.array(compressed_image)
    assert compressed_array.nbytes > 0, "Compressed image should have non-zero memory"
