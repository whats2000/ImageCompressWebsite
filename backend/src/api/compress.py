from flask import Blueprint, request, jsonify
from services.compress_service import compress_image

compress_bp = Blueprint('compress', __name__)

@compress_bp.route('/compress', methods=['POST'])
def compress():
    """
    Handle image compression
    :return: JSON response with compression details
    """
    data = request.get_json()
    image_id = data.get('image_id')
    compression_format = data.get('compression_format')
    compression_quality = data.get('compression_quality')

    # Validate input
    if not all([image_id, compression_format, compression_quality]):
        return jsonify({
            'success': False,
            'message': 'Missing required parameters'
        }), 400

    # Compress image
    result = compress_image(image_id, compression_format, compression_quality)
    
    return jsonify(result)
