const rateLimit = require('express-rate-limit');
const { logEvent } = require('../utils/logger');

// Constants for rate limiting
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_REQUESTS = 100;
const SMS_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const SMS_MAX_REQUESTS = 5;

/**
 * Creates and configures a rate limiter middleware
 * @param {Object} options - Options for configuring the rate limiter
 * @returns {Function} Rate limiter middleware function
 */
const createRateLimiter = (options) => {
  const defaultOptions = {
    windowMs: DEFAULT_WINDOW_MS,
    max: DEFAULT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logEvent('warn', 'Rate limit exceeded', { ip: req.ip, path: req.path });
      res.status(429).json({
        error: 'Too many requests, please try again later.',
      });
    },
    keyGenerator: (req) => {
      return req.ip; // Use IP address as the default key
    },
    skip: (req) => {
      // Skip rate limiting for certain paths or conditions if needed
      return false;
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return rateLimit(mergedOptions);
};

/**
 * Rate limiter middleware for general API endpoints
 * @type {Function}
 */
const apiLimiter = createRateLimiter({
  windowMs: DEFAULT_WINDOW_MS,
  max: DEFAULT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

/**
 * Rate limiter middleware specifically for SMS-related endpoints
 * @type {Function}
 */
const smsLimiter = createRateLimiter({
  windowMs: SMS_WINDOW_MS,
  max: SMS_MAX_REQUESTS,
  message: 'Too many SMS requests from this IP, please try again after an hour',
});

/**
 * Rate limiter middleware for authentication endpoints
 * @type {Function}
 */
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again after 15 minutes',
});

module.exports = {
  createRateLimiter,
  apiLimiter,
  smsLimiter,
  authLimiter,
};

// Requirements addressed:
// 1. Security (8. SECURITY CONSIDERATIONS/8.3 SECURITY PROTOCOLS/8.3.2 Rate Limiting)
//    - Implementation of rate limiting for API, SMS, and authentication endpoints
// 2. Scalability (2. TECHNICAL REQUIREMENTS/2.8 Scalability and Performance)
//    - Configurable rate limiting options for different types of requests
// 3. Logging (2. TECHNICAL REQUIREMENTS/2.7 Error Handling and Logging)
//    - Integration with the logging system for rate limit violations
// 4. Flexibility
//    - Customizable rate limiter creation function for different use cases
// 5. Best Practices
//    - Use of standardHeaders and removal of deprecated legacyHeaders
//    - Proper error responses with status code 429 for rate limit exceeded