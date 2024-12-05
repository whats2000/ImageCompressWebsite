from flask import Blueprint, jsonify
from services.status_service import get_image_status

status_bp = Blueprint('status', __name__)

@status_bp.route('/status/<image_id>', methods=['GET'])
def status(image_id):
    """
    Check the processing status of an image
    :param image_id: Unique identifier for the image
    :return: JSON response with image processing status
    """
    result = get_image_status(image_id)
    return jsonify(result)
