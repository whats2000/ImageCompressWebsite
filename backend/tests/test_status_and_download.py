from flask.testing import FlaskClient


def test_check_status(client: 'FlaskClient', temp_image: str):
    """
    Test status checking endpoint.
    """
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
    image_id = upload_json['image_id']

    # Check status
    response = client.get(f'/api/status/{image_id}')

    assert response.status_code == 200
    json_response = response.get_json()

    assert json_response['success'] is True
    assert json_response['image_id'] == image_id
    assert 'status' in json_response
    assert 'original_image_url' in json_response


def test_download_nonexistent_image(client: 'FlaskClient'):
    """Test downloading a nonexistent image."""
    response = client.get('/api/download/non_existent_id?type=original')

    assert response.status_code == 404
    json_response = response.get_json()

    assert not json_response.get('success', True)
    assert 'not found' in json_response.get('message', '').lower()
