const moment = require('moment-timezone');
const { AnalyticsEvent } = require('../models/AnalyticsEvent');
const { analyticsConfig } = require('../config/analytics');
const logger = require('../utils/logger');

/**
 * Tracks an analytics event if analytics is enabled
 * @param {string} userId - The ID of the user associated with the event
 * @param {string} eventType - The type of event being tracked
 * @param {object} eventData - Additional data associated with the event
 * @returns {Promise<void>} Resolves when the event is successfully tracked or if analytics is disabled
 * @throws {Error} If the event type is invalid or if there's an error during event creation
 */
async function trackEvent(userId, eventType, eventData) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }

  if (!eventType || typeof eventType !== 'string') {
    throw new Error('Invalid eventType: must be a non-empty string');
  }

  if (!eventData || typeof eventData !== 'object') {
    throw new Error('Invalid eventData: must be a non-null object');
  }

  try {
    if (!analyticsConfig.enabled) {
      logger.logEvent('info', 'Analytics tracking skipped (disabled)', { userId, eventType }, false);
      return;
    }

    if (!analyticsConfig.allowedEvents.includes(eventType)) {
      throw new Error(`Invalid event type: ${eventType}`);
    }

    const event = await AnalyticsEvent.create({
      userId,
      eventType,
      eventData,
      createdAt: moment().toDate()
    });

    logger.logEvent('info', 'Analytics event tracked', { userId, eventType, eventId: event.id }, true, userId);
  } catch (error) {
    logger.logEvent('error', 'Failed to track analytics event', { userId, eventType, error: error.message }, false);
    throw error;
  }
}

/**
 * Retrieves analytics events for a specific user
 * @param {string} userId - The ID of the user to retrieve events for
 * @param {object} options - Additional options for filtering and sorting events
 * @returns {Promise<Array>} Array of analytics events for the specified user
 * @throws {Error} If there's an error during event retrieval
 */
async function getEventsByUser(userId, options = {}) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }

  try {
    const { startDate, endDate, limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryOptions = {
      where: { userId },
      order: [[sortBy, sortOrder]],
      limit: Math.min(limit, 1000), // Enforce a maximum limit to prevent excessive data retrieval
      offset
    };

    if (startDate) {
      queryOptions.where.createdAt = { [AnalyticsEvent.Sequelize.Op.gte]: moment(startDate).toDate() };
    }

    if (endDate) {
      queryOptions.where.createdAt = {
        ...queryOptions.where.createdAt,
        [AnalyticsEvent.Sequelize.Op.lte]: moment(endDate).toDate()
      };
    }

    const events = await AnalyticsEvent.findAll(queryOptions);
    logger.logEvent('info', 'Retrieved user analytics events', { userId, eventCount: events.length }, false);
    return events;
  } catch (error) {
    logger.logEvent('error', 'Failed to retrieve user analytics events', { userId, error: error.message }, false);
    throw error;
  }
}

/**
 * Retrieves analytics events of a specific type
 * @param {string} eventType - The type of events to retrieve
 * @param {object} options - Additional options for filtering and sorting events
 * @returns {Promise<Array>} Array of analytics events of the specified type
 * @throws {Error} If the event type is invalid or if there's an error during event retrieval
 */
async function getEventsByType(eventType, options = {}) {
  if (!eventType || typeof eventType !== 'string') {
    throw new Error('Invalid eventType: must be a non-empty string');
  }

  try {
    if (!analyticsConfig.allowedEvents.includes(eventType)) {
      throw new Error(`Invalid event type: ${eventType}`);
    }

    const { startDate, endDate, limit = 100, offset = 0, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryOptions = {
      where: { eventType },
      order: [[sortBy, sortOrder]],
      limit: Math.min(limit, 1000), // Enforce a maximum limit to prevent excessive data retrieval
      offset
    };

    if (startDate) {
      queryOptions.where.createdAt = { [AnalyticsEvent.Sequelize.Op.gte]: moment(startDate).toDate() };
    }

    if (endDate) {
      queryOptions.where.createdAt = {
        ...queryOptions.where.createdAt,
        [AnalyticsEvent.Sequelize.Op.lte]: moment(endDate).toDate()
      };
    }

    const events = await AnalyticsEvent.findAll(queryOptions);
    logger.logEvent('info', 'Retrieved analytics events by type', { eventType, eventCount: events.length }, false);
    return events;
  } catch (error) {
    logger.logEvent('error', 'Failed to retrieve analytics events by type', { eventType, error: error.message }, false);
    throw error;
  }
}

/**
 * Generates a summary report of analytics events for a given time period
 * @param {string} startDate - The start date for the report period
 * @param {string} endDate - The end date for the report period
 * @returns {Promise<object>} Object containing summary statistics of analytics events
 * @throws {Error} If there's an error during report generation
 */
async function generateAnalyticsReport(startDate, endDate) {
  if (!startDate || !endDate) {
    throw new Error('Both startDate and endDate are required');
  }

  try {
    const start = moment(startDate).startOf('day').toDate();
    const end = moment(endDate).endOf('day').toDate();

    if (start >= end) {
      throw new Error('startDate must be before endDate');
    }

    const events = await AnalyticsEvent.findAll({
      where: {
        createdAt: {
          [AnalyticsEvent.Sequelize.Op.between]: [start, end]
        }
      },
      attributes: [
        'eventType',
        [AnalyticsEvent.Sequelize.fn('COUNT', AnalyticsEvent.Sequelize.col('id')), 'count']
      ],
      group: ['eventType']
    });

    const totalEvents = events.reduce((sum, event) => sum + parseInt(event.get('count'), 10), 0);
    const uniqueUsers = await AnalyticsEvent.count({
      distinct: true,
      col: 'userId',
      where: {
        createdAt: {
          [AnalyticsEvent.Sequelize.Op.between]: [start, end]
        }
      }
    });

    const report = {
      startDate: start,
      endDate: end,
      totalEvents,
      uniqueUsers,
      eventBreakdown: events.map(event => ({
        eventType: event.eventType,
        count: parseInt(event.get('count'), 10)
      }))
    };

    logger.logEvent('info', 'Generated analytics report', {
      startDate,
      endDate,
      totalEvents,
      uniqueUsers
    }, false);

    return report;
  } catch (error) {
    logger.logEvent('error', 'Failed to generate analytics report', {
      startDate,
      endDate,
      error: error.message
    }, false);
    throw error;
  }
}

module.exports = {
  trackEvent,
  getEventsByUser,
  getEventsByType,
  generateAnalyticsReport
};

// Requirements addressed:
// 1. Analytics and Reporting (2. TECHNICAL REQUIREMENTS/2.6 Analytics and Reporting)
//    - Implementation of comprehensive analytics tracking and reporting functions
// 2. Data Privacy and Security (8. SECURITY CONSIDERATIONS/8.1 DATA PRIVACY)
//    - Ensuring that only allowed events are tracked
//    - Proper error handling and logging for all operations
// 3. Error Handling and Logging (2. TECHNICAL REQUIREMENTS/2.7 Error Handling and Logging)
//    - Comprehensive error handling and logging for all functions
// 4. Scalability and Performance
//    - Implementation of pagination and limits to prevent excessive data retrieval
// 5. Code Quality and Maintainability
//    - Clear function documentation and error messages
//    - Consistent use of async/await for better readability and error handling