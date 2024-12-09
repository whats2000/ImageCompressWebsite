import os

def get_downloadable_image(image_id: str, image_type: str='original') -> dict:
    """
    Get the downloadable image path based on type
    :param image_id: Unique identifier for the image
    :param image_type: Type of image to download (original, watermarked, compressed)
    :return: Dictionary with download details
    """
    # Determine search directories and filename patterns
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    search_dirs = {
        'original': os.path.join(base_dir, 'uploads'),
        'webp': os.path.join(base_dir, 'compressed'),
        'jpeg': os.path.join(base_dir, 'compressed'),
        'watermarked': os.path.join(base_dir, 'watermarked')
    }

    # Validate image type
    if image_type not in search_dirs:
        return {
            'success': False,
            'message': 'Invalid image type'
        }

    # Search for the image
    directory = search_dirs[image_type]
    
    try:
        for filename in os.listdir(directory):
            if image_type == 'original' or image_type == 'watermarked':
                if filename.startswith(image_id):
                    filepath = os.path.join(directory, filename)
                    return {
                        'success': True,
                        'filepath': filepath,
                        'filename': filename
                    }
            else:
                if filename.startswith(image_id) and filename.endswith(image_type):
                    filepath = os.path.join(directory, filename)
                    return {
                        'success': True,
                        'filepath': filepath,
                        'filename': filename
                    }
    except FileNotFoundError:
        return {
            'success': False,
            'message': f'Directory {directory} not found'
        }

    # Image not found
    return {
        'success': False,
        'message': f'{image_type.capitalize()} image not found'
    }
