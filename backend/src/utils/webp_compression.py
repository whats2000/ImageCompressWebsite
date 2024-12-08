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

    @staticmethod
    def rgb_to_yuv(image: Image.Image) -> np.ndarray:
        """
        Optimized RGB to YUV conversion using matrix multiplication
        :param image: Input image
        :return: YUV image
        """
        # Convert image to float32 array and normalize
        img_array = np.array(image, dtype=np.float32) / 255.0
        
        # Reshape for matrix multiplication
        pixels = img_array.reshape(-1, 3)
        
        # Convert using matrix multiplication
        yuv_pixels = np.dot(pixels, WebPCompressor.RGB_TO_YUV.T)
        
        # Reshape back and adjust UV components
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
        # Normalize and adjust UV components
        yuv = yuv_img.astype(np.float32) / 255.0
        yuv[:, :, 1:] -= 0.5
        
        # Reshape for matrix multiplication
        pixels = yuv.reshape(-1, 3)
        
        # Convert using matrix multiplication
        rgb_pixels = np.dot(pixels, WebPCompressor.YUV_TO_RGB.T)
        
        # Reshape back and clip values
        rgb_img = rgb_pixels.reshape(yuv_img.shape)
        return np.clip(rgb_img * 255.0, 0, 255).astype(np.uint8)

    @staticmethod
    def predict_blocks_vectorized(blocks: np.ndarray, left_cols: np.ndarray, top_rows: np.ndarray) -> tuple:
        """
        Vectorized prediction for multiple blocks simultaneously
        :param blocks: Input blocks [N, height, width]
        :param left_cols: Left columns [N, height]
        :param top_rows: Top rows [N, width]
        :return: tuple of (best predictions, best modes)
        """
        n_blocks = len(blocks)
        block_h, block_w = blocks[0].shape
        predictions = np.zeros((4, n_blocks, block_h, block_w), dtype=np.float32)
        
        # H_PRED: broadcast left columns
        predictions[0] = left_cols[:, :, np.newaxis]
        
        # V_PRED: broadcast top rows
        predictions[1] = top_rows[:, np.newaxis, :]
        
        # DC_PRED: mean of left and top
        dc_vals = np.mean(np.concatenate([left_cols, top_rows], axis=1), axis=1)
        predictions[2] = dc_vals[:, np.newaxis, np.newaxis]
        
        # TM_PRED: vectorized true motion prediction
        top_left = top_rows[:, 0][:, np.newaxis, np.newaxis]
        left_cols_expanded = left_cols[:, :, np.newaxis]
        top_rows_expanded = top_rows[:, np.newaxis, :]
        predictions[3] = np.clip(
            left_cols_expanded + top_rows_expanded - top_left,
            0, 255
        )
        
        # Calculate errors for all predictions
        errors = np.sum(
            np.abs(predictions - blocks[np.newaxis, :, :, :]),
            axis=(2, 3)
        )
        
        # Get best predictions and modes
        best_modes = np.argmin(errors, axis=0)
        best_predictions = np.take_along_axis(
            predictions,
            best_modes[np.newaxis, :, np.newaxis, np.newaxis],
            axis=0
        ).squeeze(0)
        
        return best_predictions, best_modes

    @staticmethod
    def process_blocks_vectorized(blocks: np.ndarray, quality: int) -> np.ndarray:
        """
        Vectorized processing of multiple blocks
        :param blocks: Input blocks [N, height, width]
        :param quality: Compression quality
        :return: Processed blocks
        """
        # Apply DCT to all blocks at once
        transformed = fftpack.dctn(blocks, type=2, norm='ortho', axes=(1, 2))
        
        # Calculate quantization factor
        base_q = np.clip(quality, 1, 100)
        q_factor = (100 - base_q) / 50.0 if base_q >= 50 else 50.0 / base_q
        
        # Create quantization matrix
        quant_matrix = np.ones_like(blocks[0]) * q_factor
        quant_matrix[0, 0] *= 0.6  # Preserve more DC coefficient
        
        # Quantize all blocks
        quantized = np.round(transformed / quant_matrix)
        
        # Dequantize all blocks
        dequantized = quantized * quant_matrix
        
        # Inverse transform all blocks
        reconstructed = fftpack.idctn(dequantized, type=2, norm='ortho', axes=(1, 2))
        
        return reconstructed

    @staticmethod
    def compress_channel(channel: np.ndarray, quality: int, block_size: int = 16) -> np.ndarray:
        """
        Optimized channel compression using vectorized operations
        :param channel: Input channel
        :param quality: Compression quality
        :param block_size: Size of processing blocks
        :return: Compressed channel
        """
        height, width = channel.shape
        padded_h = ((height + block_size - 1) // block_size) * block_size
        padded_w = ((width + block_size - 1) // block_size) * block_size
        
        # Pad the channel
        padded = np.pad(
            channel,
            ((0, padded_h - height), (0, padded_w - width)),
            mode='edge'  # Use edge padding instead of constant
        )
        
        # Extract blocks, left columns, and top rows
        blocks = []
        left_cols = []
        top_rows = []
        
        for i in range(0, padded_h, block_size):
            for j in range(0, padded_w, block_size):
                blocks.append(padded[i:i+block_size, j:j+block_size])
                left_cols.append(
                    padded[i:i+block_size, j-1] if j > 0
                    else np.zeros(block_size)
                )
                top_rows.append(
                    padded[i-1, j:j+block_size] if i > 0
                    else np.zeros(block_size)
                )
        
        # Convert to numpy arrays
        blocks = np.array(blocks)
        left_cols = np.array(left_cols)
        top_rows = np.array(top_rows)
        
        # Predict blocks
        predictions, _ = WebPCompressor.predict_blocks_vectorized(
            blocks, left_cols, top_rows
        )
        
        # Calculate residuals
        residuals = blocks - predictions
        
        # Process residuals
        reconstructed_residuals = WebPCompressor.process_blocks_vectorized(
            residuals, quality
        )
        
        # Reconstruct blocks
        reconstructed_blocks = predictions + reconstructed_residuals
        
        # Reassemble the channel
        result = np.zeros_like(padded)
        block_idx = 0
        for i in range(0, padded_h, block_size):
            for j in range(0, padded_w, block_size):
                result[i:i+block_size, j:j+block_size] = reconstructed_blocks[block_idx]
                block_idx += 1
        
        # Remove padding and clip values
        result = result[:height, :width]
        return np.clip(result, 0, 255)

    @staticmethod
    def get_compress_image(image: Image.Image, quality: int = 85) -> Image.Image:
        """
        Compress an image using optimized WebP-like compression
        :param image: Input image
        :param quality: Compression quality (1-100), defaults to 85
        :return: Compressed image
        """
        # Validate input
        validate_compression_input(image, quality)

        # Convert to YUV color space
        yuv_img = WebPCompressor.rgb_to_yuv(image)

        # Process each channel with vectorized operations
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
