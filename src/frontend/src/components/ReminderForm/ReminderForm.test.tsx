import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import ReminderForm from './ReminderForm';
import { validateReminderForm, isFormValid } from '../../utils/validation';
import { createReminder } from '../../utils/api';
import { ReminderFormData } from '../../types';

// Mock the dependencies
jest.mock('../../utils/validation');
jest.mock('../../utils/api');
jest.mock('../TimePicker/TimePicker', () => ({ onChange }: { onChange: (time: string) => void }) => (
  <input data-testid="time-picker" onChange={(e) => onChange(e.target.value)} />
));

describe('ReminderForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form elements correctly', () => {
    render(<ReminderForm />);
    
    expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument();
    expect(screen.getByTestId('time-picker')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter supplement name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set Reminder' })).toBeInTheDocument();
  });

  test('displays validation errors for invalid inputs', async () => {
    const mockValidateReminderForm = validateReminderForm as jest.MockedFunction<typeof validateReminderForm>;
    mockValidateReminderForm.mockReturnValue({
      phoneNumber: 'Invalid phone number',
      time: 'Invalid reminder time',
      supplementName: 'Invalid supplement name'
    });

    render(<ReminderForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Enter your phone number'), { target: { value: '123' } });
    fireEvent.change(screen.getByTestId('time-picker'), { target: { value: '25:00' } });
    fireEvent.change(screen.getByPlaceholderText('Enter supplement name'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set Reminder' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid phone number')).toBeInTheDocument();
      expect(screen.getByText('Invalid reminder time')).toBeInTheDocument();
      expect(screen.getByText('Invalid supplement name')).toBeInTheDocument();
    });
  });

  test('submits form with valid inputs', async () => {
    const mockValidateReminderForm = validateReminderForm as jest.MockedFunction<typeof validateReminderForm>;
    mockValidateReminderForm.mockReturnValue({});

    const mockIsFormValid = isFormValid as jest.MockedFunction<typeof isFormValid>;
    mockIsFormValid.mockReturnValue(true);

    const mockCreateReminder = createReminder as jest.MockedFunction<typeof createReminder>;
    mockCreateReminder.mockResolvedValue({ success: true, data: {} });

    render(<ReminderForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Enter your phone number'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByTestId('time-picker'), { target: { value: '14:30' } });
    fireEvent.change(screen.getByPlaceholderText('Enter supplement name'), { target: { value: 'Vitamin C' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set Reminder' }));

    await waitFor(() => {
      expect(screen.getByText('Reminder set successfully!')).toBeInTheDocument();
    });

    expect(mockCreateReminder).toHaveBeenCalledWith({
      phoneNumber: '1234567890',
      time: '14:30',
      supplementName: 'Vitamin C',
      timezone: expect.any(String)
    } as ReminderFormData);
  });

  test('handles API errors', async () => {
    const mockValidateReminderForm = validateReminderForm as jest.MockedFunction<typeof validateReminderForm>;
    mockValidateReminderForm.mockReturnValue({});

    const mockIsFormValid = isFormValid as jest.MockedFunction<typeof isFormValid>;
    mockIsFormValid.mockReturnValue(true);

    const mockCreateReminder = createReminder as jest.MockedFunction<typeof createReminder>;
    mockCreateReminder.mockRejectedValue(new Error('API Error'));

    render(<ReminderForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Enter your phone number'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByTestId('time-picker'), { target: { value: '14:30' } });
    fireEvent.change(screen.getByPlaceholderText('Enter supplement name'), { target: { value: 'Vitamin C' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set Reminder' }));

    await waitFor(() => {
      expect(screen.getByText('An error occurred while setting the reminder. Please try again.')).toBeInTheDocument();
    });
  });

  test('disables submit button while submitting', async () => {
    const mockValidateReminderForm = validateReminderForm as jest.MockedFunction<typeof validateReminderForm>;
    mockValidateReminderForm.mockReturnValue({});

    const mockIsFormValid = isFormValid as jest.MockedFunction<typeof isFormValid>;
    mockIsFormValid.mockReturnValue(true);

    const mockCreateReminder = createReminder as jest.MockedFunction<typeof createReminder>;
    mockCreateReminder.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} }), 1000)));

    render(<ReminderForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Enter your phone number'), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByTestId('time-picker'), { target: { value: '14:30' } });
    fireEvent.change(screen.getByPlaceholderText('Enter supplement name'), { target: { value: 'Vitamin C' } });
    
    const submitButton = screen.getByRole('button', { name: 'Set Reminder' });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});