import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer<{ $isVisible: boolean }>`
  position: fixed;
  bottom: ${(props) => (props.$isVisible ? '0' : '-100px')};
  left: 0;
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  padding: 1rem 0;
  transition: bottom 0.3s ease;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FooterLinks = styled.div`
  a {
    color: white;
    text-decoration: none;
    margin-left: 2rem;
  }

  // Hide when window is small
  @media (max-width: 768px) {
    display: none;
  }
`;

export const Footer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.scrollY;

      // Show footer when near bottom (within 100px)
      if (windowHeight + scrollPosition >= documentHeight - 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer $isVisible={isVisible}>
      <FooterContent>
        <p>&copy; {currentYear} Image Compress. All rights reserved.</p>
        <FooterLinks>
          <a href='#'>Privacy</a>
          <a href='#'>Terms</a>
          <a href='#'>Contact</a>
        </FooterLinks>
      </FooterContent>
    </FooterContainer>
  );
};
