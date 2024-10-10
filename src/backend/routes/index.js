/**
 * Main router file that combines and exports all API routes for the supplement reminder application
 * 
 * Requirements addressed:
 * - API Design (5. SYSTEM DESIGN/5.3 API DESIGN): Implement a RESTful API design for communication between the frontend, backend, and external systems.
 * - Security (8. SECURITY CONSIDERATIONS): Apply security middleware and error handling.
 * - Error Handling (2. TECHNICAL REQUIREMENTS/2.7 Error Handling and Logging): Implement consistent error handling across all routes.
 */

const express = require('express');
const analyticsRoutes = require('./analytics');
const reminderRoutes = require('./reminders');
const userRoutes = require('./users');
const helmet = require('helmet');
const cors = require('cors');
const { errorHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Create a new Express router instance
const router = express.Router();

/**
 * Configures and combines all imported routes
 * @returns {express.Router} Configured router with all application routes
 */
function configureRoutes() {
  // Apply security middleware
  router.use(helmet());
  router.use(cors());

  // Mount analytics routes under '/api/analytics'
  router.use('/api/analytics', analyticsRoutes);

  // Mount reminder routes under '/api/reminders'
  router.use('/api/reminders', reminderRoutes);

  // Mount user routes under '/api/users'
  router.use('/api/users', userRoutes);

  // Apply global error handling middleware
  router.use(errorHandler);

  // 404 handler for undefined routes
  router.use((req, res) => {
    logger.warn(`404 - Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource does not exist.'
    });
  });

  return router;
}

// Export the configured router
module.exports = configureRoutes();