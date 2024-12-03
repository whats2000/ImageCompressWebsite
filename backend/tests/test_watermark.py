import json
import pytest

def test_add_watermark(client, temp_image):
    """Test watermark endpoint."""
    # First, upload an image
    upload_data = {
        'file': (temp_image, 'test_image.png')
    }
    upload_response = client.post('/api/upload', 
                                  content_type='multipart/form-data', 
                                  data=upload_data)
    upload_json = upload_response.get_json()
    
    # First compress the image
    compress_data = {
        'image_id': upload_json['image_id'],
        'compression_format': 'webp',
        'compression_quality': 75
    }
    client.post('/api/compress', 
                content_type='application/json', 
                data=json.dumps(compress_data))
    
    # Now add watermark
    watermark_data = {
        'image_id': upload_json['image_id'],
        'watermark_text': 'Test Watermark',
        'position': 'bottom-right'
    }
    
    response = client.post('/api/watermark', 
                           content_type='application/json', 
                           data=json.dumps(watermark_data))
    
    assert response.status_code == 200
    json_response = response.get_json()
    
    assert json_response['success'] is True
    assert 'watermarked_image_url' in json_response

def test_watermark_invalid_image(client):
    """Test watermarking with an invalid image ID."""
    watermark_data = {
        'image_id': 'non_existent_id',
        'watermark_text': 'Test Watermark'
    }
    
    response = client.post('/api/watermark', 
                           content_type='application/json', 
                           data=json.dumps(watermark_data))
    
    json_response = response.get_json()
    assert not json_response.get('success', True)
    assert 'not found' in json_response.get('message', '').lower()