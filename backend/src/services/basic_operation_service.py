import os
from PIL import Image

def basic_operation(image_id: str, operations: dict) -> dict:
    """
    Apply basic image operations (resize, rotate, crop, flip, grayscale).
    :param image_id: Unique identifier for the image
    :param operations: Dictionary of operations with their parameters
    :return: Operation result details
    """
    upload_folder = 'uploads'
    compressed_folder = 'compressed'
    image_path = None

    # Check compressed folder first
    for filename in os.listdir(compressed_folder):
        if filename.startswith(image_id):
            image_path = os.path.join(compressed_folder, filename)
            break

    if not image_path:
    # If compressed image not found, check the original image
        for filename in os.listdir(upload_folder):
            if filename.startswith(image_id):
                image_path = os.path.join(upload_folder, filename)
                break

    if not image_path:
        return {
            'success': False,
            'message': 'Image not found'
        }

    try:
        with Image.open(image_path) as img:
            for operation, params in operations.items():
                if operation == 'resize':
                    width = params.get('width')
                    height = params.get('height')
                    if width and height:
                         img = img.resize((int(width), int(height)))
                elif operation == 'rotate':
                    angle = params.get('angle')
                    if angle:
                        img = img.rotate(int(angle))
                elif operation == 'crop':
                    left = params.get('left')
                    top = params.get('top')
                    right = params.get('right')
                    bottom = params.get('bottom')
                    if all([left, top, right, bottom]):
                        img = img.crop((int(left), int(top), int(right), int(bottom)))
                elif operation == 'flip':
                    direction = params.get('direction')
                    if direction == 'horizontal':
                        img = img.transpose(Image.FLIP_LEFT_RIGHT)
                    elif direction == 'vertical':
                        img = img.transpose(Image.FLIP_TOP_BOTTOM)
                elif operation == 'grayscale':
                    img = img.convert('L')

            # Save the modified image
            modified_folder = 'modified'
            os.makedirs(modified_folder, exist_ok=True)
            modified_filename = f'{image_id}_modified.png'
            modified_path = os.path.join(modified_folder, modified_filename)
            img.save(modified_path)

            return {
                'success': True,
                'message': 'Image operations applied successfully',
                'modified_image_url': modified_path
            }

    except Exception as e:
        return {
            'success': False,
            'message': f'Image operations failed: {str(e)}'
        }
