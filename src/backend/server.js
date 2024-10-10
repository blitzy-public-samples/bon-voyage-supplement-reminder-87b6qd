// src/backend/server.js
// Entry point for the supplement reminder backend application, responsible for initializing the server and starting the application

// Requirements addressed:
// - Backend Setup (2. TECHNICAL REQUIREMENTS/2.2 User Input Form)
// - Security and Compliance (2. TECHNICAL REQUIREMENTS/2.7 Security and Compliance)
// - Performance Optimization (2. TECHNICAL REQUIREMENTS/2.8 Performance Optimization)

require('dotenv').config(); // Load environment variables
const cluster = require('cluster');
const os = require('os');
const { app, startServer } = require('./app'); // Import the configured Express application and server starter
const logger = require('./utils/logger'); // Import logging utility for server logs
const databaseConfig = require('./config/database'); // Import database configuration
const smsConfig = require('./config/sms'); // Import SMS service configuration

const numCPUs = os.cpus().length;

// Global variable to store the HTTPS server instance
let server;

// Function to handle graceful shutdown of the server
const gracefulShutdown = async () => {
  try {
    logger.logEvent('info', 'Shutting down server gracefully', {}, true);

    // Close the HTTPS server
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          logger.logEvent('info', 'HTTPS server closed', {}, true);
          resolve();
        });
      });
    }

    // Close database connections
    if (databaseConfig.pool) {
      await databaseConfig.pool.end();
      logger.logEvent('info', 'Database connections closed', {}, true);
    }

    // Close Redis connections
    if (app.redisClient) {
      await app.redisClient.quit();
      logger.logEvent('info', 'Redis connections closed', {}, true);
    }

    logger.logEvent('info', 'Graceful shutdown completed', {}, true);
    process.exit(0);
  } catch (error) {
    logger.logEvent('error', 'Error during graceful shutdown', { error: error.message }, true);
    process.exit(1);
  }
};

// Use clustering to take advantage of multi-core systems
if (cluster.isMaster) {
  logger.logEvent('info', `Master process ${process.pid} is running`, {}, true);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.logEvent('warn', `Worker ${worker.process.pid} died`, { code, signal }, true);
    // Replace the dead worker
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection
  server = startServer(app);

  // Handle server errors
  server.on('error', (error) => {
    logger.logEvent('error', 'Server error occurred', { error: error.message }, true);
    gracefulShutdown();
  });
}

// Handle process events for graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.logEvent('error', 'Unhandled Rejection', { reason, promise }, true);
  gracefulShutdown();
});

process.on('uncaughtException', (error) => {
  logger.logEvent('error', 'Uncaught Exception', { error: error.message }, true);
  gracefulShutdown();
});

// Export the server for testing purposes
module.exports = server;