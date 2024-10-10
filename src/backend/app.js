/**
 * Main application file for the supplement reminder backend, configuring Express server, middleware, and routes
 * 
 * Requirements addressed:
 * - Backend Setup (2. TECHNICAL REQUIREMENTS/2.2 User Input Form): Implement server-side validation in Node.js to double-check user inputs before processing.
 * - Security and Compliance (2. TECHNICAL REQUIREMENTS/2.7 Security and Compliance): Implement HTTPS using TLS 1.3 or higher for all client-server communications.
 * - Performance Optimization (2. TECHNICAL REQUIREMENTS/2.8 Performance Optimization): Implement server-side caching using Redis to reduce database load.
 */

// Import required modules
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const redis = require('redis');
const https = require('https');
const fs = require('fs');

// Import internal modules
const { databaseConfig } = require('./config/database');
const { smsConfig } = require('./config/sms');
const { analyticsConfig } = require('./config/analytics');
const routes = require('./routes');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, smsLimiter, authLimiter } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

/**
 * Configures and applies middleware to the Express app
 * @param {Express.Application} app - The Express application instance
 */
function configureMiddleware(app) {
  // Apply helmet middleware for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // Enable CORS with appropriate configuration
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 600,
  }));

  // Parse JSON and URL-encoded bodies
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Apply compression middleware
  app.use(compression());

  // Set up Morgan for request logging
  app.use(morgan('combined', { stream: { write: message => logger.logEvent('info', message.trim()) } }));

  // Apply rate limiting middleware
  app.use('/api/', apiLimiter);
  app.use('/api/sms', smsLimiter);
  app.use('/api/auth', authLimiter);

  // Set up Redis for caching
  app.use((req, res, next) => {
    req.redisClient = redisClient;
    next();
  });
}

/**
 * Configures and applies routes to the Express app
 * @param {Express.Application} app - The Express application instance
 */
function configureRoutes(app) {
  // Apply main router from routes/index.js
  app.use('/api', routes);

  // Set up a catch-all route for undefined routes
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Apply error handling middleware
  app.use(errorHandler);
}

/**
 * Starts the Express server with HTTPS
 * @param {Express.Application} app - The Express application instance
 * @returns {https.Server} The created HTTPS server instance
 */
function startServer(app) {
  const port = process.env.PORT || 3000;

  // Read SSL certificate files
  const privateKey = fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8');
  const certificate = fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8');
  const ca = fs.readFileSync(process.env.SSL_CA_PATH, 'utf8');

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  };

  const httpsServer = https.createServer(credentials, app);

  httpsServer.listen(port, () => {
    logger.logEvent('info', `HTTPS Server started on port ${port}`);
  });

  return httpsServer;
}

// Configure middleware
configureMiddleware(app);

// Configure routes
configureRoutes(app);

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    logger.logEvent('info', 'Connected to Redis');
  } catch (error) {
    logger.logEvent('error', 'Failed to connect to Redis', { error: error.message });
  }
})();

// Start the server if this file is run directly
if (require.main === module) {
  startServer(app);
}

// Export the app for testing purposes
module.exports = { app, startServer };