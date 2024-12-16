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
    
    # Create a copy of the image to ensure the original remains unaltered
    img = image.copy()
    if img.mode != 'RGBA':
        img = img.convert('RGBA')  # Convert image to RGBA mode for transparency support
    
    # Create a transparent layer for the watermark
    watermark_layer = Image.new('RGBA', img.size, (0, 0, 0, 0))  # Initialize a transparent image layer
    draw = ImageDraw.Draw(watermark_layer)

    # Get configuration settings or use defaults
    if config is None:
        config = {}
    
    font_size = config.get('fontSize', 36)  # Default font size is 36
    color = config.get('color', '#ffffff')  # Default color is white
    opacity = int(config.get('opacity', 0.8) * 255)  # Default opacity is 80%
    rotation = -config.get('rotation', 0)  # Rotation angle (default is no rotation)
    custom_position = config.get('customPosition', None) or config.get('position', None)  # Custom position override

    # Convert color from hex (e.g., #RRGGBB) to RGBA tuple
    if isinstance(color, str) and color.startswith('#'):
        color = color.lstrip('#')
        r = int(color[:2], 16)
        g = int(color[2:4], 16)
        b = int(color[4:], 16)
        color = (r, g, b, opacity)

    # Load font, defaulting to built-in font if loading fails
    try:
        font_path = os.path.join(os.path.dirname(__file__), 'fonts', 'Arial.ttf')
        font = ImageFont.truetype(font_path, font_size)
    except:
        font = ImageFont.load_default()
        logger.warning("Using default font. For best results, place Arial.ttf in the fonts directory.")

    # Get the bounding box dimensions of the text
    bbox = draw.textbbox((0, 0), watermark_text, font=font)  # Text bounding box
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    logger.debug(f"Text dimensions: {text_width}x{text_height}")

    # Determine the position of the watermark
    if custom_position and isinstance(custom_position, dict):
        # Extract percentage-based positions if specified
        x_percent = float(custom_position.get('x', 50))  # Default x position is 50%
        y_percent = float(custom_position.get('y', 50))  # Default y position is 50%
        
        # Convert percentages to pixel values
        x = (x_percent / 100.0) * img.width
        y = (y_percent / 100.0) * img.height

        logger.debug(f"Percentage position: {x_percent}%, {y_percent}%")
        logger.debug(f"Absolute position before adjustment: {x}, {y}")

        # Adjust to center the text at the calculated position
        x = x - (text_width / 2)
        y = y - (text_height / 2)

        logger.debug(f"Final position after centering: {x}, {y}")
    else:
        # Default positioning based on predefined options
        padding = font_size  # Padding around the text
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
            x, y = padding, padding  # Default fallback position

    # Ensure the calculated coordinates are within image boundaries
    x = max(0, min(x, img.width - text_width))
    y = max(0, min(y, img.height - text_height))

    logger.debug(f"Final adjusted position: {x}, {y}")

    # Handle rotation of the text, if specified
    if rotation:
        # Calculate the center point for rotation
        center_x = x + text_width / 2
        center_y = y + text_height / 2
        
        # Create a temporary image to accommodate rotation
        diagonal = math.sqrt(text_width**2 + text_height**2)  # Diagonal of the text rectangle
        padding = int(diagonal / 2)
        temp_size = (text_width + padding * 2, text_height + padding * 2)  # Ensure enough space for rotation
        temp_img = Image.new('RGBA', temp_size, (0, 0, 0, 0))  # Temporary transparent image
        temp_draw = ImageDraw.Draw(temp_img)
        
        # Draw the text at the center of the temporary image
        temp_x = (temp_size[0] - text_width) / 2
        temp_y = (temp_size[1] - text_height) / 2
        temp_draw.text((temp_x, temp_y), watermark_text, font=font, fill=color)
        
        # Rotate the temporary image
        rotated = temp_img.rotate(rotation, expand=True, center=(temp_size[0]/2, temp_size[1]/2))
        
        # Calculate the paste position to keep the rotated text centered
        paste_x = int(center_x - rotated.width / 2)
        paste_y = int(center_y - rotated.height / 2)
        
        # Paste the rotated text onto the watermark layer
        watermark_layer.paste(rotated, (paste_x, paste_y), rotated)
    else:
        # Draw the text directly without rotation
        draw.text((x, y), watermark_text, font=font, fill=color)

    # Combine the watermark layer with the original image
    result = Image.alpha_composite(img, watermark_layer)
    
    logger.debug("Watermark applied successfully")
    return result