from flask import Blueprint, jsonify, request
from services.download_service import get_image_base64

image_bp = Blueprint('image', __name__)

@image_bp.route('/image/<image_id>', methods=['GET'])
def get_base64_image(image_id):
    """
    Retrieve image as a base64 string
    :param image_id: Unique identifier for the image
    :return: JSON with base64 encoded image or error message
    """
    image_type = request.args.get('type', 'original')
    result = get_image_base64(image_id, image_type)
    
    if not result['success']:
        return jsonify(result), 404

    return jsonify({
        'success': True,
        'image_base64': result['image_base64']
    })
