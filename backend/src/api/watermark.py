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
    
    # Get additional watermark configuration
    watermark_config = {
        'fontSize': data.get('fontSize'),
        'color': data.get('color'),
        'rotation': data.get('rotation'),
        'opacity': data.get('opacity'),
        'position': data.get('customPosition')  # 使用 customPosition 來傳遞百分比位置
    }
    
    # Remove None values from config
    watermark_config = {k: v for k, v in watermark_config.items() if v is not None}

    # Validate input
    if not image_id:
        return jsonify({
            'success': False,
            'message': 'Image ID is required'
        }), 400

    print("Received watermark request:", {  # 調試信息
        'image_id': image_id,
        'watermark_text': watermark_text,
        'position': position,
        'config': watermark_config
    })

    # Add watermark
    result = add_watermark(image_id, watermark_text, position, watermark_config)
    
    return jsonify(result)