export interface ImageOperations {
  resize?: { width: number; height: number };
  rotate?: { angle: number };
  crop?: { left: number; top: number; right: number; bottom: number };
  flip?: { direction: 'horizontal' | 'vertical' };
  grayscale?: object;
}

export interface ProcessedImage {
  imageId: string;
  fileName: string;
  originalUrl: string;
  url: string;
  previewUrl?: string;
  compressedUrl?: string;
  watermarkedUrl?: string;
}

export interface CompressResponse {
  success: boolean;
  message: string;
  original_image_url?: string;
  compressed_image_url?: string;
  image_id: string;
}

export interface WatermarkResponse {
  success: boolean;
  message: string;
  watermarked_image_url?: string;
}
