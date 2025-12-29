import React from 'react';
import styled from 'styled-components';
import { Card, Col, Row, Typography } from 'antd';
import {
  CloudDownloadOutlined,
  CompressOutlined,
  FileImageOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const AboutContainer = styled.main`
  max-width: 1200px;
  min-height: 100vh;
  margin: 2rem auto;
  padding: 2rem 1rem;
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 0;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SectionTitle = styled(Title)`
  text-align: center;
  margin-bottom: 2rem !important;
  margin-top: 3rem !important;
`;

const FeatureCard = styled(Card)`
  height: 100%;
  text-align: center;
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }

  .anticon {
    font-size: 3rem;
    color: #4a90e2;
    margin-bottom: 1rem;
  }
`;

const TechStack = styled.div`
  margin-top: 2rem;
`;

const TechBadge = styled.span`
  display: inline-block;
  background-color: #4a90e2;
  color: white;
  padding: 0.5rem 1rem;
  margin: 0.5rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
`;

const InfoSection = styled.div`
  background-color: #f5f7fa;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 2rem;
`;

export const About: React.FC = () => {
  const features = [
    {
      icon: <CompressOutlined />,
      title: 'Smart Compression',
      description:
        'Advanced algorithms to compress images while maintaining visual quality. Support for WebP and JPEG formats with customizable quality settings.',
    },
    {
      icon: <FileImageOutlined />,
      title: 'Watermark Support',
      description:
        'Add custom watermarks to your images with adjustable position, opacity, rotation, and color. Perfect for protecting your content.',
    },
    {
      icon: <ToolOutlined />,
      title: 'Image Operations',
      description:
        'Perform basic image operations like rotation, flipping, and adjustments. All processing happens in real-time.',
    },
    {
      icon: <ThunderboltOutlined />,
      title: 'Fast Processing',
      description:
        'Lightning-fast image processing powered by Python backend. Process multiple images simultaneously with batch operations.',
    },
    {
      icon: <CloudDownloadOutlined />,
      title: 'Easy Download',
      description:
        'Download processed images instantly. Choose between original, compressed, or watermarked versions with a single click.',
    },
    {
      icon: <SafetyOutlined />,
      title: 'Privacy First',
      description:
        'Your images are processed securely and temporarily stored. Automatic cleanup ensures your data is protected.',
    },
  ];

  return (
    <AboutContainer>
      <HeroSection>
        <HeroTitle>About Image Compress</HeroTitle>
        <HeroSubtitle>
          Your go-to solution for professional image compression and processing
        </HeroSubtitle>
      </HeroSection>

      <Typography>
        <SectionTitle level={2}>What We Do</SectionTitle>
        <Paragraph style={{ fontSize: '1.1rem', textAlign: 'center' }}>
          Image Compress is a powerful web-based tool designed to help you
          optimize your images effortlessly. Whether you're a photographer,
          web developer, or content creator, our platform provides
          professional-grade image processing capabilities right in your
          browser.
        </Paragraph>
        <Paragraph style={{ fontSize: '1.1rem', textAlign: 'center' }}>
          With support for multiple formats, batch processing, and advanced
          features like watermarking, we make it easy to prepare your images
          for any purpose - from web publishing to social media sharing.
        </Paragraph>
      </Typography>

      <SectionTitle level={2}>Key Features</SectionTitle>
      <Row gutter={[24, 24]}>
        {features.map((feature, index) => (
          <Col key={index} xs={24} sm={12} md={8}>
            <FeatureCard>
              {feature.icon}
              <Card.Meta
                title={feature.title}
                description={feature.description}
              />
            </FeatureCard>
          </Col>
        ))}
      </Row>

      <InfoSection>
        <SectionTitle level={2}>Technology Stack</SectionTitle>
        <Typography>
          <Paragraph style={{ fontSize: '1.1rem', textAlign: 'center' }}>
            Built with modern technologies to deliver the best performance and
            user experience:
          </Paragraph>
        </Typography>
        <TechStack style={{ textAlign: 'center' }}>
          <TechBadge>React</TechBadge>
          <TechBadge>TypeScript</TechBadge>
          <TechBadge>Python Flask</TechBadge>
          <TechBadge>Ant Design</TechBadge>
          <TechBadge>Styled Components</TechBadge>
          <TechBadge>Pillow (PIL)</TechBadge>
          <TechBadge>Axios</TechBadge>
          <TechBadge>Vite</TechBadge>
        </TechStack>
      </InfoSection>

      <InfoSection>
        <SectionTitle level={2}>How It Works</SectionTitle>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card style={{ height: '100%' }}>
              <Title level={4}>1. Upload</Title>
              <Paragraph>
                Select and upload your images from your device. We support
                common image formats including JPEG, PNG, and more.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={{ height: '100%' }}>
              <Title level={4}>2. Process</Title>
              <Paragraph>
                Choose your desired compression quality, add watermarks, or
                apply basic image operations. All processing happens instantly.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={{ height: '100%' }}>
              <Title level={4}>3. Download</Title>
              <Paragraph>
                Download your optimized images individually or in batch. Your
                images are ready for immediate use.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </InfoSection>

      <InfoSection>
        <SectionTitle level={2}>Use Cases</SectionTitle>
        <Typography>
          <Paragraph style={{ fontSize: '1.1rem' }}>
            <strong>Web Developers:</strong> Optimize images for faster page
            load times and better SEO performance.
          </Paragraph>
          <Paragraph style={{ fontSize: '1.1rem' }}>
            <strong>Photographers:</strong> Add watermarks to protect your work
            and compress images for online galleries.
          </Paragraph>
          <Paragraph style={{ fontSize: '1.1rem' }}>
            <strong>Content Creators:</strong> Prepare images for social media,
            blogs, and other platforms with optimal file sizes.
          </Paragraph>
          <Paragraph style={{ fontSize: '1.1rem' }}>
            <strong>Businesses:</strong> Batch process product images,
            marketing materials, and website assets efficiently.
          </Paragraph>
        </Typography>
      </InfoSection>

      <InfoSection>
        <SectionTitle level={2}>Open Source</SectionTitle>
        <Typography>
          <Paragraph
            style={{ fontSize: '1.1rem', textAlign: 'center' }}
          >
            This project is open source and available on GitHub. We welcome
            contributions, bug reports, and feature requests from the community.
          </Paragraph>
          <Paragraph
            style={{ fontSize: '1.1rem', textAlign: 'center' }}
          >
            Built with ❤️ for the community by developers who care about
            performance, usability, and privacy.
          </Paragraph>
        </Typography>
      </InfoSection>
    </AboutContainer>
  );
};
