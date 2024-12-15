import os
from PIL import Image
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
    # 定位圖片（優先使用壓縮版本，否則使用原圖）
    compressed_folder = 'compressed'
    upload_folder = 'uploads'
    image_path = None

    # 先查找壓縮圖片
    for filename in os.listdir(compressed_folder):
        if filename.startswith(image_id):
            image_path = os.path.join(compressed_folder, filename)
            break

    # 如果沒有壓縮圖片，使用原圖
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

    # 創建水印文件夾
    watermarked_folder = 'watermarked'
    os.makedirs(watermarked_folder, exist_ok=True)
    
    # 輸出路徑
    watermarked_filename = f'{image_id}_watermarked.png'
    watermarked_path = os.path.join(watermarked_folder, watermarked_filename)

    try:
        # 讀取圖片
        with Image.open(image_path) as img:
            # 調整水印位置的精確度
            if config and 'position' in config and isinstance(config['position'], dict):
                x = config['position'].get('x', 50)
                y = config['position'].get('y', 50)
                
                # 確保位置值在0-100之間
                x = max(0, min(100, x))
                y = max(0, min(100, y))
                
                config['position'] = {'x': x, 'y': y}

            # 添加水印
            watermarked = watermark_image(img, watermark_text, position, config)
            
            # 保存為PNG以保持質量
            watermarked.save(watermarked_path, 'PNG')

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