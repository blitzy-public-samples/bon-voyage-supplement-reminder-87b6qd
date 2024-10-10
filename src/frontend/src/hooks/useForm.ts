import { useState, useCallback } from 'react';
import { validateReminderForm, isFormValid } from '../utils/validation';
import { createReminder, updateReminder, handleApiError } from '../utils/api';
import { FormValues, FormErrors, ApiResponse, Reminder } from '../types';

/**
 * Custom hook for managing form state, validation, and submission in the supplement reminder website.
 * 
 * Requirements addressed:
 * - User Input Form (Technical Requirements/User Input Form)
 * - Data Storage and Management (Technical Requirements/Data Storage and Management)
 * - Input Validation (Technical Requirements/Security Considerations/Application Security)
 * - Error Handling (Technical Requirements/Error Handling and Logging)
 * 
 * @param initialValues - Initial values for the form
 * @returns An object containing form state, handlers, and submission function
 */
export const useForm = (initialValues: FormValues) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Handles changes in form input values
   * @param event - The change event from the input field
   */
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues(prevValues => ({ ...prevValues, [name]: value }));
    // Clear the error for the field being changed
    setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
  }, []);

  /**
   * Validates a single field on blur
   * @param event - The blur event from the input field
   */
  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    const fieldErrors = validateReminderForm({ ...values, [name]: values[name] });
    setErrors(prevErrors => ({ ...prevErrors, [name]: fieldErrors[name] }));
  }, [values]);

  /**
   * Validates all form fields
   * @returns An object containing any validation errors
   */
  const validateForm = useCallback(() => {
    const formErrors = validateReminderForm(values);
    setErrors(formErrors);
    return formErrors;
  }, [values]);

  /**
   * Handles form submission
   * @param event - The form submission event
   * @returns A promise that resolves to the API response or null if validation fails
   */
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>): Promise<ApiResponse<Reminder> | null> => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const formErrors = validateForm();
    if (isFormValid(formErrors)) {
      try {
        let response: ApiResponse<Reminder>;
        if (values.id) {
          response = await updateReminder(values.id, values);
        } else {
          response = await createReminder(values);
        }
        // Reset form or navigate to confirmation page
        setValues(initialValues);
        setErrors({});
        setIsSubmitting(false);
        return response;
      } catch (error) {
        const errorMessage = handleApiError(error);
        setSubmitError(errorMessage);
        setIsSubmitting(false);
        return null;
      }
    } else {
      setIsSubmitting(false);
      return null;
    }
  }, [values, validateForm, initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors,
  };
};