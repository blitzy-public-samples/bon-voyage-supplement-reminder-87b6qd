import React from 'react';
import styled from 'styled-components';
import theme from '../../styles/theme';
import logo from '../../assets/images/logo.svg';

// Styled component for the main header container
const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.medium};
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

// Styled component for the logo container
const LogoContainer = styled.div`
  max-width: 150px;
  transition: transform ${({ theme }) => theme.transitions.short};

  &:hover {
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: auto;
  }
`;

// Main Header component
const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <LogoContainer>
        <img src={logo} alt="Supplement Reminder Logo" aria-label="Supplement Reminder Website Logo" />
      </LogoContainer>
    </HeaderContainer>
  );
};

export default Header;