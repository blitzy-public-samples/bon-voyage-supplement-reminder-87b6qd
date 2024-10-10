const validator = require('validator');
const { isValidTimeZone } = require('./timeZoneHandler');

/**
 * Validates the format of a phone number
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} True if the phone number is valid, false otherwise
 */
function validatePhoneNumber(phoneNumber) {
  if (typeof phoneNumber !== 'string') {
    return false;
  }
  return validator.isMobilePhone(phoneNumber, 'any', { strictMode: true });
}

/**
 * Validates the format of the reminder time
 * @param {string} reminderTime - The reminder time to validate (HH:MM format)
 * @returns {boolean} True if the reminder time is valid, false otherwise
 */
function validateReminderTime(reminderTime) {
  if (typeof reminderTime !== 'string') {
    return false;
  }
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(reminderTime);
}

/**
 * Validates if the provided time zone is valid
 * @param {string} timeZone - The time zone to validate
 * @returns {boolean} True if the time zone is valid, false otherwise
 */
function validateTimeZone(timeZone) {
  if (typeof timeZone !== 'string') {
    return false;
  }
  return isValidTimeZone(timeZone);
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} Sanitized input string
 * @throws {TypeError} If input is not a string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string');
  }
  return validator.escape(input);
}

/**
 * Validates the complete reminder input object
 * @param {Object} reminderInput - The reminder input object to validate
 * @returns {Object} Validation result with errors if any
 */
function validateReminderInput(reminderInput) {
  const errors = {};

  if (!reminderInput || typeof reminderInput !== 'object') {
    return { isValid: false, errors: { general: 'Invalid input' } };
  }

  if (!reminderInput.phoneNumber) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!validatePhoneNumber(reminderInput.phoneNumber)) {
    errors.phoneNumber = 'Invalid phone number format';
  }

  if (!reminderInput.reminderTime) {
    errors.reminderTime = 'Reminder time is required';
  } else if (!validateReminderTime(reminderInput.reminderTime)) {
    errors.reminderTime = 'Invalid reminder time format (use HH:MM)';
  }

  if (!reminderInput.timeZone) {
    errors.timeZone = 'Time zone is required';
  } else if (!validateTimeZone(reminderInput.timeZone)) {
    errors.timeZone = 'Invalid time zone';
  }

  if (reminderInput.message && typeof reminderInput.message === 'string') {
    if (reminderInput.message.length > 160) {
      errors.message = 'Message must not exceed 160 characters';
    }
  } else if (reminderInput.message !== undefined) {
    errors.message = 'Message must be a string';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates and sanitizes the complete reminder input object
 * @param {Object} reminderInput - The reminder input object to validate and sanitize
 * @returns {Object} Validation result with errors if any, and sanitized input
 */
function validateAndSanitizeReminderInput(reminderInput) {
  const validationResult = validateReminderInput(reminderInput);

  if (!validationResult.isValid) {
    return validationResult;
  }

  const sanitizedInput = {
    phoneNumber: reminderInput.phoneNumber,
    reminderTime: reminderInput.reminderTime,
    timeZone: reminderInput.timeZone,
    message: reminderInput.message ? sanitizeInput(reminderInput.message) : undefined
  };

  return {
    isValid: true,
    sanitizedInput
  };
}

module.exports = {
  validatePhoneNumber,
  validateReminderTime,
  validateTimeZone,
  sanitizeInput,
  validateReminderInput,
  validateAndSanitizeReminderInput
};