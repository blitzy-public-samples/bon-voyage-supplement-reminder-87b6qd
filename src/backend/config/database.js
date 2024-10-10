// src/backend/config/database.js
// Configuration file for database settings in the supplement reminder application

// Load environment variables for database configuration
require('dotenv').config();

// Constants for database connection pool settings
const MAX_POOL_SIZE = 10;
const MIN_POOL_SIZE = 2;
const IDLE_TIMEOUT_MILLIS = 10000;

/**
 * Database configuration object
 * @type {Object}
 * @property {string} host - Database host address
 * @property {number} port - Database port number
 * @property {string} database - Database name
 * @property {string} user - Database user
 * @property {string} password - Database password
 * @property {string} dialect - Database dialect (postgres)
 * @property {Object} pool - Connection pool configuration
 * @property {boolean} ssl - SSL configuration for database connection
 * @property {Object} dialectOptions - Additional options for the database dialect
 */
const databaseConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  pool: {
    max: MAX_POOL_SIZE,
    min: MIN_POOL_SIZE,
    idle: IDLE_TIMEOUT_MILLIS,
    acquire: 30000, // Maximum time, in milliseconds, that a connection can be idle before being released
  },
  ssl: process.env.DB_SSL === 'true',
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
  },
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
};

/**
 * Validate database configuration
 * @throws {Error} If any required configuration is missing
 */
function validateDatabaseConfig() {
  const requiredFields = ['host', 'database', 'user', 'password'];
  for (const field of requiredFields) {
    if (!databaseConfig[field]) {
      throw new Error(`Missing required database configuration: ${field}`);
    }
  }
}

// Validate the configuration immediately
validateDatabaseConfig();

/**
 * Exports the database configuration object and validation function
 * This configuration is used to set up the connection to the PostgreSQL database
 * for the supplement reminder application.
 * 
 * Requirements addressed:
 * - Data Storage and Management (2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management)
 *   Set up a PostgreSQL database with appropriate tables for user data and reminder schedules
 * - Security (2. TECHNICAL REQUIREMENTS/2.6 Security)
 *   Implement SSL for database connections when enabled
 * - Error Handling (2. TECHNICAL REQUIREMENTS/2.7 Error Handling and Logging)
 *   Validate database configuration and throw errors for missing required fields
 */
module.exports = {
  databaseConfig,
  validateDatabaseConfig,
};