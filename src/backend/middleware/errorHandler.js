const { logger, logEvent } = require('../utils/logger');
const { databaseConfig } = require('../config/database');
const { smsConfig } = require('../config/sms');

/**
 * Express middleware for handling errors
 * @param {Error} err - The error object
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {function} next - The next middleware function
 * 
 * Requirements addressed:
 * - Error Handling (8. SECURITY CONSIDERATIONS/8.3 SECURITY PROTOCOLS/8.3.2 Application Security)
 * - Logging of errors without exposing sensitive information (8. SECURITY CONSIDERATIONS/8.3 SECURITY PROTOCOLS/8.3.2 Application Security)
 */
function errorHandler(err, req, res, next) {
  logErrorSecurely(err, req);

  const statusCode = determineStatusCode(err);
  const errorResponse = prepareErrorResponse(err, statusCode);

  if (err.name === 'SequelizeError') {
    errorResponse.error = handleDatabaseError(err);
  } else if (err.name === 'TwilioError') {
    errorResponse.error = handleSMSError(err);
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Logs error details securely
 * @param {Error} err - The error object
 * @param {object} req - The request object
 */
function logErrorSecurely(err, req) {
  const logData = {
    errorMessage: err.message,
    errorName: err.name,
    errorCode: err.code,
    requestMethod: req.method,
    requestUrl: req.url,
    requestIp: req.ip,
    requestHeaders: maskSensitiveHeaders(req.headers),
    requestBody: maskSensitiveData(req.body)
  };

  logEvent('error', 'An error occurred', logData, true);
}

/**
 * Determines the appropriate status code based on the error type
 * @param {Error} err - The error object
 * @returns {number} The HTTP status code
 */
function determineStatusCode(err) {
  if (err.status) return err.status;
  if (err.name === 'ValidationError') return 400;
  if (err.name === 'UnauthorizedError') return 401;
  if (err.name === 'ForbiddenError') return 403;
  if (err.name === 'NotFoundError') return 404;
  if (err.name === 'ConflictError') return 409;
  if (err.name === 'TooManyRequestsError') return 429;
  return 500;
}

/**
 * Prepares a sanitized error message for the client
 * @param {Error} err - The error object
 * @param {number} statusCode - The HTTP status code
 * @returns {object} Formatted error object for client response
 */
function prepareErrorResponse(err, statusCode) {
  const response = {
    error: {
      message: 'An error occurred while processing your request.',
      code: statusCode
    }
  };

  if (process.env.NODE_ENV === 'development') {
    response.error.details = err.message;
    response.error.stack = err.stack;
  }

  return response;
}

/**
 * Handles specific database-related errors
 * @param {Error} err - The database error object
 * @returns {object} Formatted error object for database errors
 */
function handleDatabaseError(err) {
  logEvent('error', 'Database error occurred', { error: err.message }, true);

  if (err.name === 'SequelizeConnectionError') {
    return {
      message: 'Unable to connect to the database. Please try again later.',
      code: 'DB_CONNECTION_ERROR'
    };
  }

  if (err.name === 'SequelizeQueryError') {
    return {
      message: 'An error occurred while processing your request. Please try again.',
      code: 'DB_QUERY_ERROR'
    };
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return {
      message: 'The data you provided conflicts with existing records.',
      code: 'DB_UNIQUE_CONSTRAINT_ERROR'
    };
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return {
      message: 'The operation failed due to a foreign key constraint.',
      code: 'DB_FOREIGN_KEY_ERROR'
    };
  }

  return {
    message: 'A database error occurred. Please try again later.',
    code: 'DB_GENERIC_ERROR'
  };
}

/**
 * Handles specific SMS-related errors
 * @param {Error} err - The SMS error object
 * @returns {object} Formatted error object for SMS errors
 */
function handleSMSError(err) {
  logEvent('error', 'SMS error occurred', { error: err.message }, true);

  if (err.code === 20003) {
    return {
      message: 'Unable to send SMS at this time. Please try again later.',
      code: 'SMS_AUTHENTICATION_ERROR'
    };
  }

  if (err.code === 20429) {
    return {
      message: 'Too many SMS requests. Please try again later.',
      code: 'SMS_RATE_LIMIT_ERROR'
    };
  }

  if (err.code === 21211) {
    return {
      message: 'The provided phone number is invalid.',
      code: 'SMS_INVALID_PHONE_NUMBER'
    };
  }

  if (err.code === 21408) {
    return {
      message: 'Unable to send SMS due to carrier restrictions.',
      code: 'SMS_CARRIER_RESTRICTION'
    };
  }

  return {
    message: 'An error occurred while sending the SMS. Please try again.',
    code: 'SMS_GENERIC_ERROR'
  };
}

/**
 * Masks sensitive data in the request body
 * @param {object} data - The request body object
 * @returns {object} Masked request body object
 */
function maskSensitiveData(data) {
  const sensitiveFields = ['password', 'phoneNumber', 'creditCard', 'ssn', 'email'];
  const maskedData = { ...data };

  for (const field of sensitiveFields) {
    if (maskedData[field]) {
      maskedData[field] = '********';
    }
  }

  return maskedData;
}

/**
 * Masks sensitive headers in the request
 * @param {object} headers - The request headers object
 * @returns {object} Masked request headers object
 */
function maskSensitiveHeaders(headers) {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  const maskedHeaders = { ...headers };

  for (const header of sensitiveHeaders) {
    if (maskedHeaders[header]) {
      maskedHeaders[header] = '********';
    }
  }

  return maskedHeaders;
}

module.exports = errorHandler;