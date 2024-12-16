import React from 'react';

import { ProcessedImage } from '../../types';
import { Button, Card, Flex, Select, Slider, Typography } from 'antd';

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
    <Card title={'Compression Configuration'} style={{ height: '100%' }}>
      <Flex
        justify={'center'}
        align={'center'}
        gap={10}
        wrap={'wrap'}
        vertical={true}
      >
        <Flex wrap={'wrap'} gap={16} justify={'center'}>
          <Typography.Text>Compression Quality:</Typography.Text>
          <Slider
            id='qualitySlider'
            min={0}
            max={100}
            value={compressionQuality * 100}
            onChange={(value) => onQualityChange(value / 100)}
            style={{ width: '200px' }}
          />
          <span>{Math.round(compressionQuality * 100)}%</span>
        </Flex>
        <Flex wrap={'wrap'} gap={16} justify={'center'}>
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
          <Button
            type={'primary'}
            onClick={onCompress}
            disabled={images.length === 0 || isCompressing}
            loading={isCompressing}
          >
            Compress Images
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};
