const { User } = require('../models/User');
const reminderService = require('../services/reminderService');
const validation = require('../utils/validation');
const timeZoneHandler = require('../utils/timeZoneHandler');
const logger = require('../utils/logger');

/**
 * Creates a new reminder for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createReminder = async (req, res) => {
    try {
        const { phoneNumber, reminderTime, timeZone } = req.body;

        // Validate input
        const validationResult = validation.validateReminderInput({ phoneNumber, reminderTime, timeZone });
        if (!validationResult.isValid) {
            return res.status(400).json({ errors: validationResult.errors });
        }

        // Find user
        const user = await User.findOne({ where: { phoneNumber } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create reminder
        const reminderData = {
            userId: user.id,
            scheduledAt: reminderTime,
            timeZone
        };
        const createdReminder = await reminderService.createReminder(reminderData);

        res.status(201).json({
            message: 'Reminder created successfully',
            reminder: createdReminder
        });
    } catch (error) {
        logger.error('Error in createReminder:', error);
        res.status(500).json({ error: 'An error occurred while creating the reminder' });
    }
};

/**
 * Updates an existing reminder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateReminder = async (req, res) => {
    try {
        const { reminderId } = req.params;
        const { reminderTime, timeZone } = req.body;

        // Validate input
        const validationResult = validation.validateReminderInput({ reminderTime, timeZone });
        if (!validationResult.isValid) {
            return res.status(400).json({ errors: validationResult.errors });
        }

        // Update reminder
        const updateData = { scheduledAt: reminderTime, timeZone };
        const updatedReminder = await reminderService.updateReminder(reminderId, updateData);

        if (!updatedReminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.status(200).json({
            message: 'Reminder updated successfully',
            reminder: updatedReminder
        });
    } catch (error) {
        logger.error('Error in updateReminder:', error);
        res.status(500).json({ error: 'An error occurred while updating the reminder' });
    }
};

/**
 * Deletes a reminder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteReminder = async (req, res) => {
    try {
        const { reminderId } = req.params;

        const isDeleted = await reminderService.deleteReminder(reminderId);

        if (!isDeleted) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.status(200).json({ message: 'Reminder deleted successfully' });
    } catch (error) {
        logger.error('Error in deleteReminder:', error);
        res.status(500).json({ error: 'An error occurred while deleting the reminder' });
    }
};

/**
 * Retrieves a single reminder by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getReminder = async (req, res) => {
    try {
        const { reminderId } = req.params;

        const reminder = await reminderService.getReminder(reminderId);

        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.status(200).json({ reminder });
    } catch (error) {
        logger.error('Error in getReminder:', error);
        res.status(500).json({ error: 'An error occurred while fetching the reminder' });
    }
};

/**
 * Retrieves all reminders for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserReminders = async (req, res) => {
    try {
        const { userId } = req.params;

        const reminders = await reminderService.getUserReminders(userId);

        res.status(200).json({ reminders });
    } catch (error) {
        logger.error('Error in getUserReminders:', error);
        res.status(500).json({ error: 'An error occurred while fetching user reminders' });
    }
};

module.exports = {
    createReminder,
    updateReminder,
    deleteReminder,
    getReminder,
    getUserReminders
};