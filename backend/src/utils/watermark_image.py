from PIL import Image, ImageDraw, ImageFont
import os
import math
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def watermark_image(image: Image.Image, watermark_text: str, position: str, config: dict = None) -> Image.Image:
    """
    Add watermark to an image
    """
    logger.debug(f"Starting watermark_image with config: {config}")
    
    # Create a copy of the image to work with
    img = image.copy()
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Create a transparent layer for watermark
    watermark_layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(watermark_layer)

    # Get configuration
    if config is None:
        config = {}
    
    # 從配置中獲取字體大小，如果沒有設置則使用默認值 36
    font_size = config.get('fontSize', 36)
    color = config.get('color', '#ffffff')
    opacity = int(config.get('opacity', 0.8) * 255)
    rotation = -config.get('rotation', 0)  
    custom_position = config.get('customPosition', None) or config.get('position', None)

    # Convert color from hex to RGBA
    if isinstance(color, str) and color.startswith('#'):
        color = color.lstrip('#')
        r = int(color[:2], 16)
        g = int(color[2:4], 16)
        b = int(color[4:], 16)
        color = (r, g, b, opacity)

    # Load font
    try:
        font_path = os.path.join(os.path.dirname(__file__), 'fonts', 'Arial.ttf')
        font = ImageFont.truetype(font_path, font_size)
    except:
        font = ImageFont.load_default()
        logger.warning("Using default font. For best results, place Arial.ttf in the fonts directory.")

    # Get text size
    bbox = draw.textbbox((0, 0), watermark_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    logger.debug(f"Text dimensions: {text_width}x{text_height}")

    # Calculate position
    if custom_position and isinstance(custom_position, dict):
        # Get percentage positions
        x_percent = float(custom_position.get('x', 50))
        y_percent = float(custom_position.get('y', 50))
        
        # Convert percentage to absolute pixels
        x = (x_percent / 100.0) * img.width
        y = (y_percent / 100.0) * img.height

        logger.debug(f"Percentage position: {x_percent}%, {y_percent}%")
        logger.debug(f"Absolute position before adjustment: {x}, {y}")

        # Center align the text
        x = x - (text_width / 2)
        y = y - (text_height / 2)

        logger.debug(f"Final position after centering: {x}, {y}")
    else:
        # Default positioning
        padding = font_size
        if position == 'top-left':
            x, y = padding, padding
        elif position == 'top-right':
            x, y = img.width - text_width - padding, padding
        elif position == 'bottom-left':
            x, y = padding, img.height - text_height - padding
        elif position == 'bottom-right':
            x, y = img.width - text_width - padding, img.height - text_height - padding
        elif position == 'center':
            x = (img.width - text_width) / 2
            y = (img.height - text_height) / 2
        else:
            x, y = padding, padding

    # Ensure coordinates are within image bounds
    x = max(0, min(x, img.width - text_width))
    y = max(0, min(y, img.height - text_height))

    logger.debug(f"Final adjusted position: {x}, {y}")

    # Handle rotation
    if rotation:
        # Calculate rotation center
        center_x = x + text_width / 2
        center_y = y + text_height / 2
        
        # Create temporary image for rotation
        diagonal = math.sqrt(text_width**2 + text_height**2)
        padding = int(diagonal / 2)
        temp_size = (text_width + padding * 2, text_height + padding * 2)
        temp_img = Image.new('RGBA', temp_size, (0, 0, 0, 0))
        temp_draw = ImageDraw.Draw(temp_img)
        
        # Draw text in center of temp image
        temp_x = (temp_size[0] - text_width) / 2
        temp_y = (temp_size[1] - text_height) / 2
        temp_draw.text((temp_x, temp_y), watermark_text, font=font, fill=color)
        
        # Rotate around center
        rotated = temp_img.rotate(rotation, expand=True, center=(temp_size[0]/2, temp_size[1]/2))
        
        # Calculate paste position to maintain center point
        paste_x = int(center_x - rotated.width / 2)
        paste_y = int(center_y - rotated.height / 2)
        
        # Paste rotated text
        watermark_layer.paste(rotated, (paste_x, paste_y), rotated)
    else:
        # Draw text directly without rotation
        draw.text((x, y), watermark_text, font=font, fill=color)

    # Merge watermark with original image
    result = Image.alpha_composite(img, watermark_layer)
    
    logger.debug("Watermark applied successfully")
    return result