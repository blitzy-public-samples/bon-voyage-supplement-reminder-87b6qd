const winston = require('winston');
const dotenv = require('dotenv');
const { analyticsConfig, trackEvent } = require('../config/analytics');
const { encrypt } = require('./encryption');

dotenv.config();

// Constants
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || './logs/app.log';
const SENSITIVE_FIELDS = ['password', 'phoneNumber', 'email', 'creditCard', 'ssn'];
const VALID_LOG_LEVELS = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

/**
 * Creates and configures a Winston logger instance
 * @returns {winston.Logger} Configured Winston logger instance
 */
const createLogger = () => {
  return winston.createLogger({
    level: LOG_LEVEL,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'reminder-app' },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
      new winston.transports.File({ filename: LOG_FILE_PATH }),
    ],
    exceptionHandlers: [
      new winston.transports.File({ filename: 'exceptions.log' })
    ],
    rejectionHandlers: [
      new winston.transports.File({ filename: 'rejections.log' })
    ],
  });
};

const logger = createLogger();

/**
 * Masks sensitive data in log messages
 * @param {object} data - Data object to mask
 * @returns {object} Data object with sensitive information masked
 */
const maskSensitiveData = (data) => {
  const maskedData = { ...data };
  SENSITIVE_FIELDS.forEach((field) => {
    if (maskedData[field]) {
      maskedData[field] = '********';
    }
  });
  return maskedData;
};

/**
 * Logs an event and optionally tracks it as an analytics event
 * @param {string} level - Log level (e.g., 'info', 'error')
 * @param {string} message - Log message
 * @param {object} [data={}] - Additional data to log
 * @param {boolean} [trackAnalytics=false] - Whether to track this event in analytics
 * @param {string} [userId] - User ID for analytics tracking
 * @returns {Promise<void>} Resolves when the event is logged and tracked (if applicable)
 * @throws {Error} If invalid parameters are provided
 */
const logEvent = async (level, message, data = {}, trackAnalytics = false, userId = null) => {
  if (!VALID_LOG_LEVELS.includes(level)) {
    throw new Error(`Invalid log level: ${level}`);
  }
  if (typeof message !== 'string' || message.trim() === '') {
    throw new Error('Message must be a non-empty string');
  }
  if (typeof data !== 'object' || data === null) {
    throw new Error('Data must be an object');
  }

  try {
    const maskedData = maskSensitiveData(data);
    const encryptedData = {};

    for (const [key, value] of Object.entries(maskedData)) {
      if (typeof value === 'string' && value === '********') {
        encryptedData[key] = encrypt(data[key]);
      } else {
        encryptedData[key] = value;
      }
    }

    logger[level](message, { ...encryptedData, timestamp: new Date().toISOString() });

    if (trackAnalytics && analyticsConfig.enabled) {
      if (!userId) {
        logger.warn('Analytics tracking requested without userId', { message });
      } else {
        await trackEvent(message, encryptedData, userId);
      }
    }
  } catch (error) {
    logger.error('Error in logEvent function', { 
      error: error.message, 
      stack: error.stack,
      originalMessage: message,
      originalLevel: level
    });
  }
};

/**
 * Creates a child logger with additional default metadata
 * @param {object} defaultMeta - Default metadata to include in all log messages
 * @returns {object} Child logger instance
 */
const createChildLogger = (defaultMeta) => {
  const childLogger = logger.child(defaultMeta);
  return {
    logEvent: (level, message, data = {}, trackAnalytics = false, userId = null) => 
      logEvent(level, message, { ...defaultMeta, ...data }, trackAnalytics, userId)
  };
};

module.exports = {
  logger,
  logEvent,
  createChildLogger,
};

// Requirements addressed:
// 1. Monitoring and Logging (8. SECURITY CONSIDERATIONS/8.3 SECURITY PROTOCOLS/8.3.3 Monitoring and Incident Response)
//    - Implementation of centralized logging system using Winston
//    - Handling of uncaught exceptions and unhandled rejections
// 2. Analytics and Reporting (2. TECHNICAL REQUIREMENTS/2.6 Analytics and Reporting)
//    - Integration with analytics tracking for key user actions
// 3. Data Privacy and Security (8. SECURITY CONSIDERATIONS/8.1 DATA PRIVACY)
//    - Masking and encryption of sensitive data in logs
// 4. Error Handling (2. TECHNICAL REQUIREMENTS/2.7 Error Handling and Logging)
//    - Proper error handling and logging for all operations
// 5. Scalability and Maintainability
//    - Implementation of createChildLogger for easier context-based logging