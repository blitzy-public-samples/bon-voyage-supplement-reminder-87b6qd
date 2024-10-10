const supertest = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const { app } = require('../../app');
const { User } = require('../../models/User');
const { Reminder } = require('../../models/Reminder');
const { redisClient } = require('../../config/redis');
const { encrypt } = require('../../utils/encryption');
const { validatePhoneNumber, validateTimeZone } = require('../../utils/validation');

const request = supertest(app);

describe('API Integration Tests', () => {
  let sandbox;

  before(async () => {
    sandbox = sinon.createSandbox();
    await redisClient.connect();
  });

  after(async () => {
    sandbox.restore();
    await redisClient.quit();
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true });
    await Reminder.destroy({ where: {}, truncate: true });
    await redisClient.flushAll();
  });

  const generateRandomPhoneNumber = () => {
    return `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  };

  const testUser = {
    phoneNumber: generateRandomPhoneNumber(),
    reminderTime: '09:00',
    timezone: 'America/New_York'
  };

  const testReminder = {
    scheduledAt: '2023-07-01T09:00:00.000Z',
    status: 'pending'
  };

  describe('User Registration', () => {
    it('should successfully register a new user', async () => {
      const response = await request
        .post('/api/v1/users/register')
        .send(testUser);

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('userId');
      expect(response.body).to.have.property('message', 'User registered successfully');

      const user = await User.findOne({ where: { phoneNumber: encrypt(testUser.phoneNumber) } });
      expect(user).to.not.be.null;
    });

    it('should reject registration with invalid phone number', async () => {
      const invalidUser = { ...testUser, phoneNumber: '12345' };
      const response = await request
        .post('/api/v1/users/register')
        .send(invalidUser);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'Invalid phone number format');
    });

    it('should reject registration with missing reminder time', async () => {
      const invalidUser = { ...testUser };
      delete invalidUser.reminderTime;
      const response = await request
        .post('/api/v1/users/register')
        .send(invalidUser);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'Reminder time is required');
    });

    it('should reject duplicate phone number registration', async () => {
      await request.post('/api/v1/users/register').send(testUser);

      const response = await request
        .post('/api/v1/users/register')
        .send(testUser);

      expect(response.status).to.equal(409);
      expect(response.body).to.have.property('error', 'Phone number already registered');
    });
  });

  describe('Reminder Creation', () => {
    let userId;

    beforeEach(async () => {
      const response = await request
        .post('/api/v1/users/register')
        .send(testUser);
      userId = response.body.userId;
    });

    it('should successfully create a reminder', async () => {
      const reminderData = { ...testReminder, userId };
      const response = await request
        .post('/api/v1/reminders/create')
        .send(reminderData);

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('reminderId');
      expect(response.body).to.have.property('message', 'Reminder created successfully');

      const reminder = await Reminder.findOne({ where: { userId } });
      expect(reminder).to.not.be.null;
    });

    it('should reject reminder creation with invalid user ID', async () => {
      const invalidReminder = { ...testReminder, userId: 'invalid_id' };
      const response = await request
        .post('/api/v1/reminders/create')
        .send(invalidReminder);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'Invalid user ID');
    });

    it('should reject reminder creation with invalid time format', async () => {
      const invalidReminder = { ...testReminder, userId, scheduledAt: 'invalid_time' };
      const response = await request
        .post('/api/v1/reminders/create')
        .send(invalidReminder);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'Invalid scheduled time format');
    });

    it('should reject reminder creation exceeding daily limit', async () => {
      const maxReminders = 5;
      for (let i = 0; i < maxReminders; i++) {
        await request
          .post('/api/v1/reminders/create')
          .send({ ...testReminder, userId });
      }

      const response = await request
        .post('/api/v1/reminders/create')
        .send({ ...testReminder, userId });

      expect(response.status).to.equal(429);
      expect(response.body).to.have.property('error', 'Daily reminder limit exceeded');
    });
  });

  describe('Reminder Modification', () => {
    let userId, reminderId;

    beforeEach(async () => {
      const userResponse = await request
        .post('/api/v1/users/register')
        .send(testUser);
      userId = userResponse.body.userId;

      const reminderResponse = await request
        .post('/api/v1/reminders/create')
        .send({ ...testReminder, userId });
      reminderId = reminderResponse.body.reminderId;
    });

    it('should successfully modify a reminder', async () => {
      const updatedReminder = {
        scheduledAt: '2023-07-02T10:00:00.000Z',
        status: 'pending'
      };

      const response = await request
        .put(`/api/v1/reminders/${reminderId}`)
        .send(updatedReminder);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'Reminder updated successfully');

      const reminder = await Reminder.findByPk(reminderId);
      expect(reminder.scheduledAt.toISOString()).to.equal(updatedReminder.scheduledAt);
    });

    it('should reject modification of non-existent reminder', async () => {
      const nonExistentId = 'non_existent_id';
      const response = await request
        .put(`/api/v1/reminders/${nonExistentId}`)
        .send(testReminder);

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('error', 'Reminder not found');
    });

    it('should reject modification with invalid time format', async () => {
      const invalidReminder = { ...testReminder, scheduledAt: 'invalid_time' };
      const response = await request
        .put(`/api/v1/reminders/${reminderId}`)
        .send(invalidReminder);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'Invalid scheduled time format');
    });

    it('should reject unauthorized modification attempt', async () => {
      const newUserResponse = await request
        .post('/api/v1/users/register')
        .send({ ...testUser, phoneNumber: generateRandomPhoneNumber() });
      const newUserId = newUserResponse.body.userId;

      const response = await request
        .put(`/api/v1/reminders/${reminderId}`)
        .send({ ...testReminder, userId: newUserId });

      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('error', 'Unauthorized to modify this reminder');
    });
  });

  describe('Reminder Cancellation', () => {
    let userId, reminderId;

    beforeEach(async () => {
      const userResponse = await request
        .post('/api/v1/users/register')
        .send(testUser);
      userId = userResponse.body.userId;

      const reminderResponse = await request
        .post('/api/v1/reminders/create')
        .send({ ...testReminder, userId });
      reminderId = reminderResponse.body.reminderId;
    });

    it('should successfully cancel a reminder', async () => {
      const response = await request
        .delete(`/api/v1/reminders/${reminderId}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'Reminder cancelled successfully');

      const reminder = await Reminder.findByPk(reminderId);
      expect(reminder).to.be.null;
    });

    it('should reject cancellation of non-existent reminder', async () => {
      const nonExistentId = 'non_existent_id';
      const response = await request
        .delete(`/api/v1/reminders/${nonExistentId}`);

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('error', 'Reminder not found');
    });

    it('should reject unauthorized cancellation attempt', async () => {
      const newUserResponse = await request
        .post('/api/v1/users/register')
        .send({ ...testUser, phoneNumber: generateRandomPhoneNumber() });
      const newUserId = newUserResponse.body.userId;

      const newReminderResponse = await request
        .post('/api/v1/reminders/create')
        .send({ ...testReminder, userId: newUserId });
      const newReminderId = newReminderResponse.body.reminderId;

      const response = await request
        .delete(`/api/v1/reminders/${newReminderId}`)
        .set('Authorization', `Bearer ${userId}`);

      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('error', 'Unauthorized to cancel this reminder');
    });
  });

  describe('Analytics', () => {
    let userId;

    beforeEach(async () => {
      const userResponse = await request
        .post('/api/v1/users/register')
        .send(testUser);
      userId = userResponse.body.userId;
    });

    it('should successfully log an event', async () => {
      const eventData = {
        eventType: 'reminder_sent',
        eventData: { userId, reminderId: 'sample_reminder_id' }
      };
      const response = await request
        .post('/api/v1/analytics/event')
        .send(eventData);

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('message', 'Event logged successfully');
    });

    it('should retrieve analytics summary', async () => {
      const response = await request
        .get('/api/v1/analytics/summary')
        .query({ startDate: '2023-01-01', endDate: '2023-12-31' });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('totalUsers');
      expect(response.body).to.have.property('activeReminders');
      expect(response.body).to.have.property('reminderSentCount');
    });

    it('should reject unauthorized access to analytics data', async () => {
      const response = await request
        .get('/api/v1/analytics/summary')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('error', 'Unauthorized access');
    });
  });
});