const { DataTypes, Model } = require('sequelize');
const { encrypt, decrypt } = require('../utils/encryption');
const { validatePhoneNumber, validateReminderTime, validateTimeZone } = require('../utils/validation');
const moment = require('moment-timezone'); // moment-timezone@0.5.43

/**
 * User model for the supplement reminder application
 * @class User
 * @extends Model
 */
class User extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // Define association here
    this.hasMany(models.Reminder, { foreignKey: 'userId', as: 'reminders' });
  }
}

/**
 * Initialize the User model
 * @param {Object} sequelize - Sequelize instance
 * @returns {Model} Initialized User model
 */
function initUserModel(sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
          if (!value) {
            throw new Error('Phone number is required');
          }
          if (!validatePhoneNumber(value)) {
            throw new Error('Invalid phone number format');
          }
          this.setDataValue('phoneNumber', encrypt(value));
        },
        get() {
          const rawValue = this.getDataValue('phoneNumber');
          return rawValue ? decrypt(rawValue) : null;
        },
      },
      reminderTime: {
        type: DataTypes.TIME,
        allowNull: false,
        validate: {
          isValidTime(value) {
            if (!validateReminderTime(value)) {
              throw new Error('Invalid reminder time format (use HH:MM)');
            }
          },
        },
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isValidTimeZone(value) {
            if (!validateTimeZone(value)) {
              throw new Error('Invalid timezone');
            }
          },
        },
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
      sequelize,
      modelName: 'User',
      tableName: 'users',
      hooks: {
        beforeCreate: async (user) => {
          await validateUserInput(user);
        },
        beforeUpdate: async (user) => {
          await validateUserInput(user);
        },
        afterFind: (user) => {
          if (user && Array.isArray(user)) {
            user.forEach(u => {
              if (u.phoneNumber) {
                u.phoneNumber = decrypt(u.phoneNumber);
              }
            });
          } else if (user && user.phoneNumber) {
            user.phoneNumber = decrypt(user.phoneNumber);
          }
        },
      },
    }
  );

  return User;
}

/**
 * Validate user input before creating or updating a user
 * @param {Object} user - User instance
 * @throws {Error} If validation fails
 */
async function validateUserInput(user) {
  const errors = [];

  if (!user.phoneNumber) {
    errors.push('Phone number is required');
  } else if (!validatePhoneNumber(user.phoneNumber)) {
    errors.push('Invalid phone number format');
  }

  if (!user.reminderTime) {
    errors.push('Reminder time is required');
  } else if (!validateReminderTime(user.reminderTime)) {
    errors.push('Invalid reminder time format (use HH:MM)');
  }

  if (!user.timezone) {
    errors.push('Timezone is required');
  } else if (!validateTimeZone(user.timezone)) {
    errors.push('Invalid timezone');
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
}

module.exports = {
  User,
  initUserModel,
};