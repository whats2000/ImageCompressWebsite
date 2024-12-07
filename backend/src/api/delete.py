from flask import Blueprint, jsonify

from services.delete_service import delete_image

delete_bp = Blueprint('delete', __name__)

@delete_bp.route('/delete/<image_id>', methods=['DELETE'])
def delete(image_id):
    """
    Delete a specific image and its related processing results
    :param image_id: Unique identifier for the image
    :return: JSON response with deletion status
    """
    result = delete_image(image_id)
    return jsonify(result)
