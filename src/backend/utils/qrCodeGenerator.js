const qrcode = require('qrcode'); // qrcode v1.5.1
const { logger, logEvent } = require('./logger');
const { validateUserInput } = require('./validation');
const { analyticsConfig, trackEvent } = require('../config/analytics');

// Global constants
const QR_CODE_SIZE = 200;
const QR_CODE_ERROR_CORRECTION_LEVEL = 'M';

/**
 * Generates a QR code for the given URL
 * @param {string} url - The URL to encode in the QR code
 * @param {object} options - Additional options for QR code generation
 * @returns {Promise<string>} Base64 encoded string of the generated QR code image
 * @throws {Error} If the URL is invalid or QR code generation fails
 */
async function generateQRCode(url, options = {}) {
  try {
    // Validate the input URL
    if (!validateUserInput(url)) {
      throw new Error('Invalid URL provided for QR code generation');
    }

    // Set default options if not provided
    const qrOptions = {
      errorCorrectionLevel: QR_CODE_ERROR_CORRECTION_LEVEL,
      width: QR_CODE_SIZE,
      ...options,
    };

    // Generate the QR code
    const qrCodeDataUrl = await qrcode.toDataURL(url, qrOptions);

    // Log the QR code generation event
    await logEvent('info', 'QR code generated', { url }, false);

    // Track the QR code generation as an analytics event if enabled
    if (analyticsConfig.enabled) {
      await trackEvent('QR_CODE_GENERATED', { url }, 'system');
    }

    return qrCodeDataUrl;
  } catch (error) {
    logger.error('Error generating QR code', { error: error.message, url });
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generates a QR code for a specific reminder URL
 * @param {string} reminderId - The ID of the reminder
 * @returns {Promise<string>} Base64 encoded string of the generated QR code image
 * @throws {Error} If the reminder ID is invalid or QR code generation fails
 */
async function generateReminderQRCode(reminderId) {
  try {
    if (!reminderId || typeof reminderId !== 'string') {
      throw new Error('Invalid reminder ID');
    }

    // Construct the reminder URL
    const reminderUrl = `${process.env.BASE_URL}/reminder/${reminderId}`;

    // Call generateQRCode with the constructed URL
    return await generateQRCode(reminderUrl);
  } catch (error) {
    logger.error('Error generating reminder QR code', { error: error.message, reminderId });
    throw new Error('Failed to generate reminder QR code');
  }
}

module.exports = {
  generateQRCode,
  generateReminderQRCode,
};

// Requirements addressed:
// 1. QR Code Generation (2. TECHNICAL REQUIREMENTS/2.4 QR Code Generation)
//    - Implementation of QR code generation for reminders
// 2. Error Handling and Logging (2. TECHNICAL REQUIREMENTS/2.7 Error Handling and Logging)
//    - Proper error handling and logging for QR code generation
// 3. Analytics and Reporting (2. TECHNICAL REQUIREMENTS/2.6 Analytics and Reporting)
//    - Tracking QR code generation events
// 4. Security and Input Validation (8. SECURITY CONSIDERATIONS/8.2 INPUT VALIDATION)
//    - Validating user input before generating QR codes