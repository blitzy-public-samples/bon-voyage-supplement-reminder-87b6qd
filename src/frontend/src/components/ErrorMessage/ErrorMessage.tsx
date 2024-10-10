import React from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles/theme';

interface ErrorMessageProps {
  message: string;
}

const ErrorContainer = styled.div<{ theme: Theme }>`
  background-color: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  font-family: ${({ theme }) => theme.fonts.primary};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  transition: opacity ${({ theme }) => theme.transitions.short};
  opacity: 0.95;

  &:hover {
    opacity: 1;
  }
`;

/**
 * ErrorMessage component displays an error message in a visually appealing manner.
 * 
 * @param {ErrorMessageProps} props - The props for the ErrorMessage component
 * @returns {JSX.Element} Rendered error message component
 * 
 * Requirements addressed:
 * - Error Handling (Technical Requirements/User Interface Design)
 * - Consistent Styling (Technical Requirements/User Interface Design)
 * - Accessibility (Technical Requirements/User Interface Design)
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <ErrorContainer role="alert" aria-live="assertive">
      {message}
    </ErrorContainer>
  );
};

export default ErrorMessage;