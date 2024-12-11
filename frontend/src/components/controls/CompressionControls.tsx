import React from 'react';
import styled from 'styled-components';

import { ProcessedImage } from '../../types';
import { Flex, Select, Slider, Space, Typography } from 'antd';

const FunctionButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

interface CompressionControlsProps {
  images: ProcessedImage[];
  compressionQuality: number;
  compressionFormat: 'jpeg' | 'webp';
  onQualityChange: (quality: number) => void;
  onFormatChange: (format: 'jpeg' | 'webp') => void;
  onCompress: () => void;
}

export const CompressionControls: React.FC<CompressionControlsProps> = ({
  images,
  compressionQuality,
  compressionFormat,
  onQualityChange,
  onFormatChange,
  onCompress,
}) => {
  return (
    <Flex justify={'center'} gap={10} wrap={'wrap'}>
      <Space wrap={true}>
        <label htmlFor='qualitySlider'>Compression Quality:</label>
        <Slider
          id='qualitySlider'
          min={0}
          max={100}
          value={compressionQuality * 100}
          onChange={(value) => onQualityChange(value / 100)}
          style={{ width: '200px' }}
        />
        <span>{Math.round(compressionQuality * 100)}%</span>
      </Space>

      <Space wrap={true}>
        <Typography.Text>Compression Format:</Typography.Text>
        <Select
          id='compressionFormat'
          value={compressionFormat}
          options={[
            { value: 'jpeg', label: 'JPEG' },
            { value: 'webp', label: 'WebP' },
          ]}
          onSelect={(value) => onFormatChange(value as 'jpeg' | 'webp')}
        />
      </Space>

      <FunctionButton onClick={onCompress} disabled={images.length === 0}>
        Compress Images
      </FunctionButton>
    </Flex>
  );
};
