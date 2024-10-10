const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter, smsLimiter, authLimiter } = require('../middleware/rateLimiter');

/**
 * @route POST /api/users/register
 * @description Register a new user and create their first reminder
 * @access Public
 * @requirements 2. TECHNICAL REQUIREMENTS/2.2 User Input Form
 *               2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management
 *               2. TECHNICAL REQUIREMENTS/2.6 Analytics and Reporting
 */
router.post('/register', smsLimiter, authLimiter, userController.registerUser);

/**
 * @route PUT /api/users/:userId
 * @description Update user information and adjust reminders if necessary
 * @access Private
 * @requirements 2. TECHNICAL REQUIREMENTS/2.2 User Input Form
 *               2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management
 *               2. TECHNICAL REQUIREMENTS/2.6 Analytics and Reporting
 */
router.put('/:userId', authenticate, apiLimiter, userController.updateUser);

/**
 * @route DELETE /api/users/:userId
 * @description Delete a user and all associated reminders
 * @access Private
 * @requirements 2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management
 *               2. TECHNICAL REQUIREMENTS/2.6 Analytics and Reporting
 */
router.delete('/:userId', authenticate, apiLimiter, userController.deleteUser);

/**
 * @route GET /api/users/:userId/reminders
 * @description Retrieve all reminders for a specific user
 * @access Private
 * @requirements 2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management
 */
router.get('/:userId/reminders', authenticate, apiLimiter, userController.getUserReminders);

module.exports = router;