from flask import Blueprint, send_file, request, jsonify
from services.download_service import get_downloadable_image

download_bp = Blueprint('download', __name__)


@download_bp.route('/download/<image_id>', methods=['GET'])
def download(image_id):
    """
    Provide download link for a specific image
    :param image_id: Unique identifier for the image
    :return: Image file or error message
    """
    image_type = request.args.get('type', 'original')

    result = get_downloadable_image(image_id, image_type)

    if not result['success']:
        return jsonify(result), 404

    return send_file(
        result['filepath'],
        as_attachment=True
    )
