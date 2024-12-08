import math

import numpy as np
from PIL import Image
from scipy import fftpack
from tqdm import tqdm

from utils.image_validation import validate_compression_input

USE_MANUAL_DCT = False


class JPEGCompressor:
    # JPEG quantization matrix
    QUANTIZATION_MATRIX = np.array([
        [16, 11, 10, 16, 24, 40, 51, 61],
        [12, 12, 14, 19, 26, 58, 60, 55],
        [14, 13, 16, 24, 40, 57, 69, 56],
        [14, 17, 22, 29, 51, 87, 80, 62],
        [18, 22, 37, 56, 68, 109, 103, 77],
        [24, 35, 55, 64, 81, 104, 113, 92],
        [49, 64, 78, 87, 103, 121, 120, 101],
        [72, 92, 95, 98, 112, 100, 103, 99]
    ])

    @staticmethod
    def rgb_to_ycbcr(image: Image.Image) -> np.ndarray:
        """
        Convert RGB image to YCbCr color space with precise coefficients
        :param image: Input image
        :return: YCbCr image
        """
        # Use standard ITU-R BT.601 coefficients
        img_array = np.array(image, dtype=np.float32) / 255.0

        # Precise conversion to YCbCr
        y = 0.299 * img_array[:, :, 0] + 0.587 * img_array[:, :, 1] + 0.114 * img_array[:, :, 2]
        cb = -0.169 * img_array[:, :, 0] - 0.331 * img_array[:, :, 1] + 0.500 * img_array[:, :, 2] + 0.5
        cr = 0.500 * img_array[:, :, 0] - 0.419 * img_array[:, :, 1] - 0.081 * img_array[:, :, 2] + 0.5

        # Stack and scale back to 0-255
        ycbcr_img = np.stack([y, cb, cr], axis=-1) * 255.0
        return np.clip(ycbcr_img, 0, 255).astype(np.float32)

    @staticmethod
    def ycbcr_to_rgb(ycbcr_img: np.ndarray) -> np.ndarray:
        """
        Convert YCbCr image back to RGB with precise inverse transformation
        :param ycbcr_img: YCbCr image
        :return: RGB image
        """
        ycbcr = ycbcr_img / 255.0

        # Inverse transformation
        r = ycbcr[:, :, 0] + 1.402 * (ycbcr[:, :, 2] - 0.5)
        g = ycbcr[:, :, 0] - 0.34414 * (ycbcr[:, :, 1] - 0.5) - 0.71414 * (ycbcr[:, :, 2] - 0.5)
        b = ycbcr[:, :, 0] + 1.772 * (ycbcr[:, :, 1] - 0.5)

        rgb_img = np.stack([r, g, b], axis=-1)
        return np.clip(rgb_img * 255.0, 0, 255).astype(np.uint8)

    @staticmethod
    def blockwise_dct(block: np.ndarray) -> np.ndarray:
        """
        Apply DCT to a single block
        :param block: Input block
        :return: DCT transformed block
        """
        # Well, the manual DCT implementation will cost you a lot of time, try it out when you have time
        if not USE_MANUAL_DCT:
            return fftpack.dctn(block, type=2, norm='ortho')

        # Manual DCT implementation
        n = 8
        dct_block = np.zeros((n, n), dtype=float)
        for u in range(n):
            for v in range(n):
                # Calculate alpha values
                alpha_u = math.sqrt(1 / n) if u == 0 else math.sqrt(2 / n)
                alpha_v = math.sqrt(1 / n) if v == 0 else math.sqrt(2 / n)

                # Calculate DCT sum
                sum_val = 0
                for x in range(n):
                    for y in range(n):
                        sum_val += (
                            block[x, y] *
                            math.cos((2 * x + 1) * u * math.pi / (2 * n)) *
                            math.cos((2 * y + 1) * v * math.pi / (2 * n))
                        )

                # Apply DCT formula
                dct_block[u, v] = alpha_u * alpha_v * sum_val
        return dct_block

    @staticmethod
    def blockwise_idct(block: np.ndarray) -> np.ndarray:
        """
        Apply inverse DCT to a single block
        :param block: Input DCT block
        :return: Inversed DCT block
        """
        return fftpack.idctn(block, type=2, norm='ortho')

    @staticmethod
    def quantize_block(block: np.ndarray, quality: int) -> np.ndarray:
        """
        Quantize a DCT block using JPEG quantization matrix
        :param block: DCT block
        :param quality: Compression quality
        :return: Quantized block
        """
        # Calculate quantization matrix
        scale = 5000 / quality if quality < 50 else 200 - 2 * quality
        quant_matrix = np.clip((JPEGCompressor.QUANTIZATION_MATRIX * scale + 50) // 100, 1, 255)
        return np.round(block / quant_matrix).astype(int)

    @staticmethod
    def dequantize_block(block: np.ndarray, quality: int) -> np.ndarray:
        """
        Dequantize a quantized DCT block using JPEG quantization matrix
        :param block: Quantized DCT block
        :param quality: Compression quality
        :return: Dequantized block
        """
        # Calculate quantization matrix
        scale = 5000 / quality if quality < 50 else 200 - 2 * quality
        quant_matrix = np.clip((JPEGCompressor.QUANTIZATION_MATRIX * scale + 50) // 100, 1, 255)
        return block * quant_matrix

    @staticmethod
    def get_compress_image(image: Image.Image, quality: int = 85) -> Image.Image:
        """
        Manually compress an image using JPEG-like compression
        :param image: Input image
        :param quality: Compression quality (1-100), defaults to 85
        :return: Compressed image
        """
        # Validate input
        validate_compression_input(image, quality)

        ycbcr_img = JPEGCompressor.rgb_to_ycbcr(image)

        # Add padding to image
        h, w, _ = ycbcr_img.shape
        padded_h = (h + 7) // 8 * 8
        padded_w = (w + 7) // 8 * 8
        padded_img = np.pad(ycbcr_img, ((0, padded_h - h), (0, padded_w - w), (0, 0)), mode='constant')

        # Split image into 8x8 blocks and for each channel
        channels = []
        for c in tqdm(range(3), desc="Compressing", leave=False):
            # Extract 8x8 blocks
            blocks = [
                padded_img[i:i + 8, j:j + 8, c]
                for i in range(0, padded_img.shape[0], 8)
                for j in range(0, padded_img.shape[1], 8)
            ]

            # Apply DCT
            quantized_blocks = [
                JPEGCompressor.quantize_block(JPEGCompressor.blockwise_dct(block), quality)
                for block in blocks
            ]

            # Apply inverse DCT
            reconstructed_blocks = [
                JPEGCompressor.blockwise_idct(JPEGCompressor.dequantize_block(block, quality))
                for block in quantized_blocks
            ]

            # Reconstruct channel
            reconstructed_channel = np.zeros_like(padded_img[:, :, 0])
            for idx, block in enumerate(reconstructed_blocks):
                i = (idx // (padded_w // 8)) * 8
                j = (idx % (padded_w // 8)) * 8
                reconstructed_channel[i:i + 8, j:j + 8] = block
            channels.append(reconstructed_channel)

        # Remove padding
        reconstructed_img = np.stack(channels, axis=2)[:h, :w]

        # Convert back to RGB
        rgb_img = JPEGCompressor.ycbcr_to_rgb(reconstructed_img)
        return Image.fromarray(rgb_img)


# Export function to match the expected interface
def jpeg_compression(image: Image.Image, quality: int = 85) -> Image.Image:
    """
    Wrapper for JPEG compression
    :param image: Input image
    :param quality: Compression quality, defaults to 85
    :return: Compressed image
    """
    return JPEGCompressor.get_compress_image(image, quality)
