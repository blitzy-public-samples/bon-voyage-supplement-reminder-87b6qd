import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from '../../styles/theme';
import Home from './Home';

// Mock the Layout component
jest.mock('../../components/Layout/Layout', () => {
  return function MockLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout">{children}</div>;
  };
});

// Mock the ReminderForm component
jest.mock('../../components/ReminderForm/ReminderForm', () => {
  return function MockReminderForm() {
    return <div data-testid="reminder-form">Reminder Form</div>;
  };
});

describe('Home component', () => {
  const renderWithTheme = (component: React.ReactNode) => {
    return render(
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    );
  };

  test('renders without crashing', () => {
    renderWithTheme(<Home />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('displays the correct title', () => {
    renderWithTheme(<Home />);
    const titleElement = screen.getByRole('heading', { level: 1 });
    expect(titleElement).toHaveTextContent('Welcome to Supplement Reminder');
  });

  test('displays the correct subtitle', () => {
    renderWithTheme(<Home />);
    const subtitleElement = screen.getByText(/Set up your daily reminder/i);
    expect(subtitleElement).toBeInTheDocument();
    expect(subtitleElement).toHaveTextContent("Set up your daily reminder to ensure you never miss taking your supplements. It's quick, easy, and helps you stay on track with your health goals.");
  });

  test('contains a reminder form', () => {
    renderWithTheme(<Home />);
    const reminderForm = screen.getByTestId('reminder-form');
    expect(reminderForm).toBeInTheDocument();
  });

  test('applies correct styling to components', () => {
    renderWithTheme(<Home />);
    const titleElement = screen.getByRole('heading', { level: 1 });
    const subtitleElement = screen.getByText(/Set up your daily reminder/i);

    expect(titleElement).toHaveStyle(`
      font-size: ${theme.fontSizes.xlarge};
      color: ${theme.colors.primary};
      font-weight: ${theme.fontWeights.bold};
    `);

    expect(subtitleElement).toHaveStyle(`
      font-size: ${theme.fontSizes.large};
      color: ${theme.colors.text};
      line-height: ${theme.lineHeights.normal};
    `);
  });
});