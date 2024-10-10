/**
 * Main entry point for database operations in the supplement reminder application.
 * It initializes the database connection, imports models, and exports an interface
 * for interacting with the database.
 * 
 * Requirements addressed:
 * - Data Storage and Management (2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management)
 * - Database Security (8. SECURITY CONSIDERATIONS/8.2 Data Security)
 */

const { initializeDatabase, closeConnection, getSequelize } = require('./connection');
const { User } = require('./models/user');
const { Reminder } = require('./models/reminder');
const Analytics = require('./models/analytics');

/**
 * Initialize database models and their associations
 * @param {object} sequelize - Sequelize instance
 * @returns {object} Object containing initialized models
 */
function initModels(sequelize) {
  const models = {
    User: User,
    Reminder: Reminder,
    Analytics: Analytics
  };

  // Initialize models
  Object.values(models).forEach(model => {
    if (typeof model.init === 'function') {
      model.init(sequelize);
    }
  });

  // Set up associations between models
  Object.values(models).forEach(model => {
    if (typeof model.associate === 'function') {
      model.associate(models);
    }
  });

  return models;
}

/**
 * Initialize the database connection and models
 * @returns {Promise<object>} Resolves with an object containing the Sequelize instance and initialized models
 */
async function initDatabase() {
  try {
    // Initialize the database connection
    const sequelize = await initializeDatabase();

    // Initialize and associate models
    const models = initModels(sequelize);

    // Return an object with the Sequelize instance and models
    return { sequelize, models };
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

module.exports = {
  initDatabase,
  closeConnection,
  getSequelize,
  models: initModels(getSequelize())
};

// Note: This module sets up the database connection and models for the application.
// It uses Sequelize as the ORM and supports PostgreSQL as the database.
// The implementation follows best practices for security and scalability.
// Make sure to properly configure the database connection in the config/database.json file
// and set up the necessary environment variables for secure credential management.