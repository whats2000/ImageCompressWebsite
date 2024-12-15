import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Input, ColorPicker, Slider, Button, Typography } from 'antd';
import styled from 'styled-components';
import { ProcessedImage } from '../../types';

interface WatermarkEditorProps {
  visible: boolean;
  onClose: () => void;
  onApply: (watermarkConfig: WatermarkConfig) => void;
  selectedImage: ProcessedImage | null;
  initialText?: string;
  initialConfig?: WatermarkConfig;
}

export interface WatermarkConfig {
  text: string;
  position: { x: number; y: number };
  color: string;
  rotation: number;
  opacity: number;
  naturalSize?: {
    width: number;
    height: number;
  };
  previewSize?: {
    width: number;
    height: number;
  };
}

const EditorContainer = styled.div`
  display: flex;
  gap: 20px;
  height: 70vh;
`;

const PreviewContainer = styled.div`
  flex: 2;
  position: relative;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: auto;
  background: #f0f0f0;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const ImageWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const PreviewImage = styled.img`
  display: block;
  max-width: 100%;
  height: auto;
`;

const DraggableWatermark = styled.div<{ $isDragging: boolean }>`
  position: absolute;
  cursor: move;
  user-select: none;
  transform-origin: center;
  background: ${({ $isDragging }) => ($isDragging ? 'rgba(0,0,0,0.1)' : 'transparent')};
  padding: 4px;
  white-space: nowrap;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  pointer-events: all;
  font-size: 36px;
`;

const ControlsPanel = styled.div`
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-left: 1px solid #d9d9d9;
  overflow-y: auto;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const WatermarkEditor: React.FC<WatermarkEditorProps> = ({
  visible,
  onClose,
  onApply,
  selectedImage,
  initialText = '',
  initialConfig = {
    text: '',
    position: { x: 50, y: 50 },
    color: '#ffffff',
    rotation: 0,
    opacity: 0.8,
  },
}) => {
  const [config, setConfig] = useState<WatermarkConfig>(initialConfig);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      text: initialText || prev.text,
    }));
  }, [initialText]);

  // 当图片加载完成时记录其原始尺寸
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight, width, height } = imageRef.current;
      setNaturalSize({ width: naturalWidth, height: naturalHeight });
      setConfig(prev => ({
        ...prev,
        naturalSize: { width: naturalWidth, height: naturalHeight },
        previewSize: { width, height }
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    
    setIsDragging(true);
    const rect = imageRef.current.getBoundingClientRect();
    
    // 計算點擊位置相對於圖片的百分比
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setConfig(prev => ({
      ...prev,
      position: {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      },
    }));
    
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    
    // 使用圖片的實際顯示尺寸計算位置
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setConfig(prev => ({
      ...prev,
      position: {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      },
    }));
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', () => setIsDragging(false));
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', () => setIsDragging(false));
      };
    }
  }, [isDragging, handleMouseMove]);

  return (
    <Modal
      title="Watermark Editor"
      open={visible}
      onCancel={onClose}
      width="90vw"
      centered
      bodyStyle={{ padding: '16px' }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="apply"
          type="primary"
          onClick={() => {
            onApply(config);
          }}
        >
          Apply
        </Button>,
      ]}
    >
      <EditorContainer>
        <PreviewContainer>
          {selectedImage?.previewUrl && (
            <ImageWrapper>
              <PreviewImage
                ref={imageRef}
                src={selectedImage.previewUrl}
                alt="Preview"
                onLoad={handleImageLoad}
                onError={(e) => {
                  console.error('Image load error:', e);
                  console.log('Attempted URL:', selectedImage.previewUrl);
                }}
              />
              {visible && (
                <DraggableWatermark
                  onMouseDown={handleMouseDown}
                  style={{
                    position: 'absolute',
                    left: `${config.position.x}%`,
                    top: `${config.position.y}%`,
                    color: config.color,
                    opacity: config.opacity,
                    transform: `translate(-50%, -50%) rotate(${config.rotation}deg)`,
                  }}
                  $isDragging={isDragging}
                >
                  {config.text || 'Watermark Text'}
                </DraggableWatermark>
              )}
            </ImageWrapper>
          )}
        </PreviewContainer>

        <ControlsPanel>
          <ControlGroup>
            <Label>Watermark Text</Label>
            <Input
              value={config.text}
              onChange={e => setConfig(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Enter watermark text"
            />
          </ControlGroup>

          <ControlGroup>
            <Label>Position X ({Math.round(config.position.x)}%)</Label>
            <Slider
              min={0}
              max={100}
              value={config.position.x}
              onChange={value => setConfig(prev => ({
                ...prev,
                position: { ...prev.position, x: value }
              }))}
            />
          </ControlGroup>

          <ControlGroup>
            <Label>Position Y ({Math.round(config.position.y)}%)</Label>
            <Slider
              min={0}
              max={100}
              value={config.position.y}
              onChange={value => setConfig(prev => ({
                ...prev,
                position: { ...prev.position, y: value }
              }))}
            />
          </ControlGroup>

          <ControlGroup>
            <Label>Color</Label>
            <ColorPicker
              value={config.color}
              onChange={(color) => setConfig(prev => ({ ...prev, color: color.toHexString() }))}
            />
          </ControlGroup>

          <ControlGroup>
            <Label>Rotation ({config.rotation}°)</Label>
            <Slider
              min={-180}
              max={180}
              value={config.rotation}
              onChange={value => setConfig(prev => ({ ...prev, rotation: value }))}
            />
          </ControlGroup>

          <ControlGroup>
            <Label>Opacity ({Math.round(config.opacity * 100)}%)</Label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={config.opacity}
              onChange={value => setConfig(prev => ({ ...prev, opacity: value }))}
            />
          </ControlGroup>

          {naturalSize && (
            <ControlGroup>
              <Typography.Text type="secondary">
                Original Size: {naturalSize.width}x{naturalSize.height}px
              </Typography.Text>
              <Typography.Text type="secondary">
                Position: {Math.round(config.position.x)}%, {Math.round(config.position.y)}%
              </Typography.Text>
            </ControlGroup>
          )}
        </ControlsPanel>
      </EditorContainer>
    </Modal>
  );
};

export default WatermarkEditor;