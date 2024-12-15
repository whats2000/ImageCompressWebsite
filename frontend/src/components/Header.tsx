import React, { useState } from 'react';
import styled from 'styled-components';
import logoImg from '../assets/logo.png';

const NavBar = styled.header`
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem;
`;

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Logo = styled.img`
  height: 60px;
  width: auto;
  object-fit: contain;
`;

const BrandText = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLink = styled.a`
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div<{ $isOpen: boolean }>`
  display: ${(props) => (props.$isOpen ? 'block' : 'none')};
  position: absolute;
  right: 0;
  background-color: white;
  min-width: 160px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-radius: 4px;
`;

const DropdownItem = styled.a`
  color: var(--text-color);
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--secondary-color);
  }
`;

export const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <NavBar>
      <NavContainer>
        <NavLeft>
          <Logo src={logoImg} alt='Logo' />
          <BrandText>IMAGE COMPRESS</BrandText>
        </NavLeft>
        <NavRight>
          <NavLink href='#'>IMAGE COMPRESS</NavLink>
          <Dropdown
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <NavLink href='#'>MORE ▼</NavLink>
            <DropdownContent $isOpen={isDropdownOpen}>
              <DropdownItem href='#'>About</DropdownItem>
              <DropdownItem href='#'>Contact Us</DropdownItem>
              <DropdownItem href='#'>Privacy</DropdownItem>
              <DropdownItem href='#'>Terms</DropdownItem>
            </DropdownContent>
          </Dropdown>
        </NavRight>
      </NavContainer>
    </NavBar>
  );
};
