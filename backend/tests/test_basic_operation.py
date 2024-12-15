import json
import os
from flask.testing import FlaskClient

def test_basic_operation(client: 'FlaskClient', temp_image: str):
    """Test basic image operation endpoint."""
    # First, upload an image
    upload_data = {
        'file': (temp_image, 'test_image.png')
    }
    upload_response = client.post(
        '/api/upload',
        content_type='multipart/form-data',
        data=upload_data
    )
    upload_json = upload_response.get_json()

    # Perform basic operations
    operation_data = {
        'image_id': upload_json['image_id'],
        'operations': {
            'resize': {
                'width': 200,
                'height': 150
            },
            'rotate': {
                'angle': 90
            }
        }
    }
    response = client.post(
        '/api/basic_operation',
        content_type='application/json',
        data=json.dumps(operation_data)
    )

    # Check response
    assert response.status_code == 200
    json_response = response.get_json()
    assert json_response['success'] is True
    assert 'modified_image_url' in json_response

    # Verify the modified image is created
    modified_image_path = json_response['modified_image_url']
    assert os.path.exists(modified_image_path)


def test_basic_operation_invalid_image(client: 'FlaskClient'):
    """Test basic operation with an invalid image ID."""
    operation_data = {
        'image_id': 'non_existent_id',
        'operations': {
           'resize': {
                'width': 200,
                'height': 150
            }
        }
    }

    response = client.post(
        '/api/basic_operation',
        content_type='application/json',
        data=json.dumps(operation_data)
    )

    json_response = response.get_json()
    assert not json_response.get('success', True)
    assert 'not found' in json_response.get('message', '').lower()
