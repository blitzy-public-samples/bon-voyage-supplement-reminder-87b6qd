// src/backend/config/analytics.js

const dotenv = require('dotenv');
const logger = require('../utils/logger');
const { AnalyticsEvent } = require('../models/AnalyticsEvent');

// Load environment variables
dotenv.config();

// Define allowed events
const ALLOWED_EVENTS = [
  'REMINDER_SET',
  'REMINDER_SENT',
  'REMINDER_CANCELLED',
  'USER_REGISTERED',
  'QR_CODE_SCANNED'
];

// Analytics configuration object
const analyticsConfig = {
  enabled: process.env.ANALYTICS_ENABLED === 'true',
  trackingId: process.env.ANALYTICS_TRACKING_ID,
  allowedEvents: ALLOWED_EVENTS
};

/**
 * Tracks an analytics event
 * @param {string} eventType - Type of the event
 * @param {object} eventData - Data associated with the event
 * @param {string} userId - ID of the user associated with the event
 * @returns {Promise<void>} Resolves when the event is successfully tracked
 * @throws {Error} If the event type is invalid or event data is not a non-null object
 */
async function trackEvent(eventType, eventData, userId) {
  try {
    // Validate the eventType and eventData
    if (!ALLOWED_EVENTS.includes(eventType)) {
      throw new Error(`Invalid event type: ${eventType}`);
    }

    if (!eventData || typeof eventData !== 'object') {
      throw new Error('Event data must be a non-null object');
    }

    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }

    // Create a new AnalyticsEvent instance
    const analyticsEvent = await AnalyticsEvent.create({
      eventType,
      eventData,
      userId
    });

    // Log the event using the logger
    logger.logEvent('info', `Analytics event tracked: ${eventType}`, { eventId: analyticsEvent.id, userId }, false);

    // Here you could add additional logic to send the event to an external analytics service
    // if required in the future
  } catch (error) {
    logger.logEvent('error', 'Failed to track analytics event', { eventType, userId, error: error.message }, false);
    throw error;
  }
}

module.exports = {
  analyticsConfig,
  trackEvent
};

// Requirements addressed:
// 1. Analytics and Reporting (2. TECHNICAL REQUIREMENTS/2.6 Analytics and Reporting)
//    - Implementation of analytics tracking for key user actions
// 2. Data Privacy and Security (8. SECURITY CONSIDERATIONS/8.1 DATA PRIVACY)
//    - Ensuring that only allowed events are tracked
// 3. Error Handling and Logging (2. TECHNICAL REQUIREMENTS/2.7 Error Handling and Logging)
//    - Proper error handling and logging for analytics events