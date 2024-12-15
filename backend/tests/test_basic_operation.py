import json
import os
from flask.testing import FlaskClient
from PIL import Image

def upload_image(client: FlaskClient, temp_image: str) -> str:
    """Helper function to upload an image and return its ID."""
    upload_data = {
        'file': (temp_image, 'test_image.png')
    }
    upload_response = client.post(
        '/api/upload',
        content_type='multipart/form-data',
        data=upload_data
    )
    upload_json = upload_response.get_json()
    return upload_json['image_id']

def test_resize_operation(client: FlaskClient, temp_image: str):
    """Test resize operation."""
    image_id = upload_image(client, temp_image)
    operation_data = {
        'image_id': image_id,
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
    assert response.status_code == 200
    json_response = response.get_json()
    assert json_response['success'] is True
    assert 'modified_image_url' in json_response
    modified_image_path = json_response['modified_image_url']
    assert os.path.exists(modified_image_path)
    with Image.open(modified_image_path) as img:
        assert img.size == (200, 150)

def test_rotate_operation(client: FlaskClient, temp_image: str):
    """Test rotate operation."""
    image_id = upload_image(client, temp_image)
    operation_data = {
        'image_id': image_id,
        'operations': {
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
    assert response.status_code == 200
    json_response = response.get_json()
    assert json_response['success'] is True
    assert 'modified_image_url' in json_response
    modified_image_path = json_response['modified_image_url']
    assert os.path.exists(modified_image_path)
    # Rotation is hard to validate without visual inspection, just check if it is created.

def test_crop_operation(client: FlaskClient, temp_image: str):
    """Test crop operation."""
    image_id = upload_image(client, temp_image)
    operation_data = {
        'image_id': image_id,
        'operations': {
            'crop': {
                'left': 10,
                'top': 10,
                'right': 100,
                'bottom': 100
            }
        }
    }
    response = client.post(
        '/api/basic_operation',
        content_type='application/json',
        data=json.dumps(operation_data)
    )
    assert response.status_code == 200
    json_response = response.get_json()
    assert json_response['success'] is True
    assert 'modified_image_url' in json_response
    modified_image_path = json_response['modified_image_url']
    assert os.path.exists(modified_image_path)
    with Image.open(modified_image_path) as img:
        assert img.size == (90, 90) # Validate that the cropped size is correct based on input

def test_flip_horizontal_operation(client: FlaskClient, temp_image: str):
    """Test horizontal flip operation."""
    image_id = upload_image(client, temp_image)
    operation_data = {
        'image_id': image_id,
        'operations': {
            'flip': {
                'direction': 'horizontal'
            }
        }
    }
    response = client.post(
        '/api/basic_operation',
        content_type='application/json',
        data=json.dumps(operation_data)
    )
    assert response.status_code == 200
    json_response = response.get_json()
    assert json_response['success'] is True
    assert 'modified_image_url' in json_response
    modified_image_path = json_response['modified_image_url']
    assert os.path.exists(modified_image_path)
    # Flip is hard to validate without visual inspection, just check if it is created.

def test_flip_vertical_operation(client: FlaskClient, temp_image: str):
    """Test vertical flip operation."""
    image_id = upload_image(client, temp_image)
    operation_data = {
        'image_id': image_id,
        'operations': {
            'flip': {
                'direction': 'vertical'
            }
        }
    }
    response = client.post(
        '/api/basic_operation',
        content_type='application/json',
        data=json.dumps(operation_data)
    )
    assert response.status_code == 200
    json_response = response.get_json()
    assert json_response['success'] is True
    assert 'modified_image_url' in json_response
    modified_image_path = json_response['modified_image_url']
    assert os.path.exists(modified_image_path)
    # Flip is hard to validate without visual inspection, just check if it is created.


def test_grayscale_operation(client: FlaskClient, temp_image: str):
    """Test grayscale operation."""
    image_id = upload_image(client, temp_image)
    operation_data = {
        'image_id': image_id,
        'operations': {
            'grayscale': {}
        }
    }
    response = client.post(
        '/api/basic_operation',
        content_type='application/json',
        data=json.dumps(operation_data)
    )
    assert response.status_code == 200
    json_response = response.get_json()
    assert json_response['success'] is True
    assert 'modified_image_url' in json_response
    modified_image_path = json_response['modified_image_url']
    assert os.path.exists(modified_image_path)
    with Image.open(modified_image_path) as img:
        assert img.mode == 'L'  # 'L' mode indicates grayscale

def test_basic_operation_invalid_image(client: FlaskClient):
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
