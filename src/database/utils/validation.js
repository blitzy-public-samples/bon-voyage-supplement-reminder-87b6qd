const validator = require('validator');

// TODO: Create a file '../errors/customErrors.js' with the following content:
// class ValidationError extends Error {
//   constructor(message) {
//     super(message);
//     this.name = 'ValidationError';
//   }
// }
// module.exports = { ValidationError };

/**
 * Custom error class for validation errors
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates a phone number string
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} True if valid, false otherwise
 * @throws {ValidationError} If the phone number is invalid
 */
function validatePhoneNumber(phoneNumber) {
  if (!validator.isMobilePhone(phoneNumber, 'any', { strictMode: true })) {
    throw new ValidationError('Invalid phone number');
  }
  return true;
}

/**
 * Validates a reminder time string
 * @param {string} reminderTime - The reminder time to validate (format: HH:MM)
 * @returns {boolean} True if valid, false otherwise
 * @throws {ValidationError} If the reminder time is invalid
 */
function validateReminderTime(reminderTime) {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(reminderTime)) {
    throw new ValidationError('Invalid reminder time format');
  }
  const [hours, minutes] = reminderTime.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new ValidationError('Invalid reminder time range');
  }
  return true;
}

/**
 * Validates a timezone string
 * @param {string} timezone - The timezone to validate
 * @returns {boolean} True if valid, false otherwise
 * @throws {ValidationError} If the timezone is invalid
 */
function validateTimezone(timezone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    throw new ValidationError('Invalid timezone');
  }
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - The user input to sanitize
 * @returns {string} Sanitized input string
 */
function sanitizeUserInput(input) {
  return validator.escape(input);
}

/**
 * Validates reminder input data
 * @param {object} reminderData - The reminder data to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If any of the reminder data is invalid
 */
function validateReminderInput(reminderData) {
  if (!validator.isUUID(reminderData.userId)) {
    throw new ValidationError('Invalid userId');
  }
  validateReminderTime(reminderData.scheduledTime);
  const validStatuses = ['pending', 'sent', 'failed'];
  if (!validStatuses.includes(reminderData.status)) {
    throw new ValidationError('Invalid status');
  }
  return true;
}

/**
 * Validates an analytics event type
 * @param {string} eventType - The event type to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If the event type is invalid
 */
function validateAnalyticsEventType(eventType) {
  const validEventTypes = ['reminder_set', 'reminder_sent', 'user_registered'];
  if (!validEventTypes.includes(eventType)) {
    throw new ValidationError('Invalid event type');
  }
  return true;
}

/**
 * Validates analytics event data
 * @param {object} eventData - The event data to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If any of the event data is invalid
 */
function validateAnalyticsEventData(eventData) {
  if (!validator.isUUID(eventData.userId)) {
    throw new ValidationError('Invalid userId');
  }
  validateAnalyticsEventType(eventData.eventType);
  if (!validator.isISO8601(eventData.timestamp)) {
    throw new ValidationError('Invalid timestamp');
  }
  return true;
}

module.exports = {
  ValidationError,
  validatePhoneNumber,
  validateReminderTime,
  validateTimezone,
  sanitizeUserInput,
  validateReminderInput,
  validateAnalyticsEventType,
  validateAnalyticsEventData
};