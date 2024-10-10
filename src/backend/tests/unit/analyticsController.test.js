const analyticsController = require('../../controllers/analyticsController');
const analyticsService = require('../../services/analyticsService');
const logger = require('../../utils/logger');
const { validateUserId, validateEventType, validateDateRange } = require('../../utils/validation');

// Mock the required modules
jest.mock('../../services/analyticsService');
jest.mock('../../utils/logger');
jest.mock('../../utils/validation');

describe('Analytics Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should track an event and return 201 status', async () => {
      // Arrange
      req.body = {
        userId: 'user123',
        eventType: 'REMINDER_SET',
        eventData: { reminderTime: '2023-05-01T10:00:00Z' }
      };
      analyticsService.trackEvent.mockResolvedValue();

      // Act
      await analyticsController.trackEvent(req, res, next);

      // Assert
      expect(validateUserId).toHaveBeenCalledWith('user123');
      expect(validateEventType).toHaveBeenCalledWith('REMINDER_SET');
      expect(analyticsService.trackEvent).toHaveBeenCalledWith('user123', 'REMINDER_SET', { reminderTime: '2023-05-01T10:00:00Z' });
      expect(logger.logEvent).toHaveBeenCalledWith('info', 'Analytics event tracked: REMINDER_SET', expect.any(Object), true, 'user123');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event tracked successfully' });
    });

    it('should handle validation errors and return 400 status', async () => {
      // Arrange
      req.body = {
        userId: 'invalid_user',
        eventType: 'INVALID_EVENT',
        eventData: {}
      };
      validateUserId.mockImplementation(() => {
        throw new Error('Invalid user ID');
      });

      // Act
      await analyticsController.trackEvent(req, res, next);

      // Assert
      expect(validateUserId).toHaveBeenCalledWith('invalid_user');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID' });
      expect(logger.logEvent).toHaveBeenCalledWith('error', 'Failed to track analytics event', expect.any(Object));
    });
  });

  describe('getUserEvents', () => {
    it('should retrieve user events and return 200 status', async () => {
      // Arrange
      req.params.userId = 'user123';
      req.query = { limit: '10', offset: '0', startDate: '2023-01-01', endDate: '2023-12-31' };
      const mockEvents = [{ id: 1, eventType: 'REMINDER_SET' }, { id: 2, eventType: 'REMINDER_SENT' }];
      analyticsService.getEventsByUser.mockResolvedValue(mockEvents);

      // Act
      await analyticsController.getUserEvents(req, res, next);

      // Assert
      expect(validateUserId).toHaveBeenCalledWith('user123');
      expect(analyticsService.getEventsByUser).toHaveBeenCalledWith('user123', {
        limit: 10,
        offset: 0,
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should handle errors and return 400 status', async () => {
      // Arrange
      req.params.userId = 'invalid_user';
      validateUserId.mockImplementation(() => {
        throw new Error('Invalid user ID');
      });

      // Act
      await analyticsController.getUserEvents(req, res, next);

      // Assert
      expect(validateUserId).toHaveBeenCalledWith('invalid_user');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID' });
      expect(logger.logEvent).toHaveBeenCalledWith('error', 'Failed to retrieve user events', expect.any(Object));
    });
  });

  describe('getEventsByType', () => {
    it('should retrieve events by type and return 200 status', async () => {
      // Arrange
      req.params.eventType = 'REMINDER_SET';
      req.query = { limit: '20', offset: '10', startDate: '2023-01-01', endDate: '2023-12-31' };
      const mockEvents = [{ id: 1, userId: 'user1' }, { id: 2, userId: 'user2' }];
      analyticsService.getEventsByType.mockResolvedValue(mockEvents);

      // Act
      await analyticsController.getEventsByType(req, res, next);

      // Assert
      expect(validateEventType).toHaveBeenCalledWith('REMINDER_SET');
      expect(analyticsService.getEventsByType).toHaveBeenCalledWith('REMINDER_SET', {
        limit: 20,
        offset: 10,
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should handle errors and return 400 status', async () => {
      // Arrange
      req.params.eventType = 'INVALID_TYPE';
      validateEventType.mockImplementation(() => {
        throw new Error('Invalid event type');
      });

      // Act
      await analyticsController.getEventsByType(req, res, next);

      // Assert
      expect(validateEventType).toHaveBeenCalledWith('INVALID_TYPE');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid event type' });
      expect(logger.logEvent).toHaveBeenCalledWith('error', 'Failed to retrieve events by type', expect.any(Object));
    });
  });

  describe('generateReport', () => {
    it('should generate an analytics report and return 200 status', async () => {
      // Arrange
      req.query = {
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      };
      const mockReport = {
        totalEvents: 100,
        eventsByType: {
          REMINDER_SET: 50,
          REMINDER_SENT: 50
        },
        uniqueUsers: 20
      };
      analyticsService.generateAnalyticsReport.mockResolvedValue(mockReport);

      // Act
      await analyticsController.generateReport(req, res, next);

      // Assert
      expect(validateDateRange).toHaveBeenCalledWith('2023-01-01', '2023-12-31');
      expect(analyticsService.generateAnalyticsReport).toHaveBeenCalledWith('2023-01-01', '2023-12-31');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReport);
    });

    it('should handle invalid date range and return 400 status', async () => {
      // Arrange
      req.query = {
        startDate: '2023-12-31',
        endDate: '2023-01-01'
      };
      validateDateRange.mockImplementation(() => {
        throw new Error('Invalid date range');
      });

      // Act
      await analyticsController.generateReport(req, res, next);

      // Assert
      expect(validateDateRange).toHaveBeenCalledWith('2023-12-31', '2023-01-01');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid date range' });
      expect(logger.logEvent).toHaveBeenCalledWith('error', 'Failed to generate analytics report', expect.any(Object));
    });
  });
});