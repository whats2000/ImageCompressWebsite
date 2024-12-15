import React, { useState } from 'react';
import { Button, Input, Select, Space } from 'antd';
import styled from 'styled-components';
import { ProcessedImage } from '../../types';
import WatermarkEditor, { WatermarkConfig } from './WatermarkEditor';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

const InputGroup = styled(Space)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ButtonGroup = styled(Space)`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

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

    // 使用預設位置配置
    const position = positionMap[watermarkPosition as keyof typeof positionMap];

    // 使用上次的配置，但更新文字和位置
    const quickConfig = {
      ...lastWatermarkConfig,
      text: watermarkText,
      position: position,
    };

    onAddWatermark(watermarkText, watermarkPosition, quickConfig);
  };

  const handleWatermarkTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newText = e.target.value;
    setWatermarkText(newText);
    setLastWatermarkConfig((prev) => ({ ...prev, text: newText }));
  };

  return (
    <Container>
      <InputGroup>
        <Input
          type='text'
          id='watermarkText'
          style={{ width: 200 }}
          value={watermarkText}
          onChange={handleWatermarkTextChange}
          placeholder='Enter watermark text'
        />
        <Select
          id='watermarkPosition'
          style={{ width: 120 }}
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
      </InputGroup>

      <ButtonGroup>
        <Button
          type='primary'
          onClick={handleQuickAdd}
          disabled={images.length === 0 || !watermarkText || isWatermarking}
          loading={isWatermarking}
        >
          Quick Add
        </Button>
        <Button
          onClick={handleAdvancedEdit}
          disabled={images.length === 0 || !watermarkText || isWatermarking}
        >
          Advanced Edit
        </Button>
      </ButtonGroup>

      <WatermarkEditor
        visible={editorVisible}
        onClose={handleEditorClose}
        onApply={handleEditorApply}
        selectedImage={images.length > 0 ? images[0] : null}
        initialText={watermarkText}
        initialConfig={lastWatermarkConfig}
      />
    </Container>
  );
};

export default WatermarkControls;
