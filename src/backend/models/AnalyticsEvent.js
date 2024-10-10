const { DataTypes, Model } = require('sequelize');
const { validateReminderInput } = require('../utils/validation');

/**
 * AnalyticsEvent model for tracking user interactions and system events
 * @class AnalyticsEvent
 * @extends Model
 */
class AnalyticsEvent extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // Associate AnalyticsEvent with User model (belongsTo relationship)
    AnalyticsEvent.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }

  /**
   * Custom JSON serialization method
   * @returns {Object} Formatted AnalyticsEvent object
   */
  toJSON() {
    const values = { ...this.get() };
    // Format the eventData field if it's a JSON string
    if (typeof values.eventData === 'string') {
      try {
        values.eventData = JSON.parse(values.eventData);
      } catch (error) {
        console.error('Error parsing eventData:', error);
      }
    }
    return values;
  }
}

/**
 * Initialize the AnalyticsEvent model
 * @param {Object} sequelize - Sequelize instance
 * @returns {Model} Initialized AnalyticsEvent model
 */
const initAnalyticsEventModel = (sequelize) => {
  AnalyticsEvent.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      eventType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [['reminder_created', 'reminder_sent', 'reminder_confirmed', 'user_registered', 'user_updated', 'error']]
        }
      },
      eventData: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'AnalyticsEvent',
      tableName: 'analytics_events',
      timestamps: true,
      updatedAt: false,
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
      hooks: {
        beforeCreate: async (analyticsEvent, options) => {
          // Validate event data before creating a new analytics event
          if (analyticsEvent.eventType === 'reminder_created' || analyticsEvent.eventType === 'user_registered') {
            const validationResult = validateReminderInput(analyticsEvent.eventData);
            if (!validationResult.isValid) {
              throw new Error(`Invalid event data: ${Object.values(validationResult.errors).join(', ')}`);
            }
          }
        },
      },
    }
  );

  return AnalyticsEvent;
};

module.exports = {
  AnalyticsEvent,
  initAnalyticsEventModel,
};