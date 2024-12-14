import React, { useState } from 'react';
import styled from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import { ProcessedImage } from '../types';
import { BACKEND_API_URL } from '../styles/GlobalStyles';
import { useNotification } from '../hooks/useNotification';

// Import subcomponents
import { UploadArea } from './upload/UploadArea';
import { ImagePreviewArea } from './upload/ImagePreviewArea';
import { CompressionControls } from './controls/CompressionControls';
import { WatermarkControls } from './controls/WatermarkControls';
import { DownloadControls } from './controls/DownloadControls';
import { Card, Space } from 'antd';

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
        setImages((prev) => prev.filter((img) => img.imageId !== imageId));
        notify.success('Image deleted successfully');
      } else {
        notify.error('Failed to delete image');
      }
    } catch (error) {
      notify.error('Error deleting image');
      console.error(error);
    }
  };

  const handleCompressImages = async () => {
    if (images.length === 0) {
      notify.warn('No images to compress');
      return;
    }
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
    }
  };

  const handleAddWatermark = async (
    watermarkText: string,
    watermarkPosition: string,
  ) => {
    if (images.length === 0) {
      notify.warn('No images to watermark');
      return;
    }

    if (!watermarkText) {
      notify.warn('Please enter watermark text');
      return;
    }

    try {
      const watermarkPromises = images.map(async (image) => {
        const response = await axios.post(`${BACKEND_API_URL}/api/watermark`, {
          image_id: image.imageId,
          watermark_text: watermarkText,
          position: watermarkPosition,
        });

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

          <Card>
            <Space direction={'vertical'}>
              <WatermarkControls
                images={images}
                onAddWatermark={handleAddWatermark}
              />
              <CompressionControls
                images={images}
                compressionQuality={compressionQuality}
                compressionFormat={compressionFormat}
                onQualityChange={setCompressionQuality}
                onFormatChange={setCompressionFormat}
                onCompress={handleCompressImages}
              />
              <DownloadControls images={images} lastOperation={lastOperation} />
            </Space>
          </Card>
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
