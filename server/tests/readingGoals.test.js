const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const ReadingGoal = require('../models/ReadingGoal');
const Book = require('../models/Book');
const readingGoalsRouter = require('../routes/readingGoals');

jest.mock('../models/ReadingGoal');
jest.mock('../models/Book');

// Mock auth middleware
jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { id: 1 }; // Mock authenticated user
  next();
});

const app = express();
app.use(express.json());
app.use('/reading-goals', readingGoalsRouter);

describe('Reading Goals Routes', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /reading-goals/:rID', () => {
    it('should fetch reading goals successfully', async () => {
      const mockGoals = {
        reader_id: 1,
        year_start: '2025-01-01',
        year_end: '2025-12-31',
        month_start: '2025-04-01',
        month_end: '2025-04-30',
        week_start: '2025-04-20',
        week_end: '2025-04-26',
        toObject: function() { return this; } // Needed because code calls toObject()
      };

      ReadingGoal.findOne.mockResolvedValue(mockGoals);
      Book.countDocuments.mockResolvedValue(5); // Simulate 5 books completed for all goals

      const res = await request(app).get('/reading-goals/1');

      expect(res.status).toBe(200);
      expect(res.body.yearly_progress).toBe(5);
      expect(res.body.monthly_progress).toBe(5);
      expect(res.body.weekly_progress).toBe(5);
    });

    it('should return 403 if user tries to access another user\'s goals', async () => {
      const res = await request(app).get('/reading-goals/2'); // user.id is mocked as 1

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Access denied');
    });

    it('should return 404 if no goals found', async () => {
      ReadingGoal.findOne.mockResolvedValue(null);

      const res = await request(app).get('/reading-goals/1');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Goals not found');
    });

    it('should handle server errors', async () => {
      ReadingGoal.findOne.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/reading-goals/1');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  describe('PUT /reading-goals/:rID', () => {
    it('should update reading goals if they exist', async () => {
      const updatedGoals = { reader_id: 1, yearly_goal: 10 };

      ReadingGoal.findOneAndUpdate.mockResolvedValue(updatedGoals);

      const res = await request(app)
        .put('/reading-goals/1')
        .send({ yearly_goal: 10 });

      expect(res.status).toBe(200);
      expect(res.body.yearly_goal).toBe(10);
    });

    it('should create new goals if none exist', async () => {
      ReadingGoal.findOneAndUpdate.mockResolvedValue(null);
      ReadingGoal.prototype.save = jest.fn().mockResolvedValue({
        reader_id: 1,
        yearly_goal: 15,
        monthly_goal: 5,
        weekly_goal: 2,
      });

      const res = await request(app)
        .put('/reading-goals/1')
        .send({ yearly_goal: 15, monthly_goal: 5, weekly_goal: 2 });

      expect(res.status).toBe(201);
      expect(res.body.yearly_goal).toBe(15);
      expect(res.body.monthly_goal).toBe(5);
    });

    it('should return 403 if trying to update another user\'s goals', async () => {
      const res = await request(app)
        .put('/reading-goals/2')
        .send({ yearly_goal: 10 });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Access denied');
    });

    it('should handle server errors during update', async () => {
      ReadingGoal.findOneAndUpdate.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .put('/reading-goals/1')
        .send({ yearly_goal: 10 });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

});
