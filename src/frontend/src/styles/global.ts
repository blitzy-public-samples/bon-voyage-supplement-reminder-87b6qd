import { createGlobalStyle } from 'styled-components';
import theme from './theme';

// Requirement: Responsive Design (Technical Requirements/User Interface Design)
// Implement responsive design principles for mobile-first approach
// Requirement: Consistent Styling (Technical Requirements/User Interface Design)
// Apply consistent styling across the application

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    font-family: ${theme.fonts.primary};
    font-size: ${theme.fontSizes.medium};
    line-height: ${theme.lineHeights.normal};
    color: ${theme.colors.text};
    background-color: ${theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: ${theme.transitions.short};

    &:hover {
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }
  }

  button {
    cursor: pointer;
    font-family: ${theme.fonts.primary};
    font-size: ${theme.fontSizes.medium};
    font-weight: ${theme.fontWeights.bold};
    padding: ${theme.spacing.small} ${theme.spacing.medium};
    border: none;
    border-radius: ${theme.borderRadius.medium};
    background-color: ${theme.colors.primary};
    color: ${theme.colors.background};
    transition: ${theme.transitions.short};

    &:hover {
      background-color: ${theme.colors.primaryDark};
    }

    &:focus {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  input, select, textarea {
    font-family: ${theme.fonts.primary};
    font-size: ${theme.fontSizes.medium};
    padding: ${theme.spacing.small};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.borderRadius.small};
    transition: ${theme.transitions.short};
    width: 100%;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 2px ${theme.colors.primaryLight};
    }
  }

  // Responsive typography
  @media (max-width: ${theme.breakpoints.tablet}) {
    html, body {
      font-size: ${theme.fontSizes.small};
    }
  }

  // Accessibility improvements
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  // Print styles
  @media print {
    body {
      font-size: 12pt;
    }

    a {
      text-decoration: underline;
    }

    button {
      display: none;
    }
  }
`;

export default GlobalStyle;