import json
import pytest

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
