const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../connection');
const { User } = require('./user');
const { validateReminderTime, ValidationError } = require('../utils/validation');

class Reminder extends Model {
  static associate(models) {
    Reminder.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }

  static async beforeCreate(reminder) {
    try {
      validateReminderTime(reminder.scheduledAt);
    } catch (error) {
      throw new ValidationError('Invalid reminder time');
    }
  }

  static async beforeUpdate(reminder) {
    if (reminder.changed('scheduledAt')) {
      try {
        validateReminderTime(reminder.scheduledAt);
      } catch (error) {
        throw new ValidationError('Invalid reminder time');
      }
    }
  }
}

Reminder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
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
      allowNull: false,
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
      beforeCreate: Reminder.beforeCreate,
      beforeUpdate: Reminder.beforeUpdate,
    },
  }
);

async function createReminder(reminderData) {
  try {
    validateReminderTime(reminderData.scheduledAt);
  } catch (error) {
    throw new ValidationError('Invalid reminder time');
  }

  const reminder = await Reminder.create(reminderData);
  return reminder;
}

async function getReminderById(reminderId) {
  return await Reminder.findByPk(reminderId);
}

async function updateReminder(reminderId, updateData) {
  if (updateData.scheduledAt) {
    try {
      validateReminderTime(updateData.scheduledAt);
    } catch (error) {
      throw new ValidationError('Invalid reminder time');
    }
  }

  const reminder = await Reminder.findByPk(reminderId);

  if (!reminder) {
    throw new Error('Reminder not found');
  }

  await reminder.update(updateData);
  return reminder;
}

async function deleteReminder(reminderId) {
  const reminder = await Reminder.findByPk(reminderId);

  if (!reminder) {
    return false;
  }

  await reminder.destroy();
  return true;
}

async function getPendingReminders(startTime, endTime) {
  return await Reminder.findAll({
    where: {
      status: 'pending',
      scheduledAt: {
        [sequelize.Op.between]: [startTime, endTime],
      },
    },
    include: [{ model: User, as: 'user' }],
  });
}

async function markReminderAsSent(reminderId) {
  const reminder = await Reminder.findByPk(reminderId);

  if (!reminder) {
    throw new Error('Reminder not found');
  }

  await reminder.update({
    status: 'sent',
    sentAt: new Date(),
  });

  return reminder;
}

module.exports = {
  Reminder,
  createReminder,
  getReminderById,
  updateReminder,
  deleteReminder,
  getPendingReminders,
  markReminderAsSent,
};