const { smsConfig, MAX_SMS_LENGTH, MAX_RETRIES } = require('../config/sms');
const { logEvent } = require('../utils/logger');
const { convertFromUTC, isValidTimeZone } = require('../utils/timeZoneHandler');

// Constants
const RETRY_DELAY = 60000; // 60 seconds

/**
 * Sends an SMS message to the specified phone number
 * @param {string} phoneNumber - The recipient's phone number
 * @param {string} message - The message content
 * @returns {Promise<object>} - Resolves with the Twilio message object if successful, rejects with an error if failed
 */
async function sendSMS(phoneNumber, message) {
  try {
    // Validate input parameters
    if (!phoneNumber || !message) {
      throw new Error('Phone number and message are required');
    }

    // Check if message length exceeds MAX_SMS_LENGTH
    if (message.length > MAX_SMS_LENGTH) {
      throw new Error(`Message exceeds maximum length of ${MAX_SMS_LENGTH} characters`);
    }

    // Use smsConfig.twilioClient to send the SMS
    const result = await smsConfig.twilioClient.messages.create({
      body: message,
      from: smsConfig.phoneNumber,
      to: phoneNumber
    });

    // Log the SMS sending attempt
    logEvent('info', 'SMS sent successfully', { phoneNumber: phoneNumber.slice(-4), messageId: result.sid });

    // Return the Twilio message object if successful
    return result;
  } catch (error) {
    // Log the error
    logEvent('error', 'Failed to send SMS', { phoneNumber: phoneNumber.slice(-4), error: error.message });

    // Throw an error if SMS sending fails
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

/**
 * Sends a reminder SMS to the user
 * @param {object} reminder - The reminder object containing user details and reminder information
 * @returns {Promise<object>} - Resolves with the Twilio message object if successful, rejects with an error if failed
 */
async function sendReminderSMS(reminder) {
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      // Extract phone number and preferred time from the reminder object
      const { phoneNumber, preferredTime, timeZone } = reminder;

      // Validate phone number and time zone
      if (!validatePhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number');
      }
      if (!isValidTimeZone(timeZone)) {
        throw new Error('Invalid time zone');
      }

      // Generate personalized reminder message
      const message = generateReminderMessage(reminder);

      // Call sendSMS function with phone number and message
      const result = await sendSMS(phoneNumber, message);

      // Log the reminder SMS sending attempt
      logEvent('info', 'Reminder SMS sent', { phoneNumber: phoneNumber.slice(-4), reminderId: reminder.id });

      // Return the Twilio message object if successful
      return result;
    } catch (error) {
      retries++;
      if (retries >= MAX_RETRIES) {
        // Log the final failure
        logEvent('error', 'Failed to send reminder SMS after max retries', { reminderId: reminder.id, error: error.message });
        throw error;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

/**
 * Generates a personalized reminder message
 * @param {object} reminder - The reminder object containing user details and reminder information
 * @returns {string} - Personalized reminder message
 */
function generateReminderMessage(reminder) {
  const { preferredTime, timeZone } = reminder;
  const localTime = convertFromUTC(new Date(), timeZone);
  const message = `Bon voyage! It's ${localTime}. Take the supplement so you feel better tomorrow!`;

  // Ensure the message doesn't exceed MAX_SMS_LENGTH
  if (message.length > MAX_SMS_LENGTH) {
    return message.substring(0, MAX_SMS_LENGTH - 3) + '...';
  }

  return message;
}

/**
 * Validates the format of a phone number
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - True if phone number is valid, false otherwise
 */
function validatePhoneNumber(phoneNumber) {
  // Use a regex pattern to validate the phone number format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}

module.exports = {
  sendSMS,
  sendReminderSMS,
  generateReminderMessage,
  validatePhoneNumber
};