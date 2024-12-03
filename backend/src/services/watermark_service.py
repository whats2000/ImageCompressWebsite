import os
from PIL import Image, ImageDraw, ImageFont

def add_watermark(image_id: str, watermark_text: str, position: str) -> dict:
    """
    Add watermark to an image
    :param image_id: Unique identifier for the image
    :param watermark_text: Text to use as watermark
    :param position: Position of the watermark applied to the image
    :return: Watermark result details
    """
    # Locate the image to watermark (prefer compressed, fallback to original)
    compressed_folder = 'compressed'
    upload_folder = 'uploads'
    image_path = None

    # Try finding compressed image first
    for filename in os.listdir(compressed_folder):
        if filename.startswith(image_id):
            image_path = os.path.join(compressed_folder, filename)
            break

    # If no compressed image, use original
    if not image_path:
        for filename in os.listdir(upload_folder):
            if filename.startswith(image_id):
                image_path = os.path.join(upload_folder, filename)
                break

    if not image_path:
        return {
            'success': False,
            'message': 'Image not found'
        }

    # Watermark folder
    watermarked_folder = 'watermarked'
    os.makedirs(watermarked_folder, exist_ok=True)
    
    # Output path
    watermarked_filename = f'{image_id}_watermarked{os.path.splitext(image_path)[1]}'
    watermarked_path = os.path.join(watermarked_folder, watermarked_filename)

    try:
        # Open image
        with Image.open(image_path) as img:
            # TODO: Add watermark to image
            
            # Save watermarked image
            img.save(watermarked_path)

        return {
            'success': True,
            'message': 'Watermark added successfully',
            'watermarked_image_url': watermarked_path
        }
    except Exception as e:
        return {
            'success': False,
            'message': f'Watermark failed: {str(e)}'
        }
