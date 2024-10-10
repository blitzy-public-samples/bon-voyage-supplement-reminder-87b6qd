import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ConfirmationPage from './ConfirmationPage';
import { ReminderContext, ReminderProvider } from '../../context/ReminderContext';
import { theme } from '../../styles/theme';
import { formatTimeForDisplay, convertToUserTimeZone } from '../../utils/timeZone';
import { User, Reminder, ReminderStatus } from '../../types';

// Mock the timeZone utility functions
jest.mock('../../utils/timeZone', () => ({
  formatTimeForDisplay: jest.fn(),
  convertToUserTimeZone: jest.fn(),
}));

// Mock reminder context
const mockUser: User = {
  id: '123',
  phoneNumber: '+1234567890',
  timezone: 'America/New_York',
};

const mockReminder: Reminder = {
  id: '456',
  userId: '123',
  scheduledAt: '2023-05-01T08:00:00Z',
  status: ReminderStatus.PENDING,
  sentAt: null,
  supplementName: 'Vitamin C',
};

const mockReminderContext = {
  user: mockUser,
  reminders: [mockReminder],
  setUser: jest.fn(),
  addReminder: jest.fn(),
  updateReminder: jest.fn(),
  deleteReminder: jest.fn(),
  getReminderById: jest.fn(),
  getActiveReminders: jest.fn(),
};

// Helper function to render the component with necessary providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter initialEntries={['/confirmation']}>
      <ThemeProvider theme={theme}>
        <ReminderContext.Provider value={mockReminderContext}>
          <Routes>
            <Route path="/confirmation" element={ui} />
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/modify-reminder" element={<div>Modify Reminder Page</div>} />
          </Routes>
        </ReminderContext.Provider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('ConfirmationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (formatTimeForDisplay as jest.Mock).mockReturnValue('04:00 AM');
    (convertToUserTimeZone as jest.Mock).mockReturnValue(new Date('2023-05-01T04:00:00'));
  });

  test('renders the confirmation message', () => {
    renderWithProviders(<ConfirmationPage />);
    expect(screen.getByText(/Reminder Set Successfully!/i)).toBeInTheDocument();
  });

  test('displays the correct reminder time and supplement name', () => {
    renderWithProviders(<ConfirmationPage />);
    expect(screen.getByText(/Your reminder for/i)).toHaveTextContent('Vitamin C');
    expect(screen.getByText(/04:00 AM/)).toBeInTheDocument();
    expect(convertToUserTimeZone).toHaveBeenCalledWith('2023-05-01T08:00:00Z', 'America/New_York');
    expect(formatTimeForDisplay).toHaveBeenCalled();
  });

  test('displays the masked phone number', () => {
    renderWithProviders(<ConfirmationPage />);
    expect(screen.getByText(/Phone Number:/)).toHaveTextContent('(123) XXX-7890');
  });

  test('navigates to modify reminder page when Modify Reminder button is clicked', () => {
    renderWithProviders(<ConfirmationPage />);
    fireEvent.click(screen.getByText(/Modify Reminder/));
    expect(screen.getByText(/Modify Reminder Page/)).toBeInTheDocument();
  });

  test('calls deleteReminder and navigates to home when Cancel Reminder button is clicked', async () => {
    window.alert = jest.fn();
    renderWithProviders(<ConfirmationPage />);
    fireEvent.click(screen.getByText(/Cancel Reminder/));
    expect(mockReminderContext.deleteReminder).toHaveBeenCalledWith('456');
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Reminder cancelled successfully');
      expect(screen.getByText(/Home Page/)).toBeInTheDocument();
    });
  });

  test('renders correctly on mobile devices', () => {
    // Mock the window.innerWidth to simulate a mobile device
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    // Trigger the window resize event
    global.dispatchEvent(new Event('resize'));

    renderWithProviders(<ConfirmationPage />);
    const container = screen.getByText(/Reminder Set Successfully!/i).closest('div');
    expect(container).toHaveStyle('padding: 16px'); // Assuming theme.spacing.medium is 16px
  });

  test('displays error message when user or reminder is not found', () => {
    const emptyContext = {
      ...mockReminderContext,
      user: null,
      reminders: [],
    };
    render(
      <MemoryRouter initialEntries={['/confirmation']}>
        <ThemeProvider theme={theme}>
          <ReminderContext.Provider value={emptyContext}>
            <ConfirmationPage />
          </ReminderContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/Error: User or reminder not found/i)).toBeInTheDocument();
  });

  test('displays next steps', () => {
    renderWithProviders(<ConfirmationPage />);
    expect(screen.getByText(/What's next?/i)).toBeInTheDocument();
    expect(screen.getByText(/Look out for our text message reminder/i)).toBeInTheDocument();
    expect(screen.getByText(/Take your supplement as scheduled/i)).toBeInTheDocument();
    expect(screen.getByText(/Enjoy the benefits of consistent supplement use!/i)).toBeInTheDocument();
  });
});