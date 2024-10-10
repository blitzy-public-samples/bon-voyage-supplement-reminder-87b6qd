const { User } = require('../models/User');
const { Reminder } = require('../models/Reminder');
const analyticsService = require('../services/analyticsService');
const validation = require('../utils/validation');
const timeZoneHandler = require('../utils/timeZoneHandler');
const logger = require('../utils/logger');

/**
 * Register a new user and create their first reminder
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const registerUser = async (req, res) => {
    try {
        const { phoneNumber, reminderTime, timeZone } = req.body;

        // Validate and sanitize user input
        const validationResult = validation.validateAndSanitizeReminderInput({ phoneNumber, reminderTime, timeZone });
        if (!validationResult.isValid) {
            return res.status(400).json({ error: validationResult.errors });
        }

        const { sanitizedInput } = validationResult;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { phoneNumber: sanitizedInput.phoneNumber } });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Create new user
        const newUser = await User.create({
            phoneNumber: sanitizedInput.phoneNumber,
            reminderTime: sanitizedInput.reminderTime,
            timezone: sanitizedInput.timeZone
        });

        // Create initial reminder
        const nextReminderTime = timeZoneHandler.calculateNextReminderTime(sanitizedInput.reminderTime, sanitizedInput.timeZone);
        await Reminder.create({
            userId: newUser.id,
            scheduledAt: nextReminderTime
        });

        // Track user registration event
        await analyticsService.trackEvent(newUser.id, 'user_registration', {
            timeZone: sanitizedInput.timeZone,
            registrationTime: new Date()
        });

        logger.logEvent('info', 'User registered successfully', { userId: newUser.id }, true);

        res.status(201).json({
            message: 'User registered successfully',
            userId: newUser.id
        });
    } catch (error) {
        logger.logEvent('error', 'Error in registerUser', { error: error.message }, false);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Update user information and adjust reminders if necessary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { phoneNumber, reminderTime, timeZone } = req.body;

        // Validate and sanitize user input
        const validationResult = validation.validateAndSanitizeReminderInput({ phoneNumber, reminderTime, timeZone });
        if (!validationResult.isValid) {
            return res.status(400).json({ error: validationResult.errors });
        }

        const { sanitizedInput } = validationResult;

        // Retrieve user from database
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user information
        user.phoneNumber = sanitizedInput.phoneNumber;
        user.reminderTime = sanitizedInput.reminderTime;
        user.timezone = sanitizedInput.timeZone;
        await user.save();

        // If reminder time changed, update existing reminders
        if (user.changed('reminderTime') || user.changed('timezone')) {
            const nextReminderTime = timeZoneHandler.calculateNextReminderTime(sanitizedInput.reminderTime, sanitizedInput.timeZone);
            await Reminder.update(
                { scheduledAt: nextReminderTime },
                { where: { userId, status: 'pending' } }
            );
        }

        // Track user update event
        await analyticsService.trackEvent(userId, 'user_update', {
            updatedFields: user.changed(),
            updateTime: new Date()
        });

        logger.logEvent('info', 'User updated successfully', { userId }, true);

        res.json({
            message: 'User updated successfully',
            userId: user.id
        });
    } catch (error) {
        logger.logEvent('error', 'Error in updateUser', { error: error.message }, false);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Delete a user and all associated reminders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate user ID
        if (!validation.sanitizeInput(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Retrieve user from database
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete all associated reminders
        await Reminder.destroy({ where: { userId } });

        // Delete user from database
        await user.destroy();

        // Track user deletion event
        await analyticsService.trackEvent(userId, 'user_deletion', {
            deletionTime: new Date()
        });

        logger.logEvent('info', 'User and associated reminders deleted successfully', { userId }, true);

        res.json({ message: 'User and associated reminders deleted successfully' });
    } catch (error) {
        logger.logEvent('error', 'Error in deleteUser', { error: error.message }, false);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Retrieve all reminders for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getUserReminders = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate user ID
        if (!validation.sanitizeInput(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Retrieve user and associated reminders from database
        const user = await User.findByPk(userId, {
            include: [{
                model: Reminder,
                as: 'reminders',
                attributes: ['id', 'scheduledAt', 'status', 'sentAt']
            }]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Convert UTC times to user's time zone
        const reminders = user.reminders.map(reminder => ({
            ...reminder.toJSON(),
            scheduledAt: timeZoneHandler.convertFromUTC(reminder.scheduledAt, user.timezone),
            sentAt: reminder.sentAt ? timeZoneHandler.convertFromUTC(reminder.sentAt, user.timezone) : null
        }));

        logger.logEvent('info', 'User reminders retrieved successfully', { userId, reminderCount: reminders.length }, true);

        res.json({
            userId: user.id,
            phoneNumber: user.phoneNumber,
            reminderTime: user.reminderTime,
            timezone: user.timezone,
            reminders
        });
    } catch (error) {
        logger.logEvent('error', 'Error in getUserReminders', { error: error.message }, false);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    registerUser,
    updateUser,
    deleteUser,
    getUserReminders
};