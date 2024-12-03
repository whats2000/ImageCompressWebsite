from flask import Blueprint, request, jsonify
from services.watermark_service import add_watermark

watermark_bp = Blueprint('watermark', __name__)

@watermark_bp.route('/watermark', methods=['POST'])
def watermark():
    """
    Add watermark to an image
    :return: JSON response with watermark details
    """
    data = request.get_json()
    image_id = data.get('image_id')
    watermark_text = data.get('watermark_text', 'Watermarked')
    position = data.get('position', 'bottom-right')

    # Validate input
    if not image_id:
        return jsonify({
            'success': False,
            'message': 'Image ID is required'
        }), 400

    # Add watermark
    result = add_watermark(image_id, watermark_text, position)
    
    return jsonify(result)
