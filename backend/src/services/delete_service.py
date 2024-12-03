import os


def delete_image(image_id: str) -> dict:
    """
    Delete all image files associated with the given image ID
    :param image_id: Unique identifier for the image
    :return: Dictionary with deletion status
    """
    # Directories to search for image files
    directories = ['uploads', 'compressed', 'watermarked']
    
    # Track if any files were deleted
    files_deleted = False

    # Attempt to delete files in each directory
    for directory in directories:
        # Ensure directory exists
        if not os.path.exists(directory):
            continue

        # Find and delete matching files
        for filename in os.listdir(directory):
            if filename.startswith(image_id):
                filepath = os.path.join(directory, filename)
                try:
                    os.remove(filepath)
                    files_deleted = True
                except Exception as e:
                    return {
                        'success': False,
                        'message': f'Failed to delete file {filename}: {str(e)}'
                    }

    # Return result
    if files_deleted:
        return {
            'success': True,
            'message': 'Image deleted successfully'
        }
    else:
        return {
            'success': False,
            'message': 'No image files found to delete'
        }
