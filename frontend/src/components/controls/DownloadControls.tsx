import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ProcessedImage } from '../../types';
import { BACKEND_API_URL } from '../../styles/GlobalStyles';
import { Button, Card, Radio, Space, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const DownloadCard = styled(Card)`
  width: 100%;
  text-align: center;
`;

const DownloadOptions = styled(Space)`
  margin-bottom: 16px;
`;

interface DownloadControlsProps {
  images: ProcessedImage[];
  lastOperation: 'compressWithWebp' | 'compressWithJpeg' | 'watermark' | null;
}

export const DownloadControls: React.FC<DownloadControlsProps> = ({
  images,
  lastOperation,
}) => {
  const [selectedDownloadType, setSelectedDownloadType] = useState<
    'compressed' | 'original' | 'watermarked'
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
              : `${downloadType}`;
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
    const type = selectedDownloadType.charAt(0).toUpperCase() + selectedDownloadType.slice(1);
    return `Download ${type} ${count === 1 ? 'Image' : `${count} Images`}`;
  };

  return (
    <DownloadCard title="Download Images">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Text>Select download format:</Typography.Text>
        
        <DownloadOptions>
          <Radio.Group 
            value={selectedDownloadType}
            onChange={(e) => setSelectedDownloadType(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="original">Original</Radio.Button>
            <Radio.Button value="compressed">Compressed</Radio.Button>
            <Radio.Button value="watermarked">Watermarked</Radio.Button>
          </Radio.Group>
        </DownloadOptions>

        {selectedDownloadType === 'compressed' && (
          <DownloadOptions>
            <Typography.Text>Compression format:</Typography.Text>
            <Radio.Group 
              value={compressionFormat}
              onChange={(e) => setCompressionFormat(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="webp">WebP</Radio.Button>
              <Radio.Button value="jpeg">JPEG</Radio.Button>
            </Radio.Group>
          </DownloadOptions>
        )}

        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          disabled={images.length === 0}
          size="large"
        >
          {getDownloadButtonText()}
        </Button>
      </Space>
    </DownloadCard>
  );
};