from flask import Blueprint, request, jsonify

from services.upload_service import upload_image

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload', methods=['POST'])
def upload():
    """
    Handle image upload
    :return: JSON response with upload details
    """
    # Check if the file is present
    if 'file' not in request.files:
        return jsonify({
            'success': False,
            'message': 'No file uploaded'
        }), 400
    
    # Use upload service to process the image
    result = upload_image(request.files['file'])
    
    return jsonify(result)

