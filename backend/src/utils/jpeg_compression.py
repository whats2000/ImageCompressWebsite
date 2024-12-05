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
    def rgb_to_ycbcr(image: Image.Image) -> np.ndarray:
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

        # Shift values
        shift = np.array([0, 128, 128])

        return np.tensordot(img_array, ycbcr_matrix.T, axes=([2], [1])) + shift

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

        # Unshift values
        shift = np.array([0, -128, -128])

        return np.clip(np.tensordot(ycbcr_img + shift, rgb_matrix.T, axes=([2], [0])), 0, 255).astype(np.uint8)

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
    def blockwise_idct(block: np.ndarray) -> np.ndarray:
        """
        Apply inverse DCT to a single block
        """
        return fftpack.idctn(block, type=2, norm='ortho')

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
        scale = 5000 / quality if quality < 50 else 200 - 2 * quality
        quant_matrix = np.clip((JPEGCompressor.QUANTIZATION_MATRIX * scale + 50) // 100, 1, 255)
        return np.round(block / quant_matrix).astype(int)

    @staticmethod
    def dequantize_block(block: np.ndarray, quality: int) -> np.ndarray:
        """
        Dequantize a quantized DCT block using JPEG quantization matrix

        Args:
            block (np.ndarray): Quantized DCT block
            quality (int): Compression quality

        Returns:
            np.ndarray: Dequantized block
        """
        # Calculate quantization matrix
        scale = 5000 / quality if quality < 50 else 200 - 2 * quality
        quant_matrix = np.clip((JPEGCompressor.QUANTIZATION_MATRIX * scale + 50) // 100, 1, 255)
        return block * quant_matrix

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
        ycbcr_img = JPEGCompressor.rgb_to_ycbcr(image)

        # Add padding to image
        h, w, _ = ycbcr_img.shape
        padded_h = (h + 7) // 8 * 8
        padded_w = (w + 7) // 8 * 8
        padded_img = np.pad(ycbcr_img, ((0, padded_h - h), (0, padded_w - w), (0, 0)), mode='constant')

        # Split image into 8x8 blocks and for each channel
        channels = []
        for c in range(3):
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

    Args:
        image (PIL.Image): Input image
        quality (int, optional): Compression quality. Defaults to 85.

    Returns:
        PIL.Image: Compressed image
    """
    return JPEGCompressor.get_compress_image(image, quality)


if __name__ == '__main__':
    # Example usage
    input_image = Image.open('example.png')
    compressed_image = jpeg_compression(input_image, quality=85)
    compressed_image.save('compressed_example.jpg')
    compressed_image.show()
