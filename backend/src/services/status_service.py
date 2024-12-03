import os

def get_image_status(image_id: str) -> dict:
    """
    Get processing status for a specific image
    :param image_id: Unique identifier for the image
    :return: Dictionary with image processing status
    """
    # Check the original image
    original_image_url = None
    for filename in os.listdir('uploads'):
        if filename.startswith(image_id):
            original_image_url = os.path.join('uploads', filename)
            break

    # Check compressed image
    compressed_image_url = None
    for filename in os.listdir('compressed'):
        if filename.startswith(image_id):
            compressed_image_url = os.path.join('compressed', filename)
            break

    # Check watermarked image
    watermarked_image_url = None
    for filename in os.listdir('watermarked'):
        if filename.startswith(image_id):
            watermarked_image_url = os.path.join('watermarked', filename)
            break

    # Determine status
    if watermarked_image_url:
        status = 'watermarked'
    elif compressed_image_url:
        status = 'compressed'
    elif original_image_url:
        status = 'uploaded'
    else:
        return {
            'success': False,
            'message': 'Image not found'
        }

    # Construct response
    return {
        'success': True,
        'image_id': image_id,
        'status': status,
        'original_image_url': original_image_url,
        'compressed_image_url': compressed_image_url,
        'watermarked_image_url': watermarked_image_url
    }
