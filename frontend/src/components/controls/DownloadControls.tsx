import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button, Card, Flex, Radio, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { ProcessedImage } from '../../types';
import { BACKEND_API_URL } from '../../styles/GlobalStyles';

const DownloadCard = styled(Card)`
  width: 100%;
  text-align: center;
`;

interface DownloadControlsProps {
  images: ProcessedImage[];
  lastOperation:
    | 'compressWithWebp'
    | 'compressWithJpeg'
    | 'watermark'
    | 'basicOperation'
    | null;
}

export const DownloadControls: React.FC<DownloadControlsProps> = ({
  images,
  lastOperation,
}) => {
  const [selectedDownloadType, setSelectedDownloadType] = useState<
    'compressed' | 'original' | 'watermarked' | 'basicOperation'
  >('original');
  const [compressionFormat, setCompressionFormat] = useState<'webp' | 'jpeg'>(
    'webp',
  );

  useEffect(() => {
    if (lastOperation === 'watermark') {
      setSelectedDownloadType('watermarked');
    } else if (lastOperation === 'compressWithJpeg') {
      setSelectedDownloadType('compressed');
      setCompressionFormat('jpeg');
    } else if (lastOperation === 'compressWithWebp') {
      setSelectedDownloadType('compressed');
      setCompressionFormat('webp');
    } else if (lastOperation === 'basicOperation') {
      setSelectedDownloadType('basicOperation');
    } else {
      setSelectedDownloadType('original');
    }
  }, [lastOperation]);

  const handleDownload = async () => {
    if (images.length === 0) {
      toast.warn('No images available for download');
      return;
    }

    try {
      const downloadPromises = images.map(async (image) => {
        // Determine download type based on selection
        let downloadType: string;
        switch (selectedDownloadType) {
          case 'compressed':
            downloadType = compressionFormat;
            break;
          case 'watermarked':
            downloadType = 'watermarked';
            break;
          case 'basicOperation':
            downloadType = 'basicOperation';
            break;
          case 'original':
          default:
            downloadType = 'original';
        }

        // Make GET request to download endpoint
        const response = await axios.get(
          `${BACKEND_API_URL}/api/download/${image.imageId}`,
          {
            params: { type: downloadType },
            responseType: 'blob',
          },
        );

        // Create and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Set filename based on download type
        const extension =
          downloadType === 'original'
            ? image.fileName.split('.').pop()
            : downloadType === 'watermarked'
              ? 'watermarked.png'
              : `${downloadType}.png`;
        const filename = `${image.fileName.split('.')[0]}_${downloadType}.${extension}`;
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return filename;
      });

      const downloadedFiles = await Promise.all(downloadPromises);
      toast.success(`Downloaded ${downloadedFiles.length} image(s)`);
    } catch (error) {
      toast.error('Error downloading images');
      console.error(error);
    }
  };

  const getDownloadButtonText = () => {
    const count = images.length;
    const type =
      selectedDownloadType.charAt(0).toUpperCase() +
      selectedDownloadType.slice(1);
    return `Download ${type} ${count === 1 ? 'Image' : `${count} Images`}`;
  };

  return (
    <DownloadCard title='Download Images'>
      <Flex
        justify={'center'}
        align={'center'}
        gap={10}
        wrap={'wrap'}
        vertical={true}
      >
        <Typography.Text>Select download format:</Typography.Text>

        <Flex
          wrap={'wrap'}
          gap={16}
          align={'center'}
          justify={'center'}
          vertical={true}
        >
          <Radio.Group
            value={selectedDownloadType}
            onChange={(e) => setSelectedDownloadType(e.target.value)}
            buttonStyle='solid'
          >
            <Radio.Button value='original'>Original</Radio.Button>
            <Radio.Button value='compressed'>Compressed</Radio.Button>
            <Radio.Button value='watermarked'>Watermarked</Radio.Button>
            <Radio.Button value='basicOperation'>Basic Operation</Radio.Button>
          </Radio.Group>
        </Flex>

        {selectedDownloadType === 'compressed' && (
          <Flex
            wrap={'wrap'}
            gap={16}
            align={'center'}
            justify={'center'}
            vertical={true}
          >
            <Typography.Text>Compression format:</Typography.Text>
            <Radio.Group
              value={compressionFormat}
              onChange={(e) => setCompressionFormat(e.target.value)}
              buttonStyle='solid'
            >
              <Radio.Button value='webp'>WebP</Radio.Button>
              <Radio.Button value='jpeg'>JPEG</Radio.Button>
            </Radio.Group>
          </Flex>
        )}

        <Button
          type='primary'
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          disabled={images.length === 0}
        >
          {getDownloadButtonText()}
        </Button>
      </Flex>
    </DownloadCard>
  );
};
