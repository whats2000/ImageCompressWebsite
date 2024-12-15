import os
import json
from datetime import datetime
from PIL import Image

from utils.image_cleanup import load_image_timestamps, save_image_timestamps
from utils.watermark_image import watermark_image

def add_watermark(image_id: str, watermark_text: str, position: str, config: dict = None) -> dict:
    """
    Add watermark to an image
    :param image_id: Unique identifier for the image
    :param watermark_text: Text to use as watermark
    :param position: Position of the watermark applied to the image
    :param config: Additional configuration for watermark
    :return: Watermark result details
    """
    # Locate the image
    compressed_folder = 'compressed'
    upload_folder = 'uploads'
    image_path = None

    # Check the compressed image first
    for filename in os.listdir(compressed_folder):
        if filename.startswith(image_id):
            image_path = os.path.join(compressed_folder, filename)
            break

    # If compressed image not found, check the original image
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

    # Create the watermarked folder if it doesn't exist
    watermarked_folder = 'watermarked'
    os.makedirs(watermarked_folder, exist_ok=True)
    
    # Output path for watermarked image
    watermarked_filename = f'{image_id}_watermarked.png'
    watermarked_path = os.path.join(watermarked_folder, watermarked_filename)

    try:
        # Read the image and add the watermark
        with Image.open(image_path) as img:
            # Add watermark with optional configuration
            if config and 'position' in config and isinstance(config['position'], dict):
                x = config['position'].get('x', 50)
                y = config['position'].get('y', 50)
                
                # Ensure the position is within bounds
                x = max(0, min(100, x))
                y = max(0, min(100, y))
                
                config['position'] = {'x': x, 'y': y}

            # Add watermark to the image
            watermarked = watermark_image(img, watermark_text, position, config)
            
            # Save the watermarked image
            watermarked.save(watermarked_path, 'PNG')
            
        # Record watermark timestamp
        timestamps = load_image_timestamps()
        timestamps[watermarked_path] = str(datetime.now())
        save_image_timestamps(timestamps)

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