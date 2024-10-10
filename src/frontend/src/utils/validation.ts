import { FormErrors, ReminderFormData } from '../types';
import { isValidTimeZone } from './timeZone';

/**
 * Validates a phone number string
 * @param phoneNumber - The phone number to validate
 * @returns True if the phone number is valid, false otherwise
 * 
 * Requirement addressed: Input Validation
 * Location: Technical Requirements/Security Considerations/Application Security
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Remove any non-digit characters from the phone number
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  // Check if the resulting string has exactly 10 digits
  return digitsOnly.length === 10;
};

/**
 * Validates a reminder time string
 * @param time - The time string to validate
 * @returns True if the time is valid, false otherwise
 * 
 * Requirement addressed: Input Validation
 * Location: Technical Requirements/Security Considerations/Application Security
 */
export const validateReminderTime = (time: string): boolean => {
  // Check if the time string matches the format 'HH:mm'
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
};

/**
 * Validates the supplement name
 * @param supplementName - The supplement name to validate
 * @returns True if the supplement name is valid, false otherwise
 * 
 * Requirement addressed: Input Validation
 * Location: Technical Requirements/Security Considerations/Application Security
 */
export const validateSupplementName = (supplementName: string): boolean => {
  return supplementName.trim().length > 0 && supplementName.length <= 100;
};

/**
 * Validates the entire reminder form input
 * @param formData - The form data to validate
 * @returns An object containing validation errors, if any
 * 
 * Requirement addressed: Input Validation, User Experience
 * Location: Technical Requirements/Security Considerations/Application Security, Technical Requirements/User Interface Design
 */
export const validateReminderForm = (formData: ReminderFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!validatePhoneNumber(formData.phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid 10-digit phone number';
  }

  if (!validateReminderTime(formData.time)) {
    errors.time = 'Please enter a valid time in HH:mm format';
  }

  if (!isValidTimeZone(formData.timezone)) {
    errors.timezone = 'Please select a valid time zone';
  }

  if (!validateSupplementName(formData.supplementName)) {
    errors.supplementName = 'Please enter a valid supplement name (1-100 characters)';
  }

  return errors;
};

/**
 * Checks if the form is valid based on the FormErrors object
 * @param errors - The FormErrors object to check
 * @returns True if the form is valid (no errors), false otherwise
 * 
 * Requirement addressed: Input Validation
 * Location: Technical Requirements/Security Considerations/Application Security
 */
export const isFormValid = (errors: FormErrors): boolean => {
  return Object.keys(errors).length === 0;
};

/**
 * This utility file provides functions for validating user input in the supplement reminder website.
 * It ensures that all user-provided data is properly validated before being processed or stored.
 * 
 * Requirements addressed:
 * 1. Input Validation (Technical Requirements/Security Considerations/Application Security)
 *    - Implement thorough input validation to prevent injection attacks and ensure data integrity
 * 2. User Experience (Technical Requirements/User Interface Design)
 *    - Provide clear and immediate feedback on input errors to enhance user experience
 * 3. Data Integrity (Technical Requirements/Data Management)
 *    - Ensure that only valid and properly formatted data is stored in the system
 */