import numpy as np
from PIL import Image
from scipy import fftpack
from tqdm import tqdm

from utils.image_validation import validate_compression_input


class WebPCompressor:
    # Block sizes for different prediction types
    LUMA_4x4 = 4
    LUMA_16x16 = 16
    CHROMA_8x8 = 8

    # Prediction modes
    H_PRED = 0  # Horizontal prediction
    V_PRED = 1  # Vertical prediction
    DC_PRED = 2  # DC prediction
    TM_PRED = 3  # TrueMotion prediction

    @staticmethod
    def rgb_to_yuv(image: Image.Image) -> np.ndarray:
        """
        Convert RGB image to YUV color space (WebP uses YUV instead of YCbCr)
        :param image: Input image
        :return: YUV image
        """
        img_array = np.array(image, dtype=np.float32) / 255.0

        # RGB to YUV conversion matrix (BT.601)
        y = 0.299 * img_array[:, :, 0] + 0.587 * img_array[:, :, 1] + 0.114 * img_array[:, :, 2]
        u = -0.14713 * img_array[:, :, 0] - 0.28886 * img_array[:, :, 1] + 0.436 * img_array[:, :, 2]
        v = 0.615 * img_array[:, :, 0] - 0.51499 * img_array[:, :, 1] - 0.10001 * img_array[:, :, 2]

        yuv_img = np.stack([y, u, v], axis=-1) * 255.0
        return np.clip(yuv_img, 0, 255).astype(np.float32)

    @staticmethod
    def yuv_to_rgb(yuv_img: np.ndarray) -> np.ndarray:
        """
        Convert YUV image back to RGB
        :param yuv_img: YUV image
        :return: RGB image
        """
        yuv = yuv_img / 255.0

        # YUV to RGB conversion matrix (BT.601)
        r = yuv[:, :, 0] + 1.13983 * yuv[:, :, 2]
        g = yuv[:, :, 0] - 0.39465 * yuv[:, :, 1] - 0.58060 * yuv[:, :, 2]
        b = yuv[:, :, 0] + 2.03211 * yuv[:, :, 1]

        rgb_img = np.stack([r, g, b], axis=-1)
        return np.clip(rgb_img * 255.0, 0, 255).astype(np.uint8)

    @staticmethod
    def predict_block(block: np.ndarray, left_col: np.ndarray, top_row: np.ndarray, mode: int) -> np.ndarray:
        """
        Predict block content using different prediction modes
        :param block: Input block
        :param left_col: Left column pixels
        :param top_row: Top row pixels
        :param mode: Prediction mode
        :return: Predicted block
        """
        height, width = block.shape
        predicted = np.zeros_like(block)

        if mode == WebPCompressor.H_PRED:
            # Horizontal prediction
            for i in range(height):
                predicted[i, :] = left_col[i]
        elif mode == WebPCompressor.V_PRED:
            # Vertical prediction
            for j in range(width):
                predicted[:, j] = top_row[j]
        elif mode == WebPCompressor.DC_PRED:
            # DC prediction (average of top and left)
            dc_val = np.mean(np.concatenate([left_col, top_row]))
            predicted.fill(dc_val)
        elif mode == WebPCompressor.TM_PRED:
            # TrueMotion prediction
            top_left = top_row[0]
            for i in range(height):
                for j in range(width):
                    pred = left_col[i] + top_row[j] - top_left
                    predicted[i, j] = np.clip(pred, 0, 255)

        return predicted

    @staticmethod
    def transform_block(block: np.ndarray) -> np.ndarray:
        """
        Apply DCT transform to a block
        :param block: Input block
        :return: Transformed block
        """
        return fftpack.dctn(block, type=2, norm='ortho')

    @staticmethod
    def inverse_transform_block(block: np.ndarray) -> np.ndarray:
        """
        Apply inverse DCT transform to a block
        :param block: Input transformed block
        :return: Reconstructed block
        """
        return fftpack.idctn(block, type=2, norm='ortho')

    @staticmethod
    def quantize_block(block: np.ndarray, quality: int) -> np.ndarray:
        """
        Quantize transformed block based on quality
        :param block: Transformed block
        :param quality: Compression quality
        :return: Quantized block
        """
        # Simplified quantization matrix based on quality
        base_q = np.clip(quality, 1, 100)
        q_factor = (100 - base_q) / 50.0 if base_q >= 50 else 50.0 / base_q

        # Generate quantization matrix
        quant_matrix = np.ones_like(block) * q_factor
        quant_matrix[0, 0] *= 0.6  # Preserve more DC coefficient
        
        return np.ndarray.round(block / quant_matrix)

    @staticmethod
    def dequantize_block(block: np.ndarray, quality: int) -> np.ndarray:
        """
        Dequantize block
        :param block: Quantized block
        :param quality: Compression quality
        :return: Dequantized block
        """
        base_q = np.clip(quality, 1, 100)
        q_factor = (100 - base_q) / 50.0 if base_q >= 50 else 50.0 / base_q

        quant_matrix = np.ones_like(block) * q_factor
        quant_matrix[0, 0] *= 0.6

        return block * quant_matrix

    @staticmethod
    def compress_channel(channel: np.ndarray, quality: int, block_size: int = 16) -> np.ndarray:
        """
        Compress a single channel
        :param channel: Input channel
        :param quality: Compression quality
        :param block_size: Size of processing blocks
        :return: Compressed and reconstructed channel
        """
        height, width = channel.shape
        padded_h = ((height + block_size - 1) // block_size) * block_size
        padded_w = ((width + block_size - 1) // block_size) * block_size
        
        # Pad the channel
        padded = np.pad(channel, 
                       ((0, padded_h - height), (0, padded_w - width)),
                       mode='constant')
        
        # Process blocks
        result = np.zeros_like(padded)
        
        for i in range(0, padded_h, block_size):
            for j in range(0, padded_w, block_size):
                block = padded[i:i+block_size, j:j+block_size]
                
                # Get prediction context
                top_row = padded[i-1:i, j:j+block_size].flatten() if i > 0 else np.zeros(block_size)
                left_col = padded[i:i+block_size, j-1:j].flatten() if j > 0 else np.zeros(block_size)
                
                # Try different prediction modes and choose the best one
                best_residual = None
                best_mode = None
                min_error = float('inf')
                
                for mode in [WebPCompressor.H_PRED, WebPCompressor.V_PRED, 
                           WebPCompressor.DC_PRED, WebPCompressor.TM_PRED]:
                    predicted = WebPCompressor.predict_block(block, left_col, top_row, mode)
                    residual = block - predicted
                    error = np.sum(np.abs(residual))
                    
                    if error < min_error:
                        min_error = error
                        best_residual = residual
                        best_mode = mode
                
                # Transform and quantize the residual
                transformed = WebPCompressor.transform_block(best_residual)
                quantized = WebPCompressor.quantize_block(transformed, quality)
                
                # Reconstruct the block
                reconstructed_residual = WebPCompressor.inverse_transform_block(
                    WebPCompressor.dequantize_block(quantized, quality)
                )
                
                # Add prediction
                predicted = WebPCompressor.predict_block(block, left_col, top_row, best_mode)
                result[i:i+block_size, j:j+block_size] = predicted + reconstructed_residual
        
        # Remove padding and clip values
        result = result[:height, :width]
        return np.clip(result, 0, 255)

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

        # Process each channel
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

        # Stack channels and convert back to RGB
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

# For debugging purposes
if __name__ == '__main__':
    # Test the WebP compression
    test_image = Image.open('test.png')
    compressed_image = webp_compression(test_image, quality=25)
    compressed_image.show()
    compressed_image.save('compressed_image.webp')
    print("Compression successful")
