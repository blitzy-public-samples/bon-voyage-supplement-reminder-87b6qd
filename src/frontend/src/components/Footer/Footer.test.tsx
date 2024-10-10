import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Footer from './Footer';
import theme from '../../styles/theme';

// Mock the current year for consistent testing
const mockDate = new Date('2023-01-01T00:00:00Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

describe('Footer component', () => {
  beforeEach(() => {
    render(
      <ThemeProvider theme={theme}>
        <Footer />
      </ThemeProvider>
    );
  });

  it('renders the footer with correct copyright content', () => {
    const currentYear = mockDate.getFullYear();
    const copyrightText = screen.getByText(`© ${currentYear} Supplement Reminder. All rights reserved.`);
    expect(copyrightText).toBeInTheDocument();
  });

  it('renders the Privacy Policy link with correct attributes', () => {
    const privacyPolicyLink = screen.getByText('Privacy Policy');
    expect(privacyPolicyLink).toBeInTheDocument();
    expect(privacyPolicyLink).toHaveAttribute('href', '/privacy-policy');
    expect(privacyPolicyLink).toHaveAttribute('aria-label', 'Privacy Policy');
  });

  it('renders the Terms of Service link with correct attributes', () => {
    const termsOfServiceLink = screen.getByText('Terms of Service');
    expect(termsOfServiceLink).toBeInTheDocument();
    expect(termsOfServiceLink).toHaveAttribute('href', '/terms-of-service');
    expect(termsOfServiceLink).toHaveAttribute('aria-label', 'Terms of Service');
  });

  it('applies correct styling to footer container', () => {
    const footerContainer = screen.getByRole('contentinfo');
    expect(footerContainer).toHaveStyle(`
      background-color: ${theme.colors.secondary};
      color: ${theme.colors.background};
      padding: ${theme.spacing.medium};
      text-align: center;
    `);
  });

  it('applies correct styling to footer links', () => {
    const footerLinks = screen.getAllByRole('link');
    footerLinks.forEach(link => {
      expect(link).toHaveStyle(`
        color: ${theme.colors.background};
        text-decoration: none;
        font-size: ${theme.fontSizes.small};
      `);
    });
  });
});