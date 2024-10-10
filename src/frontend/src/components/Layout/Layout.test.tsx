import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Layout from './Layout';
import theme from '../../styles/theme';

// Mock child components
jest.mock('../Header/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-header">Header</div>,
}));

jest.mock('../Footer/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-footer">Footer</div>,
}));

const testContent = 'Test Content';

describe('Layout component', () => {
  it('renders Header, content, and Footer', () => {
    render(
      <ThemeProvider theme={theme}>
        <Layout>{testContent}</Layout>
      </ThemeProvider>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText(testContent)).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });

  it('applies correct styles based on the theme', () => {
    render(
      <ThemeProvider theme={theme}>
        <Layout>{testContent}</Layout>
      </ThemeProvider>
    );

    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveStyle(`background-color: ${theme.colors.background}`);
    expect(mainContent).toHaveStyle(`padding: ${theme.spacing.large}`);
  });

  it('applies mobile styles when viewport is narrow', () => {
    // Mock the window.matchMedia function to simulate a mobile viewport
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === `(max-width: ${theme.breakpoints.mobile})`,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    render(
      <ThemeProvider theme={theme}>
        <Layout>{testContent}</Layout>
      </ThemeProvider>
    );

    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveStyle(`padding: ${theme.spacing.medium}`);
  });

  it('renders GlobalStyles', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <Layout>{testContent}</Layout>
      </ThemeProvider>
    );

    // Check if the global styles are applied to the body
    expect(document.body).toHaveStyle('margin: 0');
    expect(document.body).toHaveStyle('padding: 0');
    expect(document.body).toHaveStyle(`font-family: ${theme.fonts.primary}`);
  });

  it('renders LayoutContainer with correct styles', () => {
    render(
      <ThemeProvider theme={theme}>
        <Layout>{testContent}</Layout>
      </ThemeProvider>
    );

    const layoutContainer = screen.getByTestId('layout-container');
    expect(layoutContainer).toHaveStyle('display: flex');
    expect(layoutContainer).toHaveStyle('flex-direction: column');
    expect(layoutContainer).toHaveStyle('min-height: 100vh');
  });
});