from PIL import Image


def validate_compression_input(
    image: Image.Image, 
    quality: int, 
    default_mode: str = 'RGBA', 
    min_quality: int = 1,
    max_quality: int = 100
) -> Image.Image:
    """
    Validate and preprocess image for compression
    :param image: Input image
    :param quality: Compression quality (1-100)
    :param default_mode: Default mode to convert image to
    :param min_quality: Minimum quality value
    :param max_quality: Maximum quality value
    :return: PIL Image object if input is valid
    """
    # Check image input
    if image is None:
        raise ValueError("Input image cannot be None")
    
    if not isinstance(image, Image.Image):
        raise TypeError(f"Expected PIL Image, got {type(image)}")

    # Validate quality parameter
    if not isinstance(quality, int):
        raise TypeError(f"Quality must be an integer, got {type(quality)}")

    if quality < min_quality or quality > max_quality:
        raise ValueError(f"Quality must be between {min_quality} and {max_quality}, got {quality}")

    # Ensure the image is in the specified mode
    if image.mode not in ['RGBA', 'RGB', default_mode]:
        image = image.convert(default_mode)

    return image
