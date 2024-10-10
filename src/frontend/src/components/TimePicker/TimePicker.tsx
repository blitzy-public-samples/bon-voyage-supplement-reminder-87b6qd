import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { TimeString } from '../../types';
import { formatTimeForDisplay, getUserTimeZone, parseTimeString, isValidTimeZone } from '../../utils/timeZone';

// Styled components
const TimePickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const TimeInput = styled.input`
  font-size: 1rem;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const TimeZoneInfo = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textLight};
  margin-top: 0.5rem;
`;

interface TimePickerProps {
  value: TimeString;
  onChange: (time: TimeString) => void;
  label?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  minTime?: TimeString;
  maxTime?: TimeString;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label = 'Reminder Time',
  id = 'timePicker',
  name = 'time',
  required = false,
  disabled = false,
  minTime,
  maxTime,
}) => {
  const [selectedTime, setSelectedTime] = useState<TimeString>(value);
  const [userTimeZone, setUserTimeZone] = useState<string>('');

  useEffect(() => {
    const timeZone = getUserTimeZone();
    if (isValidTimeZone(timeZone)) {
      setUserTimeZone(timeZone);
    } else {
      console.error(`Invalid time zone detected: ${timeZone}`);
      setUserTimeZone('UTC');
    }
  }, []);

  useEffect(() => {
    setSelectedTime(value);
  }, [value]);

  const validateTimeRange = useCallback((time: TimeString): boolean => {
    if (!minTime && !maxTime) return true;
    const timeDate = parseTimeString(time);
    const minDate = minTime ? parseTimeString(minTime) : null;
    const maxDate = maxTime ? parseTimeString(maxTime) : null;

    if (minDate && timeDate < minDate) return false;
    if (maxDate && timeDate > maxDate) return false;
    return true;
  }, [minTime, maxTime]);

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = event.target.value as TimeString;
    if (validateTimeRange(newTime)) {
      setSelectedTime(newTime);
      onChange(newTime);
    } else {
      console.warn(`Selected time ${newTime} is outside the allowed range`);
    }
  };

  return (
    <TimePickerContainer>
      <Label htmlFor={id}>{label}</Label>
      <TimeInput
        id={id}
        name={name}
        type="time"
        value={selectedTime}
        onChange={handleTimeChange}
        aria-label={label}
        required={required}
        disabled={disabled}
        min={minTime}
        max={maxTime}
      />
      {userTimeZone && (
        <TimeZoneInfo>Your time zone: {userTimeZone}</TimeZoneInfo>
      )}
    </TimePickerContainer>
  );
};

export default React.memo(TimePicker);

// Version comments for third-party imports:
// react: ^17.0.2
// styled-components: ^5.3.3
// date-fns-tz: ^1.3.7 (used indirectly via timeZone utils)
// date-fns: ^2.29.3 (used indirectly via timeZone utils)