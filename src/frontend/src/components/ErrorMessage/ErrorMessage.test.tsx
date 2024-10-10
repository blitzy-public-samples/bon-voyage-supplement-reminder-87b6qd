import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import ErrorMessage from './ErrorMessage';
import theme from '../../styles/theme';

/**
 * Helper function to render components with ThemeProvider
 * @param ui - React element to render
 * @returns RenderResult
 */
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('ErrorMessage Component', () => {
  const testMessage = 'Test error message';

  it('renders error message correctly', () => {
    renderWithTheme(<ErrorMessage message={testMessage} />);
    const errorElement = screen.getByText(testMessage);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveAttribute('role', 'alert');
    expect(errorElement).toHaveAttribute('aria-live', 'assertive');
  });

  it('applies correct styling', () => {
    renderWithTheme(<ErrorMessage message={testMessage} />);
    const errorElement = screen.getByText(testMessage);
    
    expect(errorElement).toHaveStyle(`
      background-color: ${theme.colors.error};
      color: ${theme.colors.white};
      padding: ${theme.spacing.medium};
      border-radius: ${theme.borderRadius.medium};
      font-size: ${theme.fontSizes.medium};
      font-weight: ${theme.fontWeights.bold};
      margin-bottom: ${theme.spacing.medium};
      font-family: ${theme.fonts.primary};
      line-height: ${theme.lineHeights.normal};
    `);
  });

  it('handles empty message prop', () => {
    renderWithTheme(<ErrorMessage message="" />);
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toBeEmptyDOMElement();
  });

  it('updates message when prop changes', () => {
    const { rerender } = renderWithTheme(<ErrorMessage message={testMessage} />);
    expect(screen.getByText(testMessage)).toBeInTheDocument();

    const newMessage = 'Updated error message';
    rerender(
      <ThemeProvider theme={theme}>
        <ErrorMessage message={newMessage} />
      </ThemeProvider>
    );
    expect(screen.getByText(newMessage)).toBeInTheDocument();
    expect(screen.queryByText(testMessage)).not.toBeInTheDocument();
  });
});