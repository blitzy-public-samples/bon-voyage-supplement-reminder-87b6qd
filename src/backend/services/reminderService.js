const { Reminder } = require('../models/Reminder');
const timeZoneHandler = require('../utils/timeZoneHandler');
const smsService = require('./smsService');
const logger = require('../utils/logger');
const moment = require('moment-timezone');
const { validateReminderStatus } = require('../utils/validation');

/**
 * Creates a new reminder for a user
 * @param {object} reminderData - Data for creating a new reminder
 * @returns {Promise<object>} Created reminder object
 * @throws {Error} If required fields are missing or invalid
 */
async function createReminder(reminderData) {
    try {
        // Validate input data
        if (!reminderData.userId || !reminderData.scheduledAt || !reminderData.timeZone) {
            throw new Error('Missing required fields for creating a reminder');
        }

        if (!timeZoneHandler.isValidTimeZone(reminderData.timeZone)) {
            throw new Error('Invalid time zone');
        }

        // Convert preferred time to UTC using timeZoneHandler
        const utcScheduledAt = timeZoneHandler.convertToUTC(reminderData.scheduledAt, reminderData.timeZone);

        // Create a new Reminder instance
        const reminder = await Reminder.create({
            userId: reminderData.userId,
            scheduledAt: utcScheduledAt,
            status: 'pending'
        });

        // Schedule the SMS reminder using smsService
        await smsService.sendReminderSMS(reminder);

        logger.logEvent('info', 'Reminder created', { reminderId: reminder.id, userId: reminderData.userId }, true);

        return reminder.toJSON();
    } catch (error) {
        logger.logEvent('error', 'Error creating reminder', { error: error.message, userId: reminderData.userId });
        throw error;
    }
}

/**
 * Updates an existing reminder
 * @param {string} reminderId - ID of the reminder to update
 * @param {object} updateData - Data to update the reminder
 * @returns {Promise<object>} Updated reminder object
 * @throws {Error} If reminder is not found or update data is invalid
 */
async function updateReminder(reminderId, updateData) {
    try {
        // Validate input data
        if (!reminderId || !updateData) {
            throw new Error('Missing required fields for updating a reminder');
        }

        // Fetch the existing reminder from the database
        const reminder = await Reminder.findByPk(reminderId);
        if (!reminder) {
            throw new Error('Reminder not found');
        }

        // Update the reminder properties
        if (updateData.scheduledAt && updateData.timeZone) {
            if (!timeZoneHandler.isValidTimeZone(updateData.timeZone)) {
                throw new Error('Invalid time zone');
            }
            // Convert updated scheduledAt to UTC
            reminder.scheduledAt = timeZoneHandler.convertToUTC(updateData.scheduledAt, updateData.timeZone);
        }

        if (updateData.status) {
            if (!validateReminderStatus(updateData.status)) {
                throw new Error('Invalid reminder status');
            }
            reminder.status = updateData.status;
        }

        // Save the updated reminder to the database
        await reminder.save();

        // Reschedule the SMS reminder using smsService
        await smsService.sendReminderSMS(reminder);

        logger.logEvent('info', 'Reminder updated', { reminderId: reminder.id, userId: reminder.userId }, true);

        return reminder.toJSON();
    } catch (error) {
        logger.logEvent('error', 'Error updating reminder', { error: error.message, reminderId });
        throw error;
    }
}

/**
 * Deletes a reminder
 * @param {string} reminderId - ID of the reminder to delete
 * @returns {Promise<boolean>} True if deletion was successful, false otherwise
 * @throws {Error} If reminder is not found
 */
async function deleteReminder(reminderId) {
    try {
        // Fetch the reminder from the database
        const reminder = await Reminder.findByPk(reminderId);
        if (!reminder) {
            throw new Error('Reminder not found');
        }

        // Delete the reminder from the database
        await reminder.destroy();

        // Cancel the scheduled SMS reminder using smsService
        // Note: Implement cancelReminderSMS in smsService if not already present
        if (typeof smsService.cancelReminderSMS === 'function') {
            await smsService.cancelReminderSMS(reminderId);
        }

        logger.logEvent('info', 'Reminder deleted', { reminderId, userId: reminder.userId }, true);

        return true;
    } catch (error) {
        logger.logEvent('error', 'Error deleting reminder', { error: error.message, reminderId });
        throw error;
    }
}

/**
 * Retrieves a single reminder by ID
 * @param {string} reminderId - ID of the reminder to retrieve
 * @returns {Promise<object>} Reminder object
 * @throws {Error} If reminder is not found
 */
async function getReminder(reminderId) {
    try {
        // Fetch the reminder from the database
        const reminder = await Reminder.findByPk(reminderId);
        if (!reminder) {
            throw new Error('Reminder not found');
        }

        return reminder.toJSON();
    } catch (error) {
        logger.logEvent('error', 'Error retrieving reminder', { error: error.message, reminderId });
        throw error;
    }
}

/**
 * Retrieves all reminders for a user
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} Array of reminder objects
 */
async function getUserReminders(userId) {
    try {
        // Query the database for all reminders associated with the userId
        const reminders = await Reminder.findAll({
            where: { userId },
            order: [['scheduledAt', 'ASC']]
        });

        return reminders.map(reminder => reminder.toJSON());
    } catch (error) {
        logger.logEvent('error', 'Error retrieving user reminders', { error: error.message, userId });
        throw error;
    }
}

/**
 * Processes due reminders and triggers SMS sending
 * @returns {Promise<void>} No return value
 */
async function processReminders() {
    try {
        const now = moment.utc();
        // Query the database for reminders that are due
        const dueReminders = await Reminder.findAll({
            where: {
                scheduledAt: {
                    [Reminder.Op.lte]: now.toDate()
                },
                status: 'pending'
            }
        });

        for (const reminder of dueReminders) {
            try {
                // Call smsService.sendReminderSMS
                await smsService.sendReminderSMS(reminder);
                
                // Update reminder status based on SMS sending result
                reminder.status = 'sent';
                reminder.sentAt = now.toDate();
                await reminder.save();

                logger.logEvent('info', 'Reminder processed and sent', { reminderId: reminder.id, userId: reminder.userId }, true);
            } catch (error) {
                reminder.status = 'failed';
                await reminder.save();
                logger.logEvent('error', 'Failed to process reminder', { error: error.message, reminderId: reminder.id, userId: reminder.userId });
            }
        }

        logger.logEvent('info', 'Reminder processing completed', { processedCount: dueReminders.length }, true);
    } catch (error) {
        logger.logEvent('error', 'Error processing reminders', { error: error.message });
        throw error;
    }
}

module.exports = {
    createReminder,
    updateReminder,
    deleteReminder,
    getReminder,
    getUserReminders,
    processReminders
};