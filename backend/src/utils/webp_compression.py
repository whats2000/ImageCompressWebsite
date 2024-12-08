import numpy as np
from PIL import Image
from scipy import fftpack
from tqdm import tqdm
from utils.image_validation import validate_compression_input


class WebPCompressor:
    # Block sizes for different prediction types
    LUMA_16x16 = 16
    CHROMA_8x8 = 8

    # Prediction modes
    H_PRED = 0  # Horizontal prediction
    V_PRED = 1  # Vertical prediction
    DC_PRED = 2  # DC prediction
    TM_PRED = 3  # TrueMotion prediction

    # Pre-computed conversion matrices for RGB to YUV
    RGB_TO_YUV = np.array([
        [0.299, 0.587, 0.114],
        [-0.14713, -0.28886, 0.436],
        [0.615, -0.51499, -0.10001]
    ], dtype=np.float32)

    # Pre-computed conversion matrices for YUV to RGB
    YUV_TO_RGB = np.array([
        [1.0, 0.0, 1.13983],
        [1.0, -0.39465, -0.58060],
        [1.0, 2.03211, 0.0]
    ], dtype=np.float32)

    # Base quantization matrix (similar to JPEG but adapted for WebP)
    BASE_QUANTIZATION_MATRIX = np.array([
        [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55],
        [14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62],
        [18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92],
        [49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99],
        [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55],
        [14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62],
        [18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92],
        [49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99],
        [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55],
        [14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62],
        [18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92],
        [49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99],
        [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55],
        [14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62],
        [18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92],
        [49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99]
    ], dtype=np.float32)

    @staticmethod
    def rgb_to_yuv(image: Image.Image) -> np.ndarray:
        """
        Optimized RGB to YUV conversion using matrix multiplication
        :param image: Input image
        :return: YUV image
        """
        img_array = np.array(image, dtype=np.float32) / 255.0
        pixels = img_array.reshape(-1, 3)
        yuv_pixels = np.dot(pixels, WebPCompressor.RGB_TO_YUV.T)
        yuv_img = yuv_pixels.reshape(img_array.shape)
        yuv_img[:, :, 1:] += 0.5
        return np.clip(yuv_img * 255.0, 0, 255).astype(np.float32)

    @staticmethod
    def yuv_to_rgb(yuv_img: np.ndarray) -> np.ndarray:
        """
        Optimized YUV to RGB conversion using matrix multiplication
        :param yuv_img: YUV image
        :return: RGB image
        """
        yuv = yuv_img.astype(np.float32) / 255.0
        yuv[:, :, 1:] -= 0.5
        pixels = yuv.reshape(-1, 3)
        rgb_pixels = np.dot(pixels, WebPCompressor.YUV_TO_RGB.T)
        rgb_img = rgb_pixels.reshape(yuv_img.shape)
        return np.clip(rgb_img * 255.0, 0, 255).astype(np.uint8)

    @staticmethod
    def get_quantization_matrix(quality: int, block_size: int) -> np.ndarray:
        """
        Get quantization matrix adjusted for quality
        :param quality: Compression quality (1-100)
        :param block_size: Size of the block
        :return: Quantization matrix
        """
        # Ensure quality is in valid range
        quality = np.clip(quality, 1, 100)
        
        # Get the base quantization matrix for the block size
        if block_size == WebPCompressor.LUMA_16x16:
            base_matrix = WebPCompressor.BASE_QUANTIZATION_MATRIX
        else:  # For chroma blocks
            base_matrix = WebPCompressor.BASE_QUANTIZATION_MATRIX[:8, :8]
        
        # Scale factor based on quality
        if quality < 50:
            scale = 5000 / quality
        else:
            scale = 200 - 2 * quality
            
        # Apply quality scaling
        factor = scale / 100.0
        q_matrix = base_matrix * factor
        
        # Ensure minimum quantization values
        q_matrix = np.maximum(q_matrix, 1)
        
        # Special handling for high quality
        if quality >= 90:
            # Reduce quantization values for high quality
            q_matrix = q_matrix * (100 - quality) / 50.0
            q_matrix = np.maximum(q_matrix, 1)
        
        return q_matrix

    @staticmethod
    def predict_block(block: np.ndarray, left_col: np.ndarray, top_row: np.ndarray) -> tuple:
        """
        Predict block using all available modes
        :param block: Input block
        :param left_col: Left column pixels
        :param top_row: Top row pixels
        :return: tuple of (best prediction, best mode)
        """
        height, width = block.shape
        predictions = np.zeros((4, height, width), dtype=np.float32)

        # H_PRED
        predictions[0] = left_col[:, np.newaxis].repeat(width, axis=1)
        
        # V_PRED
        predictions[1] = top_row[np.newaxis, :].repeat(height, axis=0)
        
        # DC_PRED
        dc_val = np.mean(np.concatenate([left_col, top_row]))
        predictions[2].fill(dc_val)
        
        # TM_PRED
        gradient = top_row - top_row[0]
        predictions[3] = left_col[:, np.newaxis] + gradient[np.newaxis, :]
        predictions[3] = np.clip(predictions[3], 0, 255)

        # Calculate errors
        errors = np.sum(np.abs(predictions - block[np.newaxis, :, :]), axis=(1, 2))
        best_mode = np.argmin(errors)
        
        return predictions[best_mode], best_mode

    @staticmethod
    def process_block(block: np.ndarray, q_matrix: np.ndarray) -> np.ndarray:
        """
        Process a single block (DCT, quantize, inverse)
        :param block: Input block
        :param q_matrix: Quantization matrix
        :return: Processed block
        """
        # Apply DCT
        dct_block = fftpack.dctn(block - 128.0, type=2, norm='ortho')
        
        # Quantize
        quantized = np.round(dct_block / q_matrix)
        
        # Dequantize
        dequantized = quantized * q_matrix
        
        # Inverse DCT
        idct_block = fftpack.idctn(dequantized, type=2, norm='ortho')
        
        return np.clip(idct_block + 128.0, 0, 255)

    @staticmethod
    def compress_channel(channel: np.ndarray, quality: int, block_size: int = 16) -> np.ndarray:
        """
        Compress a single channel
        :param channel: Input channel
        :param quality: Compression quality
        :param block_size: Size of processing blocks
        :return: Compressed channel
        """
        height, width = channel.shape
        padded_h = ((height + block_size - 1) // block_size) * block_size
        padded_w = ((width + block_size - 1) // block_size) * block_size
        
        # Pad the channel
        padded = np.pad(channel, 
                       ((0, padded_h - height), (0, padded_w - width)),
                       mode='edge')

        # Get quantization matrix
        q_matrix = WebPCompressor.get_quantization_matrix(quality, block_size)
        
        # Process blocks
        result = np.zeros_like(padded)
        
        for i in range(0, padded_h, block_size):
            for j in range(0, padded_w, block_size):
                block = padded[i:i+block_size, j:j+block_size]
                
                # Get prediction context
                top_row = padded[i-1, j:j+block_size] if i > 0 else np.zeros(block_size)
                left_col = padded[i:i+block_size, j-1] if j > 0 else np.zeros(block_size)
                
                # Get best prediction
                predicted, _ = WebPCompressor.predict_block(block, left_col, top_row)
                
                # Calculate and process residual
                residual = block - predicted
                processed_residual = WebPCompressor.process_block(residual, q_matrix)
                
                # Reconstruct block
                result[i:i+block_size, j:j+block_size] = np.clip(
                    predicted + processed_residual, 0, 255
                )
        
        # Remove padding
        return result[:height, :width]

    @staticmethod
    def get_compress_image(image: Image.Image, quality: int = 85) -> Image.Image:
        """
        Compress an image using WebP-like compression
        :param image: Input image
        :param quality: Compression quality (1-100), defaults to 85
        :return: Compressed image
        """
        # Validate input
        validate_compression_input(image, quality)

        # Convert to YUV color space
        yuv_img = WebPCompressor.rgb_to_yuv(image)

        # Process channels
        channels = []
        for i, channel in enumerate(tqdm(np.dsplit(yuv_img, 3), desc="Compressing", total=3)):
            # Use different block sizes for luma (Y) and chroma (U,V)
            block_size = WebPCompressor.LUMA_16x16 if i == 0 else WebPCompressor.CHROMA_8x8
            compressed = WebPCompressor.compress_channel(
                channel.squeeze(), 
                quality,
                block_size
            )
            channels.append(compressed)

        # Reconstruct and convert back to RGB
        reconstructed = np.stack(channels, axis=-1)
        rgb_img = WebPCompressor.yuv_to_rgb(reconstructed)
        
        return Image.fromarray(rgb_img)


def webp_compression(image: Image.Image, quality: int = 85) -> Image.Image:
    """
    Wrapper for WebP compression
    :param image: Input image
    :param quality: Compression quality (1-100), defaults to 85
    :return: Compressed image
    """
    return WebPCompressor.get_compress_image(image, quality)


if __name__ == '__main__':
    # Test the WebP compression
    test_image = Image.open('tests/test.png')
    
    # Test different quality levels
    qualities = [25, 50, 75, 100]
    for q in qualities:
        compressed = webp_compression(test_image, quality=q)
        compressed.save(f'tests/compressed_q{q}.webp')
        print(f"Compression completed for quality {q}")