const reminderController = require('../../controllers/reminderController');
const reminderService = require('../../services/reminderService');
const validation = require('../../utils/validation');
const { User } = require('../../models/User');
const logger = require('../../utils/logger');

jest.mock('../../services/reminderService');
jest.mock('../../utils/validation');
jest.mock('../../models/User');
jest.mock('../../utils/logger');

describe('reminderController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('createReminder', () => {
    it('should create a reminder successfully', async () => {
      const reminderData = {
        phoneNumber: '+1234567890',
        reminderTime: '08:00',
        timeZone: 'America/New_York'
      };
      req.body = reminderData;
      
      const mockUser = { id: 'user-123' };
      const mockCreatedReminder = { id: 'reminder-123', ...reminderData };

      validation.validateReminderInput.mockReturnValue({ isValid: true });
      User.findOne.mockResolvedValue(mockUser);
      reminderService.createReminder.mockResolvedValue(mockCreatedReminder);

      await reminderController.createReminder(req, res);

      expect(validation.validateReminderInput).toHaveBeenCalledWith(reminderData);
      expect(User.findOne).toHaveBeenCalledWith({ where: { phoneNumber: reminderData.phoneNumber } });
      expect(reminderService.createReminder).toHaveBeenCalledWith({
        userId: mockUser.id,
        scheduledAt: reminderData.reminderTime,
        timeZone: reminderData.timeZone
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Reminder created successfully',
        reminder: mockCreatedReminder
      });
    });

    it('should return 400 if validation fails', async () => {
      const invalidData = { phoneNumber: 'invalid' };
      req.body = invalidData;
      validation.validateReminderInput.mockReturnValue({ isValid: false, errors: ['Invalid phone number'] });

      await reminderController.createReminder(req, res);

      expect(validation.validateReminderInput).toHaveBeenCalledWith(invalidData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: ['Invalid phone number'] });
    });

    it('should return 404 if user not found', async () => {
      req.body = { phoneNumber: '+1234567890', reminderTime: '08:00', timeZone: 'America/New_York' };
      validation.validateReminderInput.mockReturnValue({ isValid: true });
      User.findOne.mockResolvedValue(null);

      await reminderController.createReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle internal server error', async () => {
      req.body = { phoneNumber: '+1234567890', reminderTime: '08:00', timeZone: 'America/New_York' };
      validation.validateReminderInput.mockReturnValue({ isValid: true });
      User.findOne.mockResolvedValue({ id: 'user-123' });
      reminderService.createReminder.mockRejectedValue(new Error('Database error'));

      await reminderController.createReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An error occurred while creating the reminder' });
      expect(logger.error).toHaveBeenCalledWith('Error in createReminder:', expect.any(Error));
    });
  });

  describe('updateReminder', () => {
    it('should update a reminder successfully', async () => {
      const reminderId = 'reminder-123';
      const updateData = { reminderTime: '09:00', timeZone: 'America/Los_Angeles' };
      req.params = { reminderId };
      req.body = updateData;
      
      const mockUpdatedReminder = { id: reminderId, ...updateData };

      validation.validateReminderInput.mockReturnValue({ isValid: true });
      reminderService.updateReminder.mockResolvedValue(mockUpdatedReminder);

      await reminderController.updateReminder(req, res);

      expect(validation.validateReminderInput).toHaveBeenCalledWith(updateData);
      expect(reminderService.updateReminder).toHaveBeenCalledWith(reminderId, {
        scheduledAt: updateData.reminderTime,
        timeZone: updateData.timeZone
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Reminder updated successfully',
        reminder: mockUpdatedReminder
      });
    });

    it('should return 400 if validation fails', async () => {
      req.params = { reminderId: 'reminder-123' };
      req.body = { reminderTime: 'invalid' };
      validation.validateReminderInput.mockReturnValue({ isValid: false, errors: ['Invalid reminder time'] });

      await reminderController.updateReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: ['Invalid reminder time'] });
    });

    it('should return 404 if reminder not found', async () => {
      req.params = { reminderId: 'non-existent-id' };
      req.body = { reminderTime: '09:00', timeZone: 'America/New_York' };
      validation.validateReminderInput.mockReturnValue({ isValid: true });
      reminderService.updateReminder.mockResolvedValue(null);

      await reminderController.updateReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Reminder not found' });
    });

    it('should handle internal server error', async () => {
      req.params = { reminderId: 'reminder-123' };
      req.body = { reminderTime: '09:00', timeZone: 'America/New_York' };
      validation.validateReminderInput.mockReturnValue({ isValid: true });
      reminderService.updateReminder.mockRejectedValue(new Error('Database error'));

      await reminderController.updateReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An error occurred while updating the reminder' });
      expect(logger.error).toHaveBeenCalledWith('Error in updateReminder:', expect.any(Error));
    });
  });

  describe('deleteReminder', () => {
    it('should delete a reminder successfully', async () => {
      const reminderId = 'reminder-123';
      req.params = { reminderId };
      reminderService.deleteReminder.mockResolvedValue(true);

      await reminderController.deleteReminder(req, res);

      expect(reminderService.deleteReminder).toHaveBeenCalledWith(reminderId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Reminder deleted successfully' });
    });

    it('should return 404 if reminder not found for deletion', async () => {
      req.params = { reminderId: 'non-existent-id' };
      reminderService.deleteReminder.mockResolvedValue(false);

      await reminderController.deleteReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Reminder not found' });
    });

    it('should handle internal server error', async () => {
      req.params = { reminderId: 'reminder-123' };
      reminderService.deleteReminder.mockRejectedValue(new Error('Database error'));

      await reminderController.deleteReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An error occurred while deleting the reminder' });
      expect(logger.error).toHaveBeenCalledWith('Error in deleteReminder:', expect.any(Error));
    });
  });

  describe('getReminder', () => {
    it('should get a reminder successfully', async () => {
      const reminderId = 'reminder-123';
      const reminderData = { id: reminderId, phoneNumber: '+1234567890', reminderTime: '08:00' };
      req.params = { reminderId };
      reminderService.getReminder.mockResolvedValue(reminderData);

      await reminderController.getReminder(req, res);

      expect(reminderService.getReminder).toHaveBeenCalledWith(reminderId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ reminder: reminderData });
    });

    it('should return 404 if reminder not found', async () => {
      req.params = { reminderId: 'non-existent-id' };
      reminderService.getReminder.mockResolvedValue(null);

      await reminderController.getReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Reminder not found' });
    });

    it('should handle internal server error', async () => {
      req.params = { reminderId: 'reminder-123' };
      reminderService.getReminder.mockRejectedValue(new Error('Database error'));

      await reminderController.getReminder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An error occurred while fetching the reminder' });
      expect(logger.error).toHaveBeenCalledWith('Error in getReminder:', expect.any(Error));
    });
  });

  describe('getUserReminders', () => {
    it('should get user reminders successfully', async () => {
      const userId = 'user-123';
      const reminders = [
        { id: 'reminder-1', phoneNumber: '+1234567890', reminderTime: '08:00' },
        { id: 'reminder-2', phoneNumber: '+1234567890', reminderTime: '20:00' }
      ];
      req.params = { userId };
      reminderService.getUserReminders.mockResolvedValue(reminders);

      await reminderController.getUserReminders(req, res);

      expect(reminderService.getUserReminders).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ reminders });
    });

    it('should return empty array if user has no reminders', async () => {
      const userId = 'user-without-reminders';
      req.params = { userId };
      reminderService.getUserReminders.mockResolvedValue([]);

      await reminderController.getUserReminders(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ reminders: [] });
    });

    it('should handle internal server error', async () => {
      req.params = { userId: 'user-123' };
      reminderService.getUserReminders.mockRejectedValue(new Error('Database error'));

      await reminderController.getUserReminders(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An error occurred while fetching user reminders' });
      expect(logger.error).toHaveBeenCalledWith('Error in getUserReminders:', expect.any(Error));
    });
  });
});