import React, { useState } from 'react';

import { ProcessedImage } from '../../types';
import { Button, Flex, Input, Select, Space, Typography } from 'antd';

interface WatermarkControlsProps {
  images: ProcessedImage[];
  onAddWatermark: (text: string, position: string) => void;
  isWatermarking: boolean;
}

export const WatermarkControls: React.FC<WatermarkControlsProps> = ({
  images,
  onAddWatermark,
  isWatermarking,
}) => {
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');

  const handleAddWatermark = () => {
    if (!watermarkText) {
      alert('Please enter watermark text');
      return;
    }
    onAddWatermark(watermarkText, watermarkPosition);
  };

  return (
    <Flex align={'center'} gap={10} justify={'center'} wrap={'wrap'}>
      <Space wrap={true}>
        <Typography.Text>Watermark Text:</Typography.Text>
        <Input
          type='text'
          id='watermarkText'
          value={watermarkText}
          onChange={(e) => setWatermarkText(e.target.value)}
          placeholder='Enter watermark text'
        />
      </Space>
      <Space wrap={true}>
        <Typography.Text>Position:</Typography.Text>
        <Select
          options={[
            { value: 'top-left', label: 'Top Left' },
            { value: 'top-right', label: 'Top Right' },
            { value: 'bottom-left', label: 'Bottom Left' },
            { value: 'bottom-right', label: 'Bottom Right' },
            { value: 'center', label: 'Center' },
          ]}
          id='watermarkPosition'
          value={watermarkPosition}
          onSelect={(value) => setWatermarkPosition(value)}
        />
      </Space>

      <Button
        type={'primary'}
        onClick={handleAddWatermark}
        disabled={images.length === 0 || !watermarkText || isWatermarking}
        loading={isWatermarking}
      >
        Add Watermark
      </Button>
    </Flex>
  );
};
