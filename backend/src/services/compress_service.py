import os

from PIL import Image

from utils.jpeg_compression import jpeg_compression


def compress_image(image_id: str, compression_format: str, compression_quality: int) -> dict:
    """
    Compress an image with specified parameters
    :param image_id: Unique identifier for the image
    :param compression_format: Target compression format
    :param compression_quality: Compression quality level
    :return: Compression result details
    """
    # Locate the original image
    upload_folder = 'uploads'
    original_image_path = None
    for filename in os.listdir(upload_folder):
        if filename.startswith(image_id):
            original_image_path = os.path.join(upload_folder, filename)
            break

    if not original_image_path:
        return {
            'success': False,
            'message': 'Image not found'
        }

    # Output path for compressed image
    compressed_folder = 'compressed'
    os.makedirs(compressed_folder, exist_ok=True)
    compressed_filename = f'{image_id}_compressed.{compression_format}'
    compressed_path = os.path.join(compressed_folder, compressed_filename)

    try:
        # Open and compress image
        with Image.open(original_image_path) as img:
            if compression_format == 'jpeg':
                jpeg_compression(img, compression_quality).save(compressed_path)
            else:
                img.save(compressed_path, format=compression_format, quality=compression_quality)

        return {
            'success': True,
            'message': 'Image compressed successfully',
            'compressed_image_url': compressed_path
        }
    except Exception as e:
        return {
            'success': False,
            'message': f'Compression failed: {str(e)}'
        }
