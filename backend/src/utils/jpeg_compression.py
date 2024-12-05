import math

import numpy as np
from PIL import Image
from scipy import fftpack

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

    @staticmethod
    def rgb_to_ycbcrt(image: Image.Image) -> np.ndarray:
        """
        Convert RGB image to YCbCr color space
        This is used for quantization and DCT

        Args:
            image (PIL.Image): Input image

        Returns:
            np.ndarray: YCbCr image
        """
        # Convert to a numpy array
        img_array = np.array(image)

        # RGB to YCbCr conversion matrix
        # Source:
        # https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdprfx/b550d1b5-f7d9-4a0c-9141-b3dca9d7f525
        ycbcr_matrix = np.array([
            [0.299, 0.587, 0.114],
            [-0.168935, -0.331665, 0.50059],
            [0.499813, -0.418531, -0.081282]
        ])

        # Apply conversion
        ycbcr_img = np.dot(img_array, ycbcr_matrix.T)

        # Shift values
        shift = np.array([0, 128, 128])

        return np.clip(ycbcr_img + shift, 0, 255).astype(np.uint8)

    @staticmethod
    def ycbcr_to_rgb(ycbcr_img: np.ndarray) -> np.ndarray:
        """
        Convert YCbCr image to RGB color space

        Args:
            ycbcr_img (np.ndarray): YCbCr image

        Returns:
            np.ndarray: RGB image
        """
        # YCbCr to RGB conversion matrix
        # Source:
        # https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdprfx/b550d1b5-f7d9-4a0c-9141-b3dca9d7f525
        ycbcr_matrix = np.array([
            [0.299, 0.587, 0.114],
            [-0.168935, -0.331665, 0.50059],
            [0.499813, -0.418531, -0.081282]
        ])
        rgb_matrix = np.linalg.inv(ycbcr_matrix)

        # Shift values
        shift = np.array([0, -128, -128])

        # Apply conversion
        rgb_img = ycbcr_img - shift
        rgb_img = np.dot(rgb_img, rgb_matrix.T)

        return np.clip(rgb_img, 0, 255).astype(np.uint8)

    @staticmethod
    def blockwise_dct(block: np.ndarray) -> np.ndarray:
        """
        Apply DCT to a single block

        Args:
            block (np.ndarray): Input block

        Returns:
            np.ndarray: DCT transformed block
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
    def quantize_block(block: np.ndarray, quality: int) -> np.ndarray:
        """
        Quantize a DCT block using JPEG quantization matrix

        Args:
            block (np.ndarray): DCT block
            quality (int): Compression quality

        Returns:
            np.ndarray: Quantized block
        """
        # Calculate quantization matrix
        quality_factor = 5000 / quality if quality < 50 else 200 - 2 * quality
        quant_matrix = np.floor((JPEGCompressor.QUANTIZATION_MATRIX * quality_factor + 50) / 100)

        # Apply quantization
        return np.round(block / quant_matrix).astype(int)

    @staticmethod
    def get_compress_image(image: Image.Image, quality: int = 85) -> Image.Image:
        """
        Manually compress an image using JPEG-like compression

        Args:
            image (PIL.Image): Input image
            quality (int): Compression quality (1-100)

        Returns:
            PIL.Image: Compressed image
        """
        # Validate input
        JPEGCompressor.validate_input(image, quality)

        # Convert image to YCbCr color space
        ycbcr_img = JPEGCompressor.rgb_to_ycbcrt(image)

        # Padding to ensure 8x8 blocks
        width, height = ycbcr_img.shape[1], ycbcr_img.shape[0]
        new_width = (width + 7) // 8 * 8
        new_height = (height + 7) // 8 * 8
        padding_image = np.zeros((new_height, new_width, 3), dtype=np.uint8)
        padding_image[:height, :width] = ycbcr_img

        # Split image into blocks
        blocks = np.array([
            padding_image[i:i + 8, j:j + 8]
            for i in range(0, padding_image.shape[0], 8)
            for j in range(0, padding_image.shape[1], 8)
        ])

        # Apply DCT and quantization to each block
        quantized_blocks = np.array([
            JPEGCompressor.quantize_block(JPEGCompressor.blockwise_dct(block), quality)
            for block in blocks
        ])

        # Reconstruct image from quantized blocks
        ycbcr_reconstructed = np.zeros_like(padding_image)

        for i, block in enumerate(quantized_blocks):
            x = (i // (padding_image.shape[1] // 8)) * 8
            y = (i % (padding_image.shape[1] // 8)) * 8
            ycbcr_reconstructed[x:x + 8, y:y + 8] = block

        # Remove padding
        ycbcr_reconstructed_clipped = ycbcr_reconstructed[:height, :width]

        # Convert back to RGB color space
        rgb_img = JPEGCompressor.ycbcr_to_rgb(ycbcr_reconstructed_clipped)

        return Image.fromarray(rgb_img, 'RGB')


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
    return JPEGCompressor.get_compress_image(image, quality)
