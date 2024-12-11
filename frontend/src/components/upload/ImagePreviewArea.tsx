import React from 'react';
import styled from 'styled-components';
import { ProcessedImage } from '../../types';
import { UPLOAD_FILE_BASE_URL } from '../../styles/GlobalStyles';

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
  grid-template-columns: ${props => {
    switch(props.$imageCount) {
      case 1: return '1fr';
      case 2: return '1fr 1fr';
      case 3: return 'repeat(3, 1fr)';
      default: return 'repeat(auto-fill, minmax(200px, 1fr))';
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

const DeleteButton = styled.button`
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: transparent;
  border: none;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
    fill: red;
  }
`;

interface ImagePreviewAreaProps {
  images: ProcessedImage[];
  onDeleteImage: (imageId: string) => void;
}

export const ImagePreviewArea: React.FC<ImagePreviewAreaProps> = ({ 
  images, 
  onDeleteImage 
}) => {
  if (images.length === 0) return null;

  return (
    <PreviewArea>
      <h3>Selected Images</h3>
      <ImagePreviews $imageCount={images.length}>
        {images.map(image => (
          <ImagePreview key={image.imageId}>
            <PreviewImage 
              src={`${UPLOAD_FILE_BASE_URL}/${image.compressedUrl || image.originalUrl}`} 
              alt={image.fileName} 
            />
            <p>{image.fileName}</p>
            <DeleteButton onClick={() => onDeleteImage(image.imageId)}>
              <svg viewBox="0 0 24 24">
                <path d="M3 6h18M9 6v12M15 6v12M4 6l1 14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1l1-14M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"></path>
              </svg>
            </DeleteButton>
          </ImagePreview>
        ))}
      </ImagePreviews>
    </PreviewArea>
  );
};