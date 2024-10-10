const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateUserId, validateEventType, validateDateRange } = require('../utils/validation');

/**
 * Handles POST request to track an analytics event
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>} Sends HTTP response with status of event tracking
 */
const trackEvent = asyncHandler(async (req, res) => {
  const { userId, eventType, eventData } = req.body;

  try {
    validateUserId(userId);
    validateEventType(eventType);

    await analyticsService.trackEvent(userId, eventType, eventData);
    logger.logEvent('info', `Analytics event tracked: ${eventType}`, { userId, eventType }, true, userId);
    res.status(201).json({ message: 'Event tracked successfully' });
  } catch (error) {
    logger.logEvent('error', 'Failed to track analytics event', { userId, eventType, error: error.message });
    res.status(400).json({ message: error.message });
  }
});

/**
 * Handles GET request to retrieve analytics events for a specific user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>} Sends HTTP response with user's analytics events
 */
const getUserEvents = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, offset = 0, startDate, endDate } = req.query;

  try {
    validateUserId(userId);
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      startDate,
      endDate
    };

    const events = await analyticsService.getEventsByUser(userId, options);
    res.status(200).json(events);
  } catch (error) {
    logger.logEvent('error', 'Failed to retrieve user events', { userId, error: error.message });
    res.status(400).json({ message: error.message });
  }
});

/**
 * Handles GET request to retrieve analytics events of a specific type
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>} Sends HTTP response with events of specified type
 */
const getEventsByType = asyncHandler(async (req, res) => {
  const { eventType } = req.params;
  const { limit = 10, offset = 0, startDate, endDate } = req.query;

  try {
    validateEventType(eventType);
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      startDate,
      endDate
    };

    const events = await analyticsService.getEventsByType(eventType, options);
    res.status(200).json(events);
  } catch (error) {
    logger.logEvent('error', 'Failed to retrieve events by type', { eventType, error: error.message });
    res.status(400).json({ message: error.message });
  }
});

/**
 * Handles GET request to generate an analytics report for a given time period
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {Promise<void>} Sends HTTP response with generated analytics report
 */
const generateReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    validateDateRange(startDate, endDate);

    const report = await analyticsService.generateAnalyticsReport(startDate, endDate);
    res.status(200).json(report);
  } catch (error) {
    logger.logEvent('error', 'Failed to generate analytics report', { startDate, endDate, error: error.message });
    res.status(400).json({ message: error.message });
  }
});

module.exports = {
  trackEvent,
  getUserEvents,
  getEventsByType,
  generateReport
};

// Requirements addressed:
// 1. Analytics and Reporting (2. TECHNICAL REQUIREMENTS/2.6 Analytics and Reporting)
//    - Implementation of comprehensive analytics tracking and reporting endpoints
// 2. Data Privacy and Security (8. SECURITY CONSIDERATIONS/8.1 DATA PRIVACY)
//    - Proper validation of user inputs
//    - Use of asyncHandler for consistent error handling
// 3. Error Handling and Logging (2. TECHNICAL REQUIREMENTS/2.7 Error Handling and Logging)
//    - Comprehensive error handling and logging for all endpoints
// 4. Scalability and Performance
//    - Implementation of pagination (limit and offset) for event retrieval
// 5. Code Quality and Maintainability
//    - Clear function documentation
//    - Consistent use of asyncHandler for better readability and error handling
// 6. RESTful API Design
//    - Proper use of HTTP methods and status codes
//    - Consistent response format across endpoints