import io

from flask.testing import FlaskClient


def test_upload_image(client: 'FlaskClient', temp_image: str):
    """Test image upload endpoint."""
    data = {
        'file': (temp_image, 'test_image.png')
    }
    response = client.post(
        '/api/upload',
        content_type='multipart/form-data',
        data=data
    )

    assert response.status_code == 200
    json_response = response.get_json()

    assert json_response['success'] is True
    assert json_response['message'] == 'Image uploaded successfully'
    assert 'image_id' in json_response
    assert 'original_image_url' in json_response


def test_upload_invalid_file(client: 'FlaskClient'):
    """Test uploading an invalid file type."""
    data = {
        'file': (io.BytesIO(b'invalid file content'), 'test.txt')
    }
    response = client.post(
        '/api/upload',
        content_type='multipart/form-data',
        data=data
    )

    assert response.status_code == 200
    json_response = response.get_json()

    assert json_response['success'] is False
    assert json_response['message'] == 'Invalid file type'
