import uuid
import os

from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename: str) -> bool:
    """
    Check if the file has an allowed extension
    :param filename: Name of the file to check
    :return: Boolean indicating if file is allowed
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_image(file: 'FileStorage') -> dict:
    """
    Upload an image and generate a unique ID
    :param file: File object from request
    :return: Dictionary with an upload result
    """
    # Ensure upload directory exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Check if a file is valid
    if not file or not allowed_file(file.filename):
        return {
            'success': False,
            'message': 'Invalid file type'
        }

    # Generate unique filename
    filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    # Save file
    file.save(filepath)

    # Return success response
    return {
        'success': True,
        'message': 'Image uploaded successfully',
        'image_id': filename.split('_')[0],
        'original_image_url': filepath
    }
