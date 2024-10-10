// src/database/queries/reminders.js

const { Op } = require('sequelize');
const { sequelize } = require('../connection');
const { Reminder, createReminder, getReminderById, updateReminder, deleteReminder, getPendingReminders, markReminderAsSent } = require('../models/reminder');
const { ValidationError } = require('../utils/validation');

/**
 * Creates a new reminder in the database
 * @param {Object} reminderData - Data for creating a new reminder
 * @returns {Promise<Reminder>} Newly created reminder object
 * @throws {ValidationError} If the reminder data is invalid
 * @requirement Reminder Scheduling - 2. TECHNICAL REQUIREMENTS/2.3 Reminder Scheduling
 */
async function createReminderQuery(reminderData) {
  try {
    return await createReminder(reminderData);
  } catch (error) {
    console.error('Error creating reminder:', error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new Error('Failed to create reminder');
  }
}

/**
 * Retrieves a reminder by its ID
 * @param {string} reminderId - ID of the reminder to retrieve
 * @returns {Promise<Reminder|null>} Reminder object if found, null otherwise
 * @requirement Data Storage and Management - 2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management
 */
async function getReminderByIdQuery(reminderId) {
  try {
    return await getReminderById(reminderId);
  } catch (error) {
    console.error('Error getting reminder by ID:', error);
    throw new Error('Failed to retrieve reminder');
  }
}

/**
 * Updates an existing reminder's information
 * @param {string} reminderId - ID of the reminder to update
 * @param {Object} updateData - Data to update the reminder with
 * @returns {Promise<Reminder>} Updated reminder object
 * @throws {Error} If the reminder is not found
 * @throws {ValidationError} If the update data is invalid
 * @requirement Reminder Scheduling - 2. TECHNICAL REQUIREMENTS/2.3 Reminder Scheduling
 */
async function updateReminderQuery(reminderId, updateData) {
  try {
    return await updateReminder(reminderId, updateData);
  } catch (error) {
    console.error('Error updating reminder:', error);
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new Error('Failed to update reminder');
  }
}

/**
 * Deletes a reminder from the database
 * @param {string} reminderId - ID of the reminder to delete
 * @returns {Promise<boolean>} True if reminder was deleted, false if reminder was not found
 * @requirement Data Storage and Management - 2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management
 */
async function deleteReminderQuery(reminderId) {
  try {
    return await deleteReminder(reminderId);
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw new Error('Failed to delete reminder');
  }
}

/**
 * Retrieves all pending reminders scheduled within a specified time range
 * @param {Date} startTime - Start of the time range
 * @param {Date} endTime - End of the time range
 * @returns {Promise<Array<Reminder>>} Array of pending reminder objects
 * @requirement Reminder Scheduling - 2. TECHNICAL REQUIREMENTS/2.3 Reminder Scheduling
 */
async function getPendingRemindersQuery(startTime, endTime) {
  try {
    return await getPendingReminders(startTime, endTime);
  } catch (error) {
    console.error('Error getting pending reminders:', error);
    throw new Error('Failed to retrieve pending reminders');
  }
}

/**
 * Updates a reminder's status to 'sent' and records the sent time
 * @param {string} reminderId - ID of the reminder to mark as sent
 * @returns {Promise<Reminder>} Updated reminder object
 * @throws {Error} If the reminder is not found
 * @requirement Reminder Scheduling - 2. TECHNICAL REQUIREMENTS/2.3 Reminder Scheduling
 */
async function markReminderAsSentQuery(reminderId) {
  try {
    return await markReminderAsSent(reminderId);
  } catch (error) {
    console.error('Error marking reminder as sent:', error);
    throw new Error('Failed to mark reminder as sent');
  }
}

/**
 * Retrieves all reminders for a specific user
 * @param {string} userId - ID of the user
 * @returns {Promise<Array<Reminder>>} Array of reminder objects for the user
 * @requirement Data Storage and Management - 2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management
 */
async function getRemindersByUserIdQuery(userId) {
  try {
    return await Reminder.findAll({
      where: { userId },
      order: [['scheduledAt', 'DESC']]
    });
  } catch (error) {
    console.error('Error getting reminders by user ID:', error);
    throw new Error('Failed to retrieve user reminders');
  }
}

/**
 * Retrieves the total count of reminders in the database
 * @returns {Promise<number>} Total count of reminders
 * @requirement Data Storage and Management - 2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management
 */
async function getRemindersCountQuery() {
  try {
    return await Reminder.count();
  } catch (error) {
    console.error('Error getting reminders count:', error);
    throw new Error('Failed to retrieve reminders count');
  }
}

/**
 * Retrieves reminders with pagination
 * @param {number} page - Page number
 * @param {number} pageSize - Number of items per page
 * @returns {Promise<{reminders: Array<Reminder>, totalCount: number, totalPages: number}>} Paginated reminders and metadata
 * @requirement Data Storage and Management - 2. TECHNICAL REQUIREMENTS/2.4 Data Storage and Management
 */
async function getPaginatedRemindersQuery(page, pageSize) {
  try {
    const offset = (page - 1) * pageSize;
    const { count, rows } = await Reminder.findAndCountAll({
      limit: pageSize,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      reminders: rows,
      totalCount: count,
      totalPages: Math.ceil(count / pageSize)
    };
  } catch (error) {
    console.error('Error getting paginated reminders:', error);
    throw new Error('Failed to retrieve paginated reminders');
  }
}

module.exports = {
  createReminderQuery,
  getReminderByIdQuery,
  updateReminderQuery,
  deleteReminderQuery,
  getPendingRemindersQuery,
  markReminderAsSentQuery,
  getRemindersByUserIdQuery,
  getRemindersCountQuery,
  getPaginatedRemindersQuery
};