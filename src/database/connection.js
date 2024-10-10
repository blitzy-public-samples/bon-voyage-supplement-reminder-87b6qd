const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const databaseConfig = require('../config/database.json');

// Load environment variables
dotenv.config();

// Global variable to hold the Sequelize instance
let sequelize;

/**
 * Initialize the database connection using Sequelize
 * @returns {Promise<Sequelize>} Resolves with the Sequelize instance
 * @throws {Error} If unable to connect to the database
 */
const initializeDatabase = async () => {
  try {
    // Determine the current environment
    const env = process.env.NODE_ENV || 'development';
    const config = databaseConfig[env];

    // Validate configuration
    if (!config) {
      throw new Error(`Invalid environment: ${env}`);
    }

    // Resolve environment variables in the configuration
    const resolvedConfig = Object.entries(config).reduce((acc, [key, value]) => {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const envVar = value.slice(2, -1);
        acc[key] = process.env[envVar];
        if (!acc[key]) {
          throw new Error(`Environment variable ${envVar} is not set`);
        }
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Create a new Sequelize instance with the resolved configuration
    sequelize = new Sequelize(resolvedConfig.database, resolvedConfig.username, resolvedConfig.password, {
      host: resolvedConfig.host,
      port: resolvedConfig.port,
      dialect: resolvedConfig.dialect,
      pool: resolvedConfig.pool,
      logging: resolvedConfig.logging === true ? console.log : false,
      dialectOptions: resolvedConfig.dialectOptions,
      retry: resolvedConfig.retry
    });

    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Apply migrations if in production environment
    if (env === 'production') {
      await applyMigrations();
    }

    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

/**
 * Apply database migrations
 * @returns {Promise<void>}
 */
const applyMigrations = async () => {
  const migrationsPath = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsPath).sort();

  for (const migrationFile of migrationFiles) {
    if (migrationFile.endsWith('.sql')) {
      const migration = fs.readFileSync(path.join(migrationsPath, migrationFile), 'utf8');
      await sequelize.query(migration);
      console.log(`Applied migration: ${migrationFile}`);
    }
  }
};

/**
 * Close the database connection
 * @returns {Promise<void>} Resolves when the connection is closed
 * @throws {Error} If there's an error closing the connection
 */
const closeConnection = async () => {
  if (sequelize) {
    try {
      await sequelize.close();
      console.log('Database connection closed successfully.');
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error;
    }
  }
};

/**
 * Get the current Sequelize instance
 * @returns {Sequelize|null} The Sequelize instance or null if not initialized
 */
const getSequelize = () => sequelize;

module.exports = {
  initializeDatabase,
  closeConnection,
  getSequelize
};

// Requirements addressed:
// - Data Storage and Management (2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management)
//   This module sets up the connection to the PostgreSQL database using Sequelize ORM,
//   allowing for efficient management of user data and reminder schedules.
// - Database Security (8. SECURITY CONSIDERATIONS/8.2 Data Security)
//   The implementation uses environment variables for sensitive information and
//   supports different configurations for development, test, and production environments.
// - Error Handling and Logging (2. TECHNICAL REQUIREMENTS/2.7 Error Handling and Logging)
//   Proper error handling and logging are implemented throughout the module.
// - Scalability (2. TECHNICAL REQUIREMENTS/2.8 Scalability)
//   The connection pool settings are configurable per environment, allowing for scalability.
// - Migrations (2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management)
//   Automatic migration application is implemented for the production environment.

// Note: Sequelize version ^6.6.5 is used as specified in the project dependencies.