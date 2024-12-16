import React, { useState } from 'react';
import { Button, Card, Flex, Input, Select, Space } from 'antd';

import { ProcessedImage } from '../../types';
import WatermarkEditor, { WatermarkConfig } from './WatermarkEditor';

interface WatermarkControlsProps {
  onAddWatermark: (
    text: string,
    position: string,
    config?: Partial<WatermarkConfig>,
  ) => void;
  images: ProcessedImage[];
  isWatermarking: boolean;
}

// Default watermark configuration
const defaultWatermarkConfig: WatermarkConfig = {
  text: '',
  position: { x: 50, y: 50 },
  color: '#ffffff',
  rotation: 0,
  opacity: 0.8,
};

const positionMap = {
  'top-left': { x: 5, y: 5 },
  'top-right': { x: 95, y: 5 },
  'bottom-left': { x: 5, y: 95 },
  'bottom-right': { x: 95, y: 95 },
  center: { x: 50, y: 50 },
};

const WatermarkControls: React.FC<WatermarkControlsProps> = ({
  onAddWatermark,
  images,
  isWatermarking,
}) => {
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [editorVisible, setEditorVisible] = useState(false);
  const [lastWatermarkConfig, setLastWatermarkConfig] =
    useState<WatermarkConfig>(defaultWatermarkConfig);

  const handleAdvancedEdit = () => {
    if (!watermarkText) {
      alert('Please enter watermark text first');
      return;
    }
    setEditorVisible(true);
  };

  const handleEditorClose = () => {
    setEditorVisible(false);
  };

  const handleEditorApply = (config: WatermarkConfig) => {
    setLastWatermarkConfig(config); // Save the last configuration
    onAddWatermark(config.text, watermarkPosition, config);
    setEditorVisible(false);
  };

  const handleQuickAdd = () => {
    if (!watermarkText) {
      alert('Please enter watermark text');
      return;
    }

    // Use the selected position
    const position = positionMap[watermarkPosition as keyof typeof positionMap];

    // Use the last watermark configuration
    const quickConfig = {
      ...lastWatermarkConfig,
      text: watermarkText,
      position: position,
    };

    onAddWatermark(watermarkText, watermarkPosition, quickConfig);
  };

  const handleWatermarkTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newText = e.target.value;
    setWatermarkText(newText);
    setLastWatermarkConfig((prev) => ({ ...prev, text: newText }));
  };

  return (
    <Card title={'Watermark Configuration'} style={{ height: '100%' }}>
      <Flex
        wrap={'wrap'}
        align={'center'}
        justify={'center'}
        vertical={true}
        gap={16}
      >
        <Space direction={'vertical'} style={{ width: '100%' }}>
          <Input.TextArea
            id='watermarkText'
            style={{ width: 200 }}
            value={watermarkText}
            onChange={handleWatermarkTextChange}
            placeholder='Enter watermark text'
          />
          <Select
            id='watermarkPosition'
            style={{ width: 200 }}
            options={[
              { value: 'top-left', label: 'Top Left' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'bottom-right', label: 'Bottom Right' },
              { value: 'center', label: 'Center' },
            ]}
            value={watermarkPosition}
            onSelect={(value: string) => setWatermarkPosition(value)}
          />
        </Space>

        <Flex wrap={'wrap'} gap={16} justify={'center'}>
          <Button
            type='primary'
            onClick={handleQuickAdd}
            disabled={images.length === 0 || !watermarkText || isWatermarking}
            loading={isWatermarking}
            style={{ width: 200 }}
          >
            Quick Add
          </Button>
          <Button
            onClick={handleAdvancedEdit}
            disabled={images.length === 0 || !watermarkText || isWatermarking}
            style={{ width: 200 }}
          >
            Advanced Edit
          </Button>
        </Flex>

        <WatermarkEditor
          visible={editorVisible}
          onClose={handleEditorClose}
          onApply={handleEditorApply}
          selectedImage={images.length > 0 ? images[0] : null}
          initialText={watermarkText}
          initialConfig={lastWatermarkConfig}
        />
      </Flex>
    </Card>
  );
};

export default WatermarkControls;
