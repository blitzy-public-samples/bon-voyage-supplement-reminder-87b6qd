const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');
const { validateAnalyticsEventType, validateAnalyticsEventData, ValidationError } = require('../utils/validation');

/**
 * Analytics model for storing and managing analytics events in the supplement reminder application
 * @class Analytics
 * @extends Sequelize.Model
 * 
 * Requirements addressed:
 * - Analytics and Reporting (2. TECHNICAL REQUIREMENTS/2.6 Analytics and Reporting)
 *   Implements custom event tracking for key user actions (e.g., form submissions, reminder setups).
 * - Data Storage and Management (2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management)
 *   Sets up a PostgreSQL database with appropriate tables for user data and reminder schedules.
 */
class Analytics extends sequelize().Model {
  /**
   * Initialize the Analytics model
   * @param {Object} sequelizeInstance - Sequelize instance
   * @returns {void}
   */
  static init(sequelizeInstance) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          index: true,
        },
        eventType: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        eventData: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize: sequelizeInstance,
        modelName: 'Analytics',
        tableName: 'analytics',
        timestamps: true,
        indexes: [
          {
            fields: ['userId'],
          },
          {
            fields: ['eventType'],
          },
          {
            fields: ['createdAt'],
          },
        ],
      }
    );

    this.addHook('beforeValidate', Analytics.validateAnalyticsData);
  }

  /**
   * Set up associations with other models
   * @param {Object} models - Object containing all models
   * @returns {void}
   */
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }

  /**
   * Hook function to validate analytics event data before saving
   * @param {Object} analytics - Analytics instance
   * @throws {ValidationError} If validation fails
   */
  static async validateAnalyticsData(analytics) {
    try {
      await validateAnalyticsEventType(analytics.eventType);
      await validateAnalyticsEventData({
        userId: analytics.userId,
        eventType: analytics.eventType,
        timestamp: analytics.createdAt.toISOString(),
        ...analytics.eventData,
      });
    } catch (error) {
      throw new ValidationError(error.message);
    }
  }

  /**
   * Create a new analytics event
   * @param {Object} eventData - The event data
   * @param {Object} options - Sequelize options
   * @returns {Promise<Analytics>} The created analytics event
   */
  static async createEvent(eventData, options = {}) {
    const { userId, eventType, ...data } = eventData;
    return this.create(
      {
        userId,
        eventType,
        eventData: data,
      },
      options
    );
  }

  /**
   * Get analytics events for a specific user
   * @param {string} userId - The user ID
   * @param {Object} options - Query options (e.g., limit, offset)
   * @returns {Promise<Analytics[]>} Array of analytics events
   */
  static async getEventsByUser(userId, options = {}) {
    return this.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      ...options,
    });
  }

  /**
   * Get analytics events by event type
   * @param {string} eventType - The event type
   * @param {Object} options - Query options (e.g., limit, offset)
   * @returns {Promise<Analytics[]>} Array of analytics events
   */
  static async getEventsByType(eventType, options = {}) {
    return this.findAll({
      where: { eventType },
      order: [['createdAt', 'DESC']],
      ...options,
    });
  }
}

module.exports = Analytics;