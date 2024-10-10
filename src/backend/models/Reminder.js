const { DataTypes, Model } = require('sequelize');
const moment = require('moment-timezone');
const { databaseConfig } = require('../config/database');
const { User } = require('./User');
const { validateReminderStatus } = require('../utils/validation');

/**
 * Reminder model for the supplement reminder application
 * @class Reminder
 * @extends Model
 */
class Reminder extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // Associate Reminder with User model (belongsTo relationship)
    Reminder.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }

  /**
   * Custom JSON serialization to exclude sensitive data
   * @returns {Object} Serialized reminder object
   */
  toJSON() {
    const values = { ...this.get() };
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  }
}

/**
 * Initialize the Reminder model
 * @param {Object} sequelize - Sequelize instance
 * @returns {Model} Initialized Reminder model
 */
const initReminderModel = (sequelize) => {
  Reminder.init(
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
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'sent', 'failed'),
        defaultValue: 'pending',
        validate: {
          isValid(value) {
            if (!validateReminderStatus(value)) {
              throw new Error('Invalid reminder status');
            }
          },
        },
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Reminder',
      tableName: 'reminders',
      hooks: {
        beforeCreate: async (reminder) => {
          await validateReminderInput(reminder);
        },
        beforeUpdate: async (reminder) => {
          await validateReminderInput(reminder);
        },
      },
    }
  );

  return Reminder;
};

/**
 * Validate reminder input before creating or updating a reminder
 * @param {Object} reminder - Reminder instance
 * @throws {Error} If validation fails
 */
async function validateReminderInput(reminder) {
  if (!reminder.scheduledAt) {
    throw new Error('Scheduled time is required');
  }

  if (!moment(reminder.scheduledAt).isValid()) {
    throw new Error('Invalid scheduled time');
  }

  if (reminder.sentAt && !moment(reminder.sentAt).isValid()) {
    throw new Error('Invalid sent time');
  }

  if (!validateReminderStatus(reminder.status)) {
    throw new Error('Invalid reminder status');
  }
}

module.exports = {
  Reminder,
  initReminderModel,
};
```

Improvements and changes made:

1. Added JSDoc comments for better documentation.
2. Imported `validateReminderStatus` from the validation utils (assuming it exists).
3. Added input validation for the `status` field using a custom validator.
4. Created a separate `validateReminderInput` function to handle input validation for both creation and updates.
5. Added validation for `scheduledAt` and `sentAt` fields using `moment.js`.
6. Removed the default value setting for `status` and `scheduledAt` in the `beforeCreate` hook, as they are now handled by the schema definition and validation function.
7. Added a `beforeUpdate` hook to ensure validation is performed on updates as well.
8. Kept the `toJSON` method for excluding sensitive data.
9. Maintained the association with the User model.

Note: This implementation assumes that the `validateReminderStatus` function exists in the `../utils/validation` file. If it doesn't, you should add it to that file with the following implementation:

```javascript
// In ../utils/validation.js

/**
 * Validate reminder status
 * @param {string} status - Reminder status
 * @returns {boolean} True if valid, false otherwise
 */
function validateReminderStatus(status) {
  return ['pending', 'sent', 'failed'].includes(status);
}

module.exports = {
  // ... other exports
  validateReminderStatus,
};