import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Header from './Header';
import theme from '../../styles/theme';

// Mock the logo SVG import
jest.mock('../../assets/images/logo.svg', () => 'mocked-logo.svg');

// Helper function to render components with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('Header component', () => {
  test('renders without crashing', () => {
    renderWithTheme(<Header />);
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
  });

  test('displays the logo', () => {
    renderWithTheme(<Header />);
    const logoImage = screen.getByRole('img', { name: /Supplement Reminder Website Logo/i });
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', 'mocked-logo.svg');
    expect(logoImage).toHaveAttribute('alt', 'Supplement Reminder Logo');
  });

  test('applies correct styles', () => {
    renderWithTheme(<Header />);
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toHaveStyle(`
      background-color: ${theme.colors.primary};
      padding: ${theme.spacing.medium};
    `);
  });

  test('logo container is responsive', () => {
    const { container } = renderWithTheme(<Header />);
    const logoContainer = container.querySelector('div');
    expect(logoContainer).toHaveStyle('max-width: 150px');
  });

  test('logo container has hover effect', () => {
    const { container } = renderWithTheme(<Header />);
    const logoContainer = container.querySelector('div');
    expect(logoContainer).toHaveStyle(`transition: transform ${theme.transitions.short}`);
  });
});