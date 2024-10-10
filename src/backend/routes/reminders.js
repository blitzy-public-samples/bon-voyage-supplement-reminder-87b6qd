/**
 * Express router module for handling reminder-related API routes in the supplement reminder application
 * 
 * Requirements addressed:
 * - API Design (5. SYSTEM DESIGN/5.3 API DESIGN)
 *   Implement a RESTful API design for communication between the frontend, backend, and external systems.
 * - Reminder Scheduling (2. TECHNICAL REQUIREMENTS/2.3 Reminder Scheduling)
 *   The system shall schedule automated text message reminders based on user-specified times.
 * - Security (8. SECURITY CONSIDERATIONS)
 *   Implement authentication and rate limiting for API endpoints.
 * - Error Handling (2. TECHNICAL REQUIREMENTS/2.7 Error Handling and Logging)
 *   Proper error handling and logging for all routes.
 * 
 * @module reminderRoutes
 */

const express = require('express');
const reminderController = require('../controllers/reminderController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter, smsLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route POST /api/reminders
 * @description Create a new reminder
 * @access Private
 */
router.post('/', [authenticate, smsLimiter], reminderController.createReminder);

/**
 * @route PUT /api/reminders/:reminderId
 * @description Update an existing reminder
 * @access Private
 */
router.put('/:reminderId', [authenticate, smsLimiter], reminderController.updateReminder);

/**
 * @route DELETE /api/reminders/:reminderId
 * @description Delete a reminder
 * @access Private
 */
router.delete('/:reminderId', authenticate, reminderController.deleteReminder);

/**
 * @route GET /api/reminders/:reminderId
 * @description Get a single reminder by ID
 * @access Private
 */
router.get('/:reminderId', authenticate, reminderController.getReminder);

/**
 * @route GET /api/reminders/user/:userId
 * @description Get all reminders for a user
 * @access Private
 */
router.get('/user/:userId', authenticate, reminderController.getUserReminders);

/**
 * Error handling middleware
 * Catches any errors thrown in the reminder routes and passes them to the global error handler
 */
router.use((err, req, res, next) => {
  logger.error('Error in reminder routes:', { error: err.message, stack: err.stack });
  next(err);
});

module.exports = router;