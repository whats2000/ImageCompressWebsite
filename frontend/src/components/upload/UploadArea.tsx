import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import axios from 'axios';

import { ProcessedImage } from '../../types';
import { BACKEND_API_URL } from '../../styles/GlobalStyles';

const UploadContainer = styled.div<{ $isDragActive: boolean }>`
  border: 2px dashed var(--primary-color);
  border-radius: 10px;
  padding: 2rem;
  margin: 2rem 0;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: ${(props) =>
    props.$isDragActive ? 'rgba(74, 144, 226, 0.1)' : 'transparent'};
`;

const UploadIcon = styled.svg`
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  fill: var(--primary-color);
  transition: transform 0.3s ease;

  ${UploadContainer}:hover & {
    transform: scale(1.1);
  }
`;

const UploadInput = styled.input`
  display: none;
`;

const UploadButton = styled.label`
  background-color: var(--primary-color);
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 5px;
  cursor: pointer;
  display: inline-block;
  margin-top: 1rem;
`;

interface UploadAreaProps {
  onUploadComplete: (images: ProcessedImage[]) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onUploadComplete }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    void processFiles(files);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      void processFiles(files);
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/'),
    );

    if (validFiles.length === 0) {
      toast.warn('No valid image files selected');
      return;
    }

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
          `${BACKEND_API_URL}/api/upload`,
          formData,
        );
        const data = response.data;

        if (data.success) {
          return {
            imageId: data.image_id,
            fileName: file.name,
            originalUrl: data.original_image_url,
          };
        } else {
          toast.error(`Upload failed for ${file.name}`);
          return null;
        }
      });

      const uploadedImages = (await Promise.all(uploadPromises)).filter(
        Boolean,
      ) as ProcessedImage[];

      if (uploadedImages.length > 0) {
        onUploadComplete(uploadedImages);
      }
    } catch (error) {
      toast.error('Error uploading files');
      console.error(error);
    }
  };

  return (
    <>
      <UploadContainer
        $isDragActive={isDragActive}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadIcon
          width='64'
          height='64'
          viewBox='0 0 21 20'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M9.62797 16.8053H3.14748C2.29062 16.8053 1.5933 16.1082 1.5933 15.2514V2.64748C1.5933 1.7904 2.29062 1.09308 3.14748 1.09308H13.6512C14.5076 1.09308 15.2047 1.7904 15.2047 2.64748V8.60266C15.2047 8.90398 15.45 9.14908 15.7514 9.14908C16.0527 9.14908 16.298 8.90398 16.298 8.60266V2.64748C16.298 1.18775 15.1105 0 13.6512 0H3.14748C1.68752 0 0.5 1.18775 0.5 2.64748V15.2514C0.5 16.7111 1.68752 17.8988 3.14748 17.8988H9.62797C9.9293 17.8988 10.1746 17.6535 10.1746 17.352C10.1746 17.0506 9.9293 16.8053 9.62797 16.8053Z'></path>
          <path d='M15.2266 9.45312C12.3191 9.45312 9.95361 11.8188 9.95361 14.7261C9.95339 17.6338 12.3191 19.9995 15.2266 19.9995C18.1341 19.9995 20.4998 17.6338 20.4998 14.7263C20.4998 11.8188 18.1341 9.45312 15.2266 9.45312ZM15.2266 18.9062C12.922 18.9062 11.0467 17.0311 11.0467 14.7261C11.0467 12.421 12.9218 10.546 15.2266 10.546C17.5316 10.546 19.4067 12.421 19.4067 14.7261C19.4067 17.0311 17.5316 18.9062 15.2266 18.9062Z'></path>
          <path d='M17.5272 14.1807H15.7733V12.4265C15.7733 12.1252 15.5279 11.8799 15.2264 11.8799C14.9248 11.8799 14.6795 12.1252 14.6795 12.4265V14.1807H12.9256C12.6245 14.1807 12.3789 14.426 12.3789 14.7271C12.3789 15.0287 12.6242 15.274 12.9256 15.274H14.6795V17.0282C14.6795 17.3295 14.9248 17.5748 15.2264 17.5748C15.5279 17.5748 15.7733 17.3295 15.7733 17.0282V15.2738H17.5272C17.8283 15.2738 18.0739 15.0285 18.0739 14.7269C18.0739 14.4254 17.8285 14.1807 17.5272 14.1807Z'></path>
          <path d='M12.2545 4.40234H4.5447C4.24337 4.40234 3.99805 4.64767 3.99805 4.94922C3.99805 5.25032 4.24337 5.49565 4.5447 5.49565H12.2538C12.5551 5.49565 12.8007 5.25032 12.8007 4.94922C12.8009 4.64767 12.5556 4.40234 12.2545 4.40234Z'></path>
          <path d='M12.8009 8.4236C12.8009 8.12228 12.5556 7.87695 12.2545 7.87695H4.5447C4.24337 7.87695 3.99805 8.12228 3.99805 8.4236C3.99805 8.72471 4.24337 8.97003 4.5447 8.97003H12.2538C12.5556 8.97003 12.8009 8.72493 12.8009 8.4236Z'></path>
          <path d='M4.5447 11.3545C4.24337 11.3545 3.99805 11.5998 3.99805 11.9014C3.99805 12.2025 4.24337 12.4478 4.5447 12.4478H9.10302C9.40434 12.4478 9.64967 12.2025 9.64967 11.9014C9.64967 11.6 9.40434 11.3545 9.10302 11.3545H4.5447Z'></path>
        </UploadIcon>
        <p>Drag & Drop your images here</p>
        <p>or</p>
        <UploadButton>Choose File</UploadButton>
        <UploadInput
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          onChange={handleFileSelect}
        />
      </UploadContainer>
    </>
  );
};
