export interface ProcessedImage {
  imageId: string;
  fileName: string;
  originalUrl: string;
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

export interface UploadState {
  images: ProcessedImage[];
  selectedDownloadType: 'compressed' | 'original' | 'watermarked';
  compressionQuality: number;
  compressionFormat: 'jpeg' | 'webp';
}