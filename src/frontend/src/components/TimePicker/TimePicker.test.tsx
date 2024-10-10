import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TimePicker from './TimePicker';
import { TimeString } from '../../types';
import * as timeZoneUtils from '../../utils/timeZone';

// Mock the timeZone utility functions
jest.mock('../../utils/timeZone', () => ({
  formatTimeForDisplay: jest.fn((time) => time),
  getUserTimeZone: jest.fn(() => 'America/New_York'),
}));

describe('TimePicker', () => {
  const mockOnChange = jest.fn();
  const initialTime: TimeString = '12:00';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<TimePicker value={initialTime} onChange={mockOnChange} />);
    
    const timeInput = screen.getByLabelText('Select reminder time');
    expect(timeInput).toBeInTheDocument();
    expect(timeInput).toHaveValue(initialTime);
  });

  it('handles time change', () => {
    render(<TimePicker value={initialTime} onChange={mockOnChange} />);
    
    const timeInput = screen.getByLabelText('Select reminder time') as HTMLInputElement;
    fireEvent.change(timeInput, { target: { value: '14:30' } });

    expect(mockOnChange).toHaveBeenCalledWith('14:30');
  });

  it('displays the correct initial time', () => {
    const customTime: TimeString = '09:15';
    render(<TimePicker value={customTime} onChange={mockOnChange} />);
    
    const timeInput = screen.getByLabelText('Select reminder time');
    expect(timeInput).toHaveValue(customTime);
  });

  it('displays user time zone', async () => {
    render(<TimePicker value={initialTime} onChange={mockOnChange} />);
    
    const timeZoneText = await screen.findByText('Your time zone: America/New_York');
    expect(timeZoneText).toBeInTheDocument();
  });

  it('updates selected time when value prop changes', () => {
    const { rerender } = render(<TimePicker value={initialTime} onChange={mockOnChange} />);
    
    const newTime: TimeString = '15:45';
    rerender(<TimePicker value={newTime} onChange={mockOnChange} />);

    const timeInput = screen.getByLabelText('Select reminder time');
    expect(timeInput).toHaveValue(newTime);
  });

  it('calls getUserTimeZone on mount', () => {
    render(<TimePicker value={initialTime} onChange={mockOnChange} />);
    
    expect(timeZoneUtils.getUserTimeZone).toHaveBeenCalledTimes(1);
  });
});