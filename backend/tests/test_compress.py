import json
import pytest
import io
from PIL import Image

def test_compress_image(client, temp_image):
    """Test image compression endpoint."""
    # First, upload an image
    upload_data = {
        'file': (temp_image, 'test_image.png')
    }
    upload_response = client.post('/api/upload', 
                                  content_type='multipart/form-data', 
                                  data=upload_data)
    upload_json = upload_response.get_json()
    
    # Compress the image to WebP
    compress_data = {
        'image_id': upload_json['image_id'],
        'compression_format': 'webp',
        'compression_quality': 75
    }
    
    response = client.post('/api/compress', 
                           content_type='application/json', 
                           data=json.dumps(compress_data))
    
    # Check response
    assert response.status_code == 200
    json_response = response.get_json()
    
    assert json_response['success'] is True
    assert 'compressed_image_url' in json_response

    # Additional verifications could be added here to check image properties

def test_compress_with_different_formats(client, temp_image):
    """Test compression with different formats."""
    # Upload an image
    upload_data = {
        'file': (temp_image, 'test_image.png')
    }
    upload_response = client.post('/api/upload', 
                                  content_type='multipart/form-data', 
                                  data=upload_data)
    upload_json = upload_response.get_json()
    
    # Test JPEG compression
    jpeg_compress_data = {
        'image_id': upload_json['image_id'],
        'compression_format': 'jpeg',
        'compression_quality': 50
    }
    
    jpeg_response = client.post('/api/compress', 
                                content_type='application/json', 
                                data=json.dumps(jpeg_compress_data))
    
    assert jpeg_response.status_code == 200
    jpeg_json_response = jpeg_response.get_json()
    
    assert jpeg_json_response['success'] is True
    assert 'compressed_image_url' in jpeg_json_response

def test_compress_invalid_image(client):
    """Test compression with an invalid image ID."""
    compress_data = {
        'image_id': 'non_existent_id',
        'compression_format': 'jpeg',
        'compression_quality': 50
    }
    
    response = client.post('/api/compress', 
                           content_type='application/json', 
                           data=json.dumps(compress_data))
    
    json_response = response.get_json()
    assert not json_response.get('success', True)
    assert 'not found' in json_response.get('message', '').lower()
