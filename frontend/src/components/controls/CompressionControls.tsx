import React from 'react';

import { ProcessedImage } from '../../types';
import { Button, Flex, Select, Slider, Space, Typography } from 'antd';

interface CompressionControlsProps {
  images: ProcessedImage[];
  compressionQuality: number;
  compressionFormat: 'jpeg' | 'webp';
  onQualityChange: (quality: number) => void;
  onFormatChange: (format: 'jpeg' | 'webp') => void;
  onCompress: () => void;
  isCompressing: boolean;
}

export const CompressionControls: React.FC<CompressionControlsProps> = ({
  images,
  compressionQuality,
  compressionFormat,
  onQualityChange,
  onFormatChange,
  onCompress,
  isCompressing,
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

      <Button
        type={'primary'}
        onClick={onCompress}
        disabled={images.length === 0 || isCompressing}
        loading={isCompressing}
      >
        Compress Images
      </Button>
    </Flex>
  );
};
