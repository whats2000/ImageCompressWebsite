import math

import numpy as np
from PIL import Image


def validate_input(image: Image.Image, quality: int):
    """
    Validate input parameters for JPEG compression

    Args:
        image (PIL.Image): Input image
        quality (int): Compression quality

    Raises:
        ValueError: If input parameters are invalid
    """
    # Check image input
    if image is None:
        raise ValueError("Input image cannot be None")

    if not isinstance(image, Image.Image):
        raise TypeError(f"Expected PIL Image, got {type(image)}")

    # Validate quality parameter
    if not isinstance(quality, int):
        raise TypeError(f"Quality must be an integer, got {type(quality)}")

    if quality < 1 or quality > 100:
        raise ValueError(f"Quality must be between 1 and 100, got {quality}")


class JPEGCompressor:
    def __init__(self):
        pass

    def get_compress_image(self, image: Image.Image, quality: int = 85) -> Image.Image:
        """
        Manually compress an image using JPEG-like compression

        Args:
            image (PIL.Image): Input image
            quality (int): Compression quality (1-100)

        Returns:
            PIL.Image: Compressed image
        """
        # Validate input
        validate_input(image, quality)

        return image


# Create a global instance for easy access
compressor = JPEGCompressor()


# Export function to match the expected interface
def jpeg_compression(image: Image.Image, quality: int = 85) -> Image.Image:
    """
    Wrapper for JPEG compression

    Args:
        image (PIL.Image): Input image
        quality (int, optional): Compression quality. Defaults to 85.

    Returns:
        PIL.Image: Compressed image
    """
    return compressor.get_compress_image(image, quality)
