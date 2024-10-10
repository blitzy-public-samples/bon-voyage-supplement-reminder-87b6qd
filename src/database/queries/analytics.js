const { Op } = require('sequelize');
const { sequelize } = require('../connection');
const Analytics = require('../models/analytics');

/**
 * Creates a new analytics event in the database
 * @param {Object} eventData - The data for the analytics event
 * @param {string} eventData.userId - The ID of the user associated with the event
 * @param {string} eventData.eventType - The type of the event
 * @param {Object} eventData.eventData - Additional data associated with the event
 * @returns {Promise<Analytics>} The created Analytics instance
 * 
 * Requirement: Analytics and Reporting
 * Location: 2. TECHNICAL REQUIREMENTS/2.6 Analytics and Reporting
 * Description: Implement custom event tracking for key user actions (e.g., form submissions, reminder setups).
 */
const createAnalyticsEvent = async ({ userId, eventType, eventData }) => {
  try {
    return await Analytics.createEvent({ userId, eventType, ...eventData });
  } catch (error) {
    console.error('Error creating analytics event:', error);
    throw error;
  }
};

/**
 * Retrieves analytics events based on specified criteria
 * @param {Object} queryParams - The parameters for querying analytics events
 * @param {string} [queryParams.userId] - The ID of the user to filter events for
 * @param {string} [queryParams.eventType] - The type of events to filter
 * @param {Date} [queryParams.startDate] - The start date for the date range
 * @param {Date} [queryParams.endDate] - The end date for the date range
 * @param {number} [queryParams.limit=100] - The maximum number of events to return
 * @param {number} [queryParams.offset=0] - The number of events to skip
 * @returns {Promise<Analytics[]>} An array of Analytics instances
 * 
 * Requirement: Analytics and Reporting
 * Location: 2. TECHNICAL REQUIREMENTS/2.6 Analytics and Reporting
 * Description: Develop a basic reporting module using Node.js to generate usage statistics from the database.
 */
const getAnalyticsEvents = async ({ userId, eventType, startDate, endDate, limit = 100, offset = 0 }) => {
  try {
    const whereClause = {};
    if (userId) whereClause.userId = userId;
    if (eventType) whereClause.eventType = eventType;
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = startDate;
      if (endDate) whereClause.createdAt[Op.lte] = endDate;
    }

    return await Analytics.findAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  } catch (error) {
    console.error('Error retrieving analytics events:', error);
    throw error;
  }
};

/**
 * Generates a summary of analytics data
 * @param {Object} summaryParams - The parameters for generating the summary
 * @param {Date} summaryParams.startDate - The start date for the summary period
 * @param {Date} summaryParams.endDate - The end date for the summary period
 * @returns {Promise<Object>} An object containing summary statistics
 * 
 * Requirement: Analytics and Reporting
 * Location: 2. TECHNICAL REQUIREMENTS/2.6 Analytics and Reporting
 * Description: Create a simple dashboard for viewing analytics data, using a JavaScript charting library (e.g., Chart.js).
 */
const getAnalyticsSummary = async ({ startDate, endDate }) => {
  try {
    const summary = await Analytics.findAll({
      attributes: [
        [sequelize().fn('COUNT', sequelize().col('id')), 'totalEvents'],
        [sequelize().fn('COUNT', sequelize().fn('DISTINCT', sequelize().col('userId'))), 'uniqueUsers'],
        [sequelize().fn('COUNT', sequelize().literal("CASE WHEN eventType = 'reminder_sent' THEN 1 END")), 'remindersSent']
      ],
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    return {
      totalEvents: summary[0].get('totalEvents'),
      uniqueUsers: summary[0].get('uniqueUsers'),
      remindersSent: summary[0].get('remindersSent')
    };
  } catch (error) {
    console.error('Error generating analytics summary:', error);
    throw error;
  }
};

/**
 * Deletes a specific analytics event
 * @param {string} eventId - The UUID of the event to delete
 * @returns {Promise<number>} The number of deleted records
 * 
 * Requirement: Data Storage and Management
 * Location: 2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management
 * Description: Implement database access layers using an ORM (e.g., Sequelize) for Node.js.
 */
const deleteAnalyticsEvent = async (eventId) => {
  try {
    return await Analytics.destroy({
      where: { id: eventId }
    });
  } catch (error) {
    console.error('Error deleting analytics event:', error);
    throw error;
  }
};

/**
 * Deletes all analytics events for a specific user
 * @param {string} userId - The UUID of the user whose events should be deleted
 * @returns {Promise<number>} The number of deleted records
 * 
 * Requirement: Data Storage and Management
 * Location: 2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management
 * Description: Implement database access layers using an ORM (e.g., Sequelize) for Node.js.
 */
const deleteUserAnalytics = async (userId) => {
  try {
    return await Analytics.destroy({
      where: { userId }
    });
  } catch (error) {
    console.error('Error deleting user analytics:', error);
    throw error;
  }
};

module.exports = {
  createAnalyticsEvent,
  getAnalyticsEvents,
  getAnalyticsSummary,
  deleteAnalyticsEvent,
  deleteUserAnalytics
};