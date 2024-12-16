import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Image, Space, Typography } from 'antd';
import axios from 'axios';

import { ProcessedImage } from '../../types';
import { BACKEND_API_URL } from '../../styles/GlobalStyles.ts';
import { DeleteOutlined } from '@ant-design/icons';

const PreviewArea = styled.div`
  width: 45%;
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePreviews = styled.div<{ $imageCount: number }>`
  display: grid;
  gap: 1rem;
  grid-template-columns: ${(props) => {
    switch (props.$imageCount) {
      case 1:
        return '1fr';
      case 2:
        return '1fr 1fr';
      case 3:
        return 'repeat(3, 1fr)';
      default:
        return 'repeat(auto-fill, minmax(200px, 1fr))';
    }
  }};
`;

const ImagePreview = styled.div`
  position: relative;
  overflow: hidden;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  padding: 0.5rem;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  border-radius: 4px;
`;

interface ImagePreviewAreaProps {
  images: ProcessedImage[];
  onDeleteImage: (imageId: string) => void;
  lastOperation:
    | 'compressWithWebp'
    | 'compressWithJpeg'
    | 'watermark'
    | 'basicOperation'
    | null;
}

export const ImagePreviewArea: React.FC<ImagePreviewAreaProps> = ({
  images,
  onDeleteImage,
  lastOperation,
}) => {
  const [imageSrcs, setImageSrcs] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      const updatedSrcs: Record<string, string> = {};
      for (const image of images) {
        try {
          let imageType: string;
          switch (lastOperation) {
            case 'compressWithWebp':
              imageType = 'webp';
              break;
            case 'compressWithJpeg':
              imageType = 'jpeg';
              break;
            case 'watermark':
              imageType = 'watermarked';
              break;
            case 'basicOperation':
              imageType = 'basicOperation';
              break;
            default:
              imageType = 'original';
              break;
          }
          const response = await axios.get(
            `${BACKEND_API_URL}/api/image/${image.imageId}?type=${imageType}`,
          );
          if (response.data.success) {
            updatedSrcs[image.imageId] =
              `data:image/png;base64,${response.data.image_base64}`;
          }
        } catch (error) {
          console.error('Unable to retrieve image:', error);
        }
      }
      setImageSrcs(updatedSrcs);
    };

    void fetchImages();
  }, [images, lastOperation]);

  if (images.length === 0) return null;

  return (
    <>
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
      <PreviewArea>
        <h3>Selected Images</h3>
        <ImagePreviews $imageCount={images.length}>
          {images.map((image) => (
            <ImagePreview key={image.imageId}>
              <Space direction={'vertical'}>
                {imageSrcs[image.imageId] ? (
                  <PreviewImage
                    src={imageSrcs[image.imageId]}
                    alt={image.fileName}
                    onClick={() => {
                      setPreviewImage(imageSrcs[image.imageId]);
                      setPreviewOpen(true);
                    }}
                  />
                ) : (
                  <p>Loading...</p>
                )}
                <Space>
                  <Typography.Text>{image.fileName}</Typography.Text>
                  <Button
                    icon={<DeleteOutlined />}
                    danger={true}
                    onClick={() => onDeleteImage(image.imageId)}
                  />
                </Space>
              </Space>
            </ImagePreview>
          ))}
        </ImagePreviews>
      </PreviewArea>
    </>
  );
};
