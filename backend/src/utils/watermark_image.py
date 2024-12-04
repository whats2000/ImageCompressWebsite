from PIL import Image


def watermark_image(image: Image.Image, watermark_text: str, position: str) -> Image.Image:
    """
    Add watermark to an image
    :param image: PIL Image object
    :param watermark_text: Text to use as watermark
    :param position: Position of the watermark applied to the image
                     Which position in ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']
    """
    return image
