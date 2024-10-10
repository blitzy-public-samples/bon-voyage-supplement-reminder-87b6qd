import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import theme from '../../styles/theme';
import GlobalStyles from '../../styles/global';

// Styled components
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.large};
  background-color: ${({ theme }) => theme.colors.background};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.medium};
  }
`;

// Layout component
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component that wraps the entire application.
 * It provides a consistent structure with header, main content, and footer.
 * 
 * @param {LayoutProps} props - The component props
 * @param {React.ReactNode} props.children - The child components to be rendered in the main content area
 * 
 * Requirements addressed:
 * - Consistent Layout (Technical Requirements/User Interface Design)
 * - Responsive Design (Technical Requirements/User Interface Design)
 * - Accessibility (Technical Requirements/User Interface Design)
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <LayoutContainer>
        <Header />
        <MainContent>{children}</MainContent>
        <Footer />
      </LayoutContainer>
    </ThemeProvider>
  );
};

export default Layout;