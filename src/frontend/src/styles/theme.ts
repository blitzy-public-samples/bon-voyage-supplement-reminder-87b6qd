import { COLOR_SCHEME, BREAKPOINTS } from '../constants';

/**
 * Theme object for the supplement reminder website
 * This theme provides a centralized location for defining colors, fonts, spacing,
 * and other design tokens to ensure consistency across the application.
 *
 * Requirements addressed:
 * 1. Consistent Styling (Technical Requirements/User Interface Design)
 * 2. Mobile-Friendly Design (Technical Requirements/User Interface Design)
 */

const theme = {
  colors: COLOR_SCHEME,
  fonts: {
    primary: "'Arial', sans-serif",
    secondary: "'Georgia', serif",
  },
  fontSizes: {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '24px',
  },
  fontWeights: {
    normal: 400,
    bold: 700,
  },
  lineHeights: {
    normal: 1.5,
    small: 1.2,
    large: 1.8,
  },
  spacing: {
    xsmall: '4px',
    small: '8px',
    medium: '16px',
    large: '24px',
    xlarge: '32px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px',
    round: '50%',
  },
  breakpoints: BREAKPOINTS,
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    medium: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    large: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
  },
  transitions: {
    short: '150ms ease-in-out',
    medium: '300ms ease-in-out',
    long: '500ms ease-in-out',
  },
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export type Theme = typeof theme;
export default theme;