/**
 * Express router module for handling analytics-related routes in the supplement reminder application
 * 
 * Requirements addressed:
 * - Analytics and Reporting (2. TECHNICAL REQUIREMENTS/2.6 Analytics and Reporting)
 *   - Implement custom event tracking for key user actions (e.g., form submissions, reminder setups).
 *   - Develop a basic reporting module using Node.js to generate usage statistics from the database.
 * - Security (8. SECURITY CONSIDERATIONS)
 *   - Implement authentication and rate limiting for all routes.
 * - Error Handling (2. TECHNICAL REQUIREMENTS/2.7 Error Handling and Logging)
 *   - Implement consistent error handling across all routes.
 * 
 * @module analyticsRoutes
 */

const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route POST /api/analytics/event
 * @description Track an analytics event
 * @access Private
 */
router.post('/event', auth.authenticate, apiLimiter, asyncHandler(analyticsController.trackEvent));

/**
 * @route GET /api/analytics/user/:userId
 * @description Retrieve analytics events for a specific user
 * @access Private
 */
router.get('/user/:userId', auth.authenticate, apiLimiter, asyncHandler(analyticsController.getUserEvents));

/**
 * @route GET /api/analytics/events/:eventType
 * @description Retrieve analytics events of a specific type
 * @access Private
 */
router.get('/events/:eventType', auth.authenticate, apiLimiter, asyncHandler(analyticsController.getEventsByType));

/**
 * @route GET /api/analytics/report
 * @description Generate an analytics report for a given time period
 * @access Private
 */
router.get('/report', auth.authenticate, apiLimiter, asyncHandler(analyticsController.generateReport));

module.exports = router;