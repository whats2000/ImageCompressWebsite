import React, { useState } from 'react';
import styled from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import { ProcessedImage } from '../types';
import { BACKEND_API_URL } from '../styles/GlobalStyles';
import { useNotification } from '../hooks/useNotification';
import { WatermarkConfig } from './controls/WatermarkEditor';

// Import subcomponents
import { UploadArea } from './upload/UploadArea';
import { ImagePreviewArea } from './upload/ImagePreviewArea';
import { CompressionControls } from './controls/CompressionControls';
import WatermarkControls from './controls/WatermarkControls';
import { DownloadControls } from './controls/DownloadControls';
import { Space } from 'antd';

const MainContainer = styled.main`
  max-width: 1200px;
  min-height: 100vh;
  margin: 5rem auto;
  padding: 0 1rem;
  text-align: center;
`;

export const MainContent: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const [compressionFormat, setCompressionFormat] = useState<'jpeg' | 'webp'>(
    'webp',
  );
  const [isCompressing, setIsCompressing] = useState(false);
  const [isWatermarking, setIsWatermarking] = useState(false);
  const [lastOperation, setLastOperation] = useState<
    'compressWithWebp' | 'compressWithJpeg' | 'watermark' | null
  >(null);

  // Use the custom notification hook
  const notify = useNotification();

  const handleUploadComplete = (newImages: ProcessedImage[]) => {
    setImages((prev) => [...prev, ...newImages]);
    notify.success(`${newImages.length} image(s) uploaded successfully`);
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await axios.delete(
        `${BACKEND_API_URL}/api/delete/${imageId}`,
      );

      if (response.data.success) {
        notify.success('Image deleted successfully');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setImages((prev) => prev.filter((img) => img.imageId !== imageId));
    }
  };

  const handleCompressImages = async () => {
    if (images.length === 0) {
      notify.warn('No images to compress');
      return;
    }
    setIsCompressing(true);
    let haveErrors = false;
    try {
      const compressPromises = images.map(async (image) => {
        const response = await axios.post(`${BACKEND_API_URL}/api/compress`, {
          image_id: image.imageId,
          compression_format: compressionFormat,
          compression_quality: compressionQuality,
        });

        const data = response.data;

        if (data.success) {
          setLastOperation(
            compressionFormat === 'webp'
              ? 'compressWithWebp'
              : 'compressWithJpeg',
          );

          return {
            ...image,
            compressedUrl: data.compressed_image_url,
          };
        } else {
          notify.error(
            `Compression failed for ${image.fileName} with error: ${data.message}`,
          );
          haveErrors = true;
          return image;
        }
      });

      const compressedImages = await Promise.all(compressPromises);

      setImages(compressedImages);

      if (!haveErrors) {
        notify.success('Images compressed successfully');
      }
    } catch (error) {
      notify.error('Error compressing images');
      console.error(error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAddWatermark = async (
    watermarkText: string,
    watermarkPosition: string,
    config?: Partial<WatermarkConfig>,
  ) => {
    if (images.length === 0) {
      notify.warn('No images to watermark');
      return;
    }
    setIsWatermarking(true);

    if (!watermarkText) {
      notify.warn('Please enter watermark text');
      return;
    }

    try {
      const watermarkPromises = images.map(async (image) => {
        // 构建请求载荷，包含原始图片尺寸信息
        const payload = {
          image_id: image.imageId,
          watermark_text: watermarkText,
          position: config?.position || watermarkPosition,
          color: config?.color,
          rotation: config?.rotation,
          opacity: config?.opacity,
          customPosition: config?.position,
          natural_size: config?.naturalSize,
          preview_size: config?.previewSize,
        };

        console.log('Watermark payload:', payload); // 调试信息

        const response = await axios.post(
          `${BACKEND_API_URL}/api/watermark`,
          payload,
        );

        const data = response.data;

        if (data.success) {
          setLastOperation('watermark');

          return {
            ...image,
            watermarkedUrl: data.watermarked_image_url,
          };
        } else {
          notify.error(`Watermarking failed for ${image.fileName}`);
          return image;
        }
      });

      const watermarkedImages = await Promise.all(watermarkPromises);

      setImages(watermarkedImages);
      notify.success('Watermarks added successfully');
    } catch (error) {
      notify.error('Error adding watermarks');
      console.error(error);
    } finally {
      setIsWatermarking(false);
    }
  };

  return (
    <MainContainer>
      <h1>COMPRESS IMAGE</h1>
      <p>Compress images with customizable quality and format.</p>

      <UploadArea onUploadComplete={handleUploadComplete} />

      {images.length > 0 && (
        <>
          <ImagePreviewArea images={images} onDeleteImage={handleDeleteImage} />
          <Space direction='vertical' style={{ width: '100%' }}>
            <WatermarkControls
              images={images}
              onAddWatermark={handleAddWatermark}
              isWatermarking={isWatermarking}
            />
            <CompressionControls
              images={images}
              compressionQuality={compressionQuality}
              compressionFormat={compressionFormat}
              onQualityChange={setCompressionQuality}
              onFormatChange={setCompressionFormat}
              onCompress={handleCompressImages}
              isCompressing={isCompressing}
            />
            <DownloadControls images={images} lastOperation={lastOperation} />
          </Space>
        </>
      )}

      <ToastContainer
        position='bottom-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </MainContainer>
  );
};
