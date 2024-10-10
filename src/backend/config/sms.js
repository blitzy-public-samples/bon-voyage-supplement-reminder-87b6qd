// External dependencies
const dotenv = require('dotenv'); // v16.0.3
const twilio = require('twilio'); // v4.10.0

// Internal dependencies
const { logEvent } = require('../utils/logger');
const { encrypt } = require('../utils/encryption');

// Load environment variables
dotenv.config();

// Constants
const MAX_SMS_LENGTH = 160;
const RATE_LIMIT_INTERVAL = 60000; // 1 minute in milliseconds
const MAX_RETRIES = 3;

/**
 * Create and configure a Twilio client instance
 * @returns {object} Configured Twilio client instance
 * @throws {Error} If Twilio credentials are missing
 */
function createTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials are missing in environment variables');
  }

  return twilio(accountSid, authToken);
}

// SMS configuration object
const smsConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: encrypt(process.env.TWILIO_AUTH_TOKEN), // Encrypt the auth token for added security
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  twilioClient: createTwilioClient(),
};

// Validate SMS configuration
if (!smsConfig.accountSid || !smsConfig.authToken || !smsConfig.phoneNumber) {
  logEvent('error', 'SMS configuration is incomplete', { config: { ...smsConfig, twilioClient: 'Instance of Twilio' } });
  throw new Error('SMS configuration is incomplete. Please check your environment variables.');
}

// Export the SMS configuration and constants
module.exports = {
  smsConfig,
  MAX_SMS_LENGTH,
  RATE_LIMIT_INTERVAL,
  MAX_RETRIES,
};

// Log successful SMS configuration
logEvent('info', 'SMS configuration loaded successfully', { phoneNumber: smsConfig.phoneNumber });