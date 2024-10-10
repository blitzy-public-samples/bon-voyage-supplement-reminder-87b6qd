const {
  registerUser,
  updateUser,
  deleteUser,
  getUserReminders
} = require('../../controllers/userController');
const { User } = require('../../models/User');
const { Reminder } = require('../../models/Reminder');
const analyticsService = require('../../services/analyticsService');
const validation = require('../../utils/validation');
const timeZoneHandler = require('../../utils/timeZoneHandler');
const logger = require('../../utils/logger');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../../models/Reminder');
jest.mock('../../services/analyticsService');
jest.mock('../../utils/validation');
jest.mock('../../utils/timeZoneHandler');
jest.mock('../../utils/logger');

// Helper functions for creating mock objects
const mockRequest = (body = {}, params = {}) => ({ body, params });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('userController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const req = mockRequest({
        phoneNumber: '+1234567890',
        reminderTime: '08:00',
        timeZone: 'America/New_York'
      });
      const res = mockResponse();

      validation.validateAndSanitizeReminderInput.mockReturnValue({
        isValid: true,
        sanitizedInput: req.body
      });

      User.findOne.mockResolvedValue(null);
      const mockUser = { id: 'user-123', ...req.body };
      User.create.mockResolvedValue(mockUser);

      const mockNextReminderTime = new Date();
      timeZoneHandler.calculateNextReminderTime.mockReturnValue(mockNextReminderTime);

      Reminder.create.mockResolvedValue({ id: 'reminder-123' });

      await registerUser(req, res);

      expect(validation.validateAndSanitizeReminderInput).toHaveBeenCalledWith(req.body);
      expect(User.findOne).toHaveBeenCalledWith({ where: { phoneNumber: req.body.phoneNumber } });
      expect(User.create).toHaveBeenCalledWith(req.body);
      expect(timeZoneHandler.calculateNextReminderTime).toHaveBeenCalledWith(req.body.reminderTime, req.body.timeZone);
      expect(Reminder.create).toHaveBeenCalledWith({
        userId: 'user-123',
        scheduledAt: mockNextReminderTime
      });
      expect(analyticsService.trackEvent).toHaveBeenCalledWith('user-123', 'user_registration', expect.any(Object));
      expect(logger.logEvent).toHaveBeenCalledWith('info', 'User registered successfully', { userId: 'user-123' }, true);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        userId: 'user-123'
      });
    });

    it('should return 400 for invalid input', async () => {
      const req = mockRequest({
        phoneNumber: 'invalid',
        reminderTime: 'invalid',
        timeZone: 'invalid'
      });
      const res = mockResponse();

      validation.validateAndSanitizeReminderInput.mockReturnValue({
        isValid: false,
        errors: ['Invalid phone number', 'Invalid reminder time', 'Invalid time zone']
      });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: ['Invalid phone number', 'Invalid reminder time', 'Invalid time zone']
      });
    });

    it('should return 409 if user already exists', async () => {
      const req = mockRequest({
        phoneNumber: '+1234567890',
        reminderTime: '08:00',
        timeZone: 'America/New_York'
      });
      const res = mockResponse();

      validation.validateAndSanitizeReminderInput.mockReturnValue({
        isValid: true,
        sanitizedInput: req.body
      });

      User.findOne.mockResolvedValue({ id: 'existing-user' });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'User already exists' });
    });
  });

  describe('updateUser', () => {
    it('should successfully update user information', async () => {
      const req = mockRequest(
        { phoneNumber: '+1987654321', reminderTime: '09:00', timeZone: 'Europe/London' },
        { userId: 'user-123' }
      );
      const res = mockResponse();

      validation.validateAndSanitizeReminderInput.mockReturnValue({
        isValid: true,
        sanitizedInput: req.body
      });

      const mockUser = {
        id: 'user-123',
        ...req.body,
        save: jest.fn(),
        changed: jest.fn().mockReturnValue(['reminderTime', 'timezone'])
      };

      User.findByPk.mockResolvedValue(mockUser);

      const mockNextReminderTime = new Date();
      timeZoneHandler.calculateNextReminderTime.mockReturnValue(mockNextReminderTime);

      await updateUser(req, res);

      expect(User.findByPk).toHaveBeenCalledWith('user-123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(Reminder.update).toHaveBeenCalledWith(
        { scheduledAt: mockNextReminderTime },
        { where: { userId: 'user-123', status: 'pending' } }
      );
      expect(analyticsService.trackEvent).toHaveBeenCalledWith('user-123', 'user_update', expect.any(Object));
      expect(logger.logEvent).toHaveBeenCalledWith('info', 'User updated successfully', { userId: 'user-123' }, true);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User updated successfully',
        userId: 'user-123'
      });
    });

    it('should return 404 if user is not found', async () => {
      const req = mockRequest({}, { userId: 'non-existent-user' });
      const res = mockResponse();

      validation.validateAndSanitizeReminderInput.mockReturnValue({
        isValid: true,
        sanitizedInput: req.body
      });

      User.findByPk.mockResolvedValue(null);

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete a user', async () => {
      const req = mockRequest({}, { userId: 'user-123' });
      const res = mockResponse();

      validation.sanitizeInput.mockReturnValue(true);

      const mockUser = {
        id: 'user-123',
        destroy: jest.fn()
      };

      User.findByPk.mockResolvedValue(mockUser);

      await deleteUser(req, res);

      expect(User.findByPk).toHaveBeenCalledWith('user-123');
      expect(Reminder.destroy).toHaveBeenCalledWith({ where: { userId: 'user-123' } });
      expect(mockUser.destroy).toHaveBeenCalled();
      expect(analyticsService.trackEvent).toHaveBeenCalledWith('user-123', 'user_deletion', expect.any(Object));
      expect(logger.logEvent).toHaveBeenCalledWith('info', 'User and associated reminders deleted successfully', { userId: 'user-123' }, true);
      expect(res.json).toHaveBeenCalledWith({ message: 'User and associated reminders deleted successfully' });
    });

    it('should return 404 if user is not found', async () => {
      const req = mockRequest({}, { userId: 'non-existent-user' });
      const res = mockResponse();

      validation.sanitizeInput.mockReturnValue(true);
      User.findByPk.mockResolvedValue(null);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('getUserReminders', () => {
    it('should retrieve user\'s reminders', async () => {
      const req = mockRequest({}, { userId: 'user-123' });
      const res = mockResponse();

      validation.sanitizeInput.mockReturnValue(true);

      const mockUser = {
        id: 'user-123',
        phoneNumber: '+1234567890',
        reminderTime: '08:00',
        timezone: 'America/New_York',
        reminders: [
          { id: 'reminder-1', scheduledAt: new Date(), status: 'pending', sentAt: null },
          { id: 'reminder-2', scheduledAt: new Date(), status: 'sent', sentAt: new Date() }
        ]
      };

      User.findByPk.mockResolvedValue(mockUser);

      timeZoneHandler.convertFromUTC.mockImplementation(date => date);

      await getUserReminders(req, res);

      expect(User.findByPk).toHaveBeenCalledWith('user-123', expect.objectContaining({
        include: [{ model: Reminder, as: 'reminders', attributes: ['id', 'scheduledAt', 'status', 'sentAt'] }]
      }));
      expect(logger.logEvent).toHaveBeenCalledWith('info', 'User reminders retrieved successfully', { userId: 'user-123', reminderCount: 2 }, true);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user-123',
        phoneNumber: '+1234567890',
        reminderTime: '08:00',
        timezone: 'America/New_York',
        reminders: expect.arrayContaining([
          expect.objectContaining({ id: 'reminder-1' }),
          expect.objectContaining({ id: 'reminder-2' })
        ])
      }));
    });

    it('should return 404 if user is not found', async () => {
      const req = mockRequest({}, { userId: 'non-existent-user' });
      const res = mockResponse();

      validation.sanitizeInput.mockReturnValue(true);
      User.findByPk.mockResolvedValue(null);

      await getUserReminders(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });
});