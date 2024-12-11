import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

import { ProcessedImage } from '../../types';
import { BACKEND_API_URL } from '../../styles/GlobalStyles';
import { Dropdown, Flex, Select, Space, Typography } from 'antd';

interface DownloadControlsProps {
  images: ProcessedImage[];
}

export const DownloadControls: React.FC<DownloadControlsProps> = ({
  images,
}) => {
  const [selectedDownloadType, setSelectedDownloadType] = useState<
    'compressed' | 'original' | 'watermarked'
  >('compressed');
  const [compressionFormat, setCompressionFormat] = useState<'webp' | 'jpeg'>(
    'webp',
  );

  const handleDownload = async () => {
    if (images.length === 0) {
      toast.warn('No images available for download');
      return;
    }

    try {
      const downloadPromises = images.map(async (image) => {
        // Determine a download type based on backend's expectations
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

        // Create a download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Determine filename based on a download type
        const extension =
          downloadType === 'original'
            ? image.fileName.split('.').pop()
            : downloadType === 'watermarked'
              ? 'watermarked'
              : downloadType;
        link.download = `${image.fileName.split('.')[0]}_${downloadType}.${extension}`;

        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });

      await Promise.all(downloadPromises);
      toast.success('Downloads initiated');
    } catch (error) {
      toast.error('Error downloading images');
      console.error(error);
    }
  };

  return (
    <Flex align={'center'} justify={'center'} gap={10}>
      <Space>
        <Space>
          <Typography.Text>Compression Format:</Typography.Text>
          <Select
            id='compressionFormat'
            value={compressionFormat}
            options={[
              { value: 'webp', label: 'WebP' },
              { value: 'jpeg', label: 'JPEG' },
            ]}
            onSelect={setCompressionFormat}
            disabled={selectedDownloadType !== 'compressed'}
          />
        </Space>

        <Dropdown.Button
          menu={{
            items: [
              {
                key: 'compressed',
                label: 'Compressed',
                onClick: () => setSelectedDownloadType('compressed'),
              },
              {
                key: 'original',
                label: 'Original',
                onClick: () => setSelectedDownloadType('original'),
              },
              {
                key: 'watermarked',
                label: 'Watermarked',
                onClick: () => setSelectedDownloadType('watermarked'),
              },
            ],
          }}
          type={'primary'}
          onClick={handleDownload}
        >
          Download {selectedDownloadType} Images
        </Dropdown.Button>
      </Space>
    </Flex>
  );
};
