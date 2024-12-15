from flask import Blueprint, request, jsonify
from services.basic_operation_service import basic_operation

basic_operation_bp = Blueprint('basic_operation', __name__)

@basic_operation_bp.route('/basic_operation', methods=['POST'])
def apply_basic_operation():
    """
    Apply basic image operations (resize, rotate, crop, flip, grayscale).
    :return: JSON with an operation result or error message
    """
    data = request.get_json()
    image_id = data.get('image_id')
    operations = data.get('operations')

    if not all([image_id, operations]):
        return jsonify({'success': False, 'message': 'Missing required parameters'}), 400

    result = basic_operation(image_id, operations)
    if not result['success']:
        return jsonify(result), 400

    return jsonify(result)
