import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Confirmation } from './Confirmation';
import { ReminderContext, ReminderContextType } from '../../context/ReminderContext';
import theme from '../../styles/theme';
import { User, Reminder, ReminderStatus } from '../../types';

// Mock the useReminderContext hook
jest.mock('../../context/ReminderContext', () => ({
  useReminderContext: jest.fn(),
}));

// Helper function to render the component with theme and context
const renderWithThemeAndContext = (ui: React.ReactElement, contextValue: ReminderContextType) => {
  return render(
    <ThemeProvider theme={theme}>
      <ReminderContext.Provider value={contextValue}>
        {ui}
      </ReminderContext.Provider>
    </ThemeProvider>
  );
};

describe('Confirmation component', () => {
  const mockUser: User = {
    id: '1',
    phoneNumber: '+1234567890',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockReminder: Reminder = {
    id: '1',
    userId: '1',
    time: '08:00',
    timezone: 'America/New_York',
    status: ReminderStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockContextValue: ReminderContextType = {
    user: mockUser,
    reminders: [mockReminder],
    setUser: jest.fn(),
    addReminder: jest.fn(),
    updateReminder: jest.fn(),
    deleteReminder: jest.fn(),
    getReminderById: jest.fn(),
    getActiveReminders: jest.fn(),
  };

  beforeEach(() => {
    (ReminderContext.useReminderContext as jest.Mock).mockReturnValue(mockContextValue);
  });

  it('renders confirmation message and reminder details', () => {
    renderWithThemeAndContext(<Confirmation />, mockContextValue);

    expect(screen.getByText(/Reminder Set!/i)).toBeInTheDocument();
    expect(screen.getByText(/08:00/)).toBeInTheDocument();
    expect(screen.getByText(/\(XXX\) XXX-7890/)).toBeInTheDocument();
  });

  it('displays modify and cancel buttons', () => {
    renderWithThemeAndContext(<Confirmation />, mockContextValue);

    expect(screen.getByText(/Modify Reminder/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel Reminder/i)).toBeInTheDocument();
  });

  it('calls handleModifyReminder when modify button is clicked', () => {
    const mockHandleModifyReminder = jest.fn();
    const contextWithMockHandlers = {
      ...mockContextValue,
      updateReminder: mockHandleModifyReminder,
    };

    renderWithThemeAndContext(<Confirmation />, contextWithMockHandlers);

    fireEvent.click(screen.getByText(/Modify Reminder/i));
    expect(mockHandleModifyReminder).toHaveBeenCalledWith('1', expect.any(Object));
  });

  it('calls handleCancelReminder when cancel button is clicked', () => {
    const mockHandleCancelReminder = jest.fn();
    const contextWithMockHandlers = {
      ...mockContextValue,
      deleteReminder: mockHandleCancelReminder,
    };

    renderWithThemeAndContext(<Confirmation />, contextWithMockHandlers);

    fireEvent.click(screen.getByText(/Cancel Reminder/i));
    expect(mockHandleCancelReminder).toHaveBeenCalledWith('1');
  });

  it('displays correctly on mobile viewport', () => {
    // Set viewport to mobile size
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    window.dispatchEvent(new Event('resize'));

    renderWithThemeAndContext(<Confirmation />, mockContextValue);

    // Check if all elements are visible and correctly styled for mobile view
    expect(screen.getByText(/Reminder Set!/i)).toBeInTheDocument();
    expect(screen.getByText(/08:00/)).toBeInTheDocument();
    expect(screen.getByText(/\(XXX\) XXX-7890/)).toBeInTheDocument();
    expect(screen.getByText(/Modify Reminder/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel Reminder/i)).toBeInTheDocument();

    // Add more specific checks for mobile styling if necessary
    // For example, you could check for specific CSS classes or styles applied to elements
  });

  it('handles case when no reminder is available', () => {
    const contextWithNoReminders = {
      ...mockContextValue,
      reminders: [],
    };

    renderWithThemeAndContext(<Confirmation />, contextWithNoReminders);

    expect(screen.getByText(/No reminder found/i)).toBeInTheDocument();
  });

  it('displays error message when context is not available', () => {
    (ReminderContext.useReminderContext as jest.Mock).mockImplementation(() => {
      throw new Error('useReminderContext must be used within a ReminderProvider');
    });

    render(<Confirmation />);

    expect(screen.getByText(/Error: Context not available/i)).toBeInTheDocument();
  });
});