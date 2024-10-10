const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { encrypt, decrypt, hashPassword, verifyPassword } = require('../utils/encryption');
const { validatePhoneNumber, validateTimezone, sanitizeUserInput, ValidationError } = require('../utils/validation');

/**
 * User model for the supplement reminder application
 * @class User
 * @extends Model
 */
class User extends Model {
  /**
   * Initialize the User model
   * @param {Object} sequelize - Sequelize instance
   * @returns {void}
   */
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: () => uuidv4(),
          primaryKey: true,
        },
        phoneNumber: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isValid(value) {
              try {
                validatePhoneNumber(value);
              } catch (error) {
                throw new Error(error.message);
              }
            },
          },
        },
        timezone: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isValid(value) {
              try {
                validateTimezone(value);
              } catch (error) {
                throw new Error(error.message);
              }
            },
          },
        },
        passwordHash: {
          type: DataTypes.STRING,
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
        sequelize,
        modelName: 'User',
        tableName: 'users',
        hooks: {
          beforeCreate: async (user) => {
            user.phoneNumber = await encrypt(user.phoneNumber);
            user.passwordHash = await hashPassword(user.passwordHash);
            user.timezone = sanitizeUserInput(user.timezone);
          },
          beforeUpdate: async (user) => {
            if (user.changed('phoneNumber')) {
              user.phoneNumber = await encrypt(user.phoneNumber);
            }
            if (user.changed('passwordHash')) {
              user.passwordHash = await hashPassword(user.passwordHash);
            }
            if (user.changed('timezone')) {
              user.timezone = sanitizeUserInput(user.timezone);
            }
          },
          afterFind: async (user) => {
            if (user && user.phoneNumber) {
              user.phoneNumber = await decrypt(user.phoneNumber);
            }
          },
        },
      }
    );
  }

  /**
   * Define associations with other models
   * @param {Object} models - Object containing all models
   * @returns {void}
   */
  static associate(models) {
    // Associate User with Reminder model (one-to-many relationship)
    this.hasMany(models.Reminder, { foreignKey: 'userId', as: 'reminders' });
  }
}

/**
 * Create a new user in the database
 * @param {Object} userData - User data to create
 * @returns {Promise<User>} Newly created user object
 * @throws {ValidationError} If user data is invalid
 */
async function createUser(userData) {
  const { phoneNumber, timezone, password } = userData;

  try {
    validatePhoneNumber(phoneNumber);
    validateTimezone(timezone);
  } catch (error) {
    throw new ValidationError(error.message);
  }

  const sanitizedTimezone = sanitizeUserInput(timezone);

  const user = await User.create({
    phoneNumber,
    timezone: sanitizedTimezone,
    passwordHash: password, // Will be hashed in the beforeCreate hook
  });

  return user;
}

/**
 * Retrieve a user by their ID
 * @param {string} userId - User ID to search for
 * @returns {Promise<User|null>} User object if found, null otherwise
 */
async function getUserById(userId) {
  return await User.findByPk(userId);
}

/**
 * Update an existing user's information
 * @param {string} userId - ID of the user to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<User>} Updated user object
 * @throws {ValidationError} If update data is invalid
 * @throws {Error} If user is not found
 */
async function updateUser(userId, updateData) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  try {
    if (updateData.phoneNumber) {
      validatePhoneNumber(updateData.phoneNumber);
    }
    if (updateData.timezone) {
      validateTimezone(updateData.timezone);
      updateData.timezone = sanitizeUserInput(updateData.timezone);
    }
  } catch (error) {
    throw new ValidationError(error.message);
  }

  await user.update(updateData);
  return user;
}

/**
 * Delete a user from the database
 * @param {string} userId - ID of the user to delete
 * @returns {Promise<boolean>} True if user was deleted, false if user was not found
 */
async function deleteUser(userId) {
  const user = await User.findByPk(userId);

  if (!user) {
    return false;
  }

  await user.destroy();
  return true;
}

/**
 * Verify a user's password
 * @param {string} userId - ID of the user
 * @param {string} password - Password to verify
 * @returns {Promise<boolean>} True if password is correct, false otherwise
 */
async function verifyUserPassword(userId, password) {
  const user = await User.findByPk(userId);

  if (!user) {
    return false;
  }

  return await verifyPassword(password, user.passwordHash);
}

module.exports = {
  User,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  verifyUserPassword,
};