import React, { useState } from 'react';
import {
  Card,
  Button,
  Select,
  Flex,
  InputNumber,
  Radio,
  Typography,
} from 'antd';

import { ImageOperations, ProcessedImage } from '../../types';
import { useNotification } from '../../hooks/useNotification.ts';

interface BasicOperationControlsProps {
  images: ProcessedImage[];
  onApplyOperation: (operations: ImageOperations) => void;
}

export const BasicOperationControls: React.FC<BasicOperationControlsProps> = ({
  images,
  onApplyOperation,
}) => {
  const notify = useNotification();
  const [operation, setOperation] = useState<
    'resize' | 'rotate' | 'crop' | 'flip' | 'grayscale'
  >('flip');
  const [resizeWidth, setResizeWidth] = useState<number | null>(null);
  const [resizeHeight, setResizeHeight] = useState<number | null>(null);
  const [rotateAngle, setRotateAngle] = useState<number | null>(null);
  const [cropLeft, setCropLeft] = useState<number | null>(null);
  const [cropTop, setCropTop] = useState<number | null>(null);
  const [cropRight, setCropRight] = useState<number | null>(null);
  const [cropBottom, setCropBottom] = useState<number | null>(null);
  const [flipDirection, setFlipDirection] = useState<'horizontal' | 'vertical'>(
    'horizontal',
  );

  const handleOperationChange = (
    value: 'resize' | 'rotate' | 'crop' | 'flip' | 'grayscale',
  ) => {
    setOperation(value);
  };

  const handleApplyOperationClick = () => {
    if (images.length === 0) {
      notify.warn('No images available for operation');
      return;
    }
    if (!operation) {
      notify.warn('Please select an operation');
      return;
    }

    let operations: ImageOperations = {};

    switch (operation) {
      case 'resize':
        if (resizeWidth && resizeHeight) {
          operations = { resize: { width: resizeWidth, height: resizeHeight } };
        } else {
          notify.warn('Please enter width and height for resize operation');
          return;
        }
        break;
      case 'rotate':
        if (rotateAngle) {
          operations = { rotate: { angle: rotateAngle } };
        } else {
          notify.warn('Please enter angle for rotate operation');
          return;
        }
        break;
      case 'crop':
        if (cropLeft && cropTop && cropRight && cropBottom) {
          operations = {
            crop: {
              left: cropLeft,
              top: cropTop,
              right: cropRight,
              bottom: cropBottom,
            },
          };
        } else {
          notify.warn(
            'Please enter left, top, right and bottom values for crop operation',
          );
          return;
        }
        break;
      case 'flip':
        if (flipDirection) {
          operations = { flip: { direction: flipDirection } };
        } else {
          notify.warn('Please select a direction for flip operation');
          return;
        }
        break;
      case 'grayscale':
        operations = { grayscale: {} };
        break;
      default:
        break;
    }
    onApplyOperation(operations);
  };

  return (
    <Card title='Basic Operation Configuration' style={{ height: '100%' }}>
      <Flex
        justify='center'
        align='center'
        gap={10}
        wrap='wrap'
        vertical={true}
      >
        <Typography.Text>Select operation:</Typography.Text>
        <Radio.Group
          value={operation}
          onChange={(e) => handleOperationChange(e.target.value)}
          buttonStyle='solid'
        >
          <Radio.Button value='resize'>Resize</Radio.Button>
          <Radio.Button value='rotate'>Rotate</Radio.Button>
          <Radio.Button value='crop'>Crop</Radio.Button>
          <Radio.Button value='flip'>Flip</Radio.Button>
          <Radio.Button value='grayscale'>Grayscale</Radio.Button>
        </Radio.Group>
        {operation !== 'grayscale' && (
          <Typography.Text>
            {operation.charAt(0).toUpperCase() + operation.slice(1)}{' '}
            Configuration:
          </Typography.Text>
        )}
        {operation === 'resize' && (
          <Flex gap={8}>
            <InputNumber
              placeholder='Width'
              value={resizeWidth}
              onChange={(value) => setResizeWidth(value)}
              style={{ width: 90 }}
            />
            <InputNumber
              placeholder='Height'
              value={resizeHeight}
              onChange={(value) => setResizeHeight(value)}
              style={{ width: 90 }}
            />
          </Flex>
        )}
        {operation === 'rotate' && (
          <InputNumber
            placeholder='Angle'
            value={rotateAngle}
            onChange={(value) => setRotateAngle(value)}
            style={{ width: 200 }}
          />
        )}
        {operation === 'crop' && (
          <Flex gap={8}>
            <InputNumber
              placeholder='Left'
              value={cropLeft}
              onChange={(value) => setCropLeft(value)}
              style={{ width: 100 }}
            />
            <InputNumber
              placeholder='Top'
              value={cropTop}
              onChange={(value) => setCropTop(value)}
              style={{ width: 100 }}
            />
            <InputNumber
              placeholder='Right'
              value={cropRight}
              onChange={(value) => setCropRight(value)}
              style={{ width: 100 }}
            />
            <InputNumber
              placeholder='Bottom'
              value={cropBottom}
              onChange={(value) => setCropBottom(value)}
              style={{ width: 100 }}
            />
          </Flex>
        )}
        {operation === 'flip' && (
          <Select
            placeholder='Select Direction'
            value={flipDirection}
            onChange={(value) => setFlipDirection(value)}
            style={{ width: 200 }}
            options={[
              { value: 'horizontal', label: 'Horizontal' },
              { value: 'vertical', label: 'Vertical' },
            ]}
          />
        )}
        <Button
          type='primary'
          onClick={handleApplyOperationClick}
          disabled={!operation}
        >
          Apply Operation
        </Button>
      </Flex>
    </Card>
  );
};
