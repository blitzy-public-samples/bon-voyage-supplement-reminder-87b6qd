import React from 'react';
import styled from 'styled-components';
import theme from '../../styles/theme';

// Styled components for the footer
const FooterContainer = styled.footer`
  background-color: ${theme.colors.secondary};
  color: ${theme.colors.background};
  padding: ${theme.spacing.medium};
  text-align: center;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: ${theme.spacing.medium};
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: ${theme.spacing.medium};
`;

const FooterLink = styled.a`
  color: ${theme.colors.background};
  text-decoration: none;
  font-size: ${theme.fontSizes.small};
  transition: ${theme.transitions.short};

  &:hover {
    text-decoration: underline;
  }
`;

/**
 * Footer component for the supplement reminder website.
 * Displays copyright information and links to the Privacy Policy and Terms of Service.
 * 
 * Requirements addressed:
 * - User Interface Consistency (Technical Requirements/User Interface Design)
 * - Legal Compliance (Technical Requirements/Security and Compliance)
 * - Accessibility (Technical Requirements/User Interface Design)
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <div>
          &copy; {currentYear} Supplement Reminder. All rights reserved.
        </div>
        <FooterLinks>
          <FooterLink href="/privacy-policy" aria-label="Privacy Policy">
            Privacy Policy
          </FooterLink>
          <FooterLink href="/terms-of-service" aria-label="Terms of Service">
            Terms of Service
          </FooterLink>
        </FooterLinks>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;