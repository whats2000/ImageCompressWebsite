/**
 * The response from the server when a new image is uploaded.
 */
export interface CompressResponse {
  success: boolean;
  message: string;
  image_id: string;
  original_image_url: string;
  compressed_image_url: string;
}


/**
 * The response from the server when a new image is uploaded.
 */
export interface WatermarkResponse {
  success: boolean;
  message: string;
  image_id: string;
  watermarked_image_url: string;
}

/**
 * The response from the server when a new image is uploaded.
 */
export interface ProcessedImage {
  imageId: string,
  fileName: string,
  compression_format: string,
}
