import React, { useState } from 'react';
import styled from 'styled-components';
import { FormValues, FormErrors } from '../../types';
import { validateReminderForm, isFormValid } from '../../utils/validation';
import { createReminder, handleApiError } from '../../utils/api';
import { useForm } from '../../hooks/useForm';
import TimePicker from '../TimePicker/TimePicker';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

// Styled components
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
`;

const Input = styled.input`
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const SubmitButton = styled.button`
  background-color: #FFA500;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #FF8C00;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Label = styled.label`
  font-size: 16px;
  margin-bottom: 5px;
`;

const SuccessMessage = styled.p`
  color: green;
  font-weight: bold;
`;

const ReminderForm: React.FC = () => {
  const initialValues: FormValues = {
    phoneNumber: '',
    reminderTime: '12:00',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    supplementName: '', // Added supplementName field
  };

  const {
    values,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(initialValues);

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitSuccess(false);

    const response = await handleSubmit(event);
    if (response) {
      setSubmitSuccess(true);
      // Log analytics event for successful reminder creation
      console.log('Reminder created successfully', response.data);
    }
  };

  return (
    <FormContainer onSubmit={onSubmit}>
      <Label htmlFor="phoneNumber">Phone Number</Label>
      <Input
        type="tel"
        id="phoneNumber"
        name="phoneNumber"
        value={values.phoneNumber}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter your phone number"
        required
      />
      {errors.phoneNumber && <ErrorMessage message={errors.phoneNumber} />}

      <Label htmlFor="supplementName">Supplement Name</Label>
      <Input
        type="text"
        id="supplementName"
        name="supplementName"
        value={values.supplementName}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter supplement name"
        required
      />
      {errors.supplementName && <ErrorMessage message={errors.supplementName} />}

      <Label htmlFor="reminderTime">Reminder Time</Label>
      <TimePicker
        value={values.reminderTime}
        onChange={(time) => handleChange({ target: { name: 'reminderTime', value: time } } as React.ChangeEvent<HTMLInputElement>)}
      />
      {errors.reminderTime && <ErrorMessage message={errors.reminderTime} />}

      <input
        type="hidden"
        name="timeZone"
        value={values.timeZone}
      />

      {submitError && <ErrorMessage message={submitError} />}
      {submitSuccess && <SuccessMessage>Reminder set successfully!</SuccessMessage>}

      <SubmitButton type="submit" disabled={isSubmitting || !isFormValid(errors)}>
        {isSubmitting ? 'Setting Reminder...' : 'Set Reminder'}
      </SubmitButton>
    </FormContainer>
  );
};

export default ReminderForm;