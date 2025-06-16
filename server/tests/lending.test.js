const request = require('supertest');
const express = require('express');
const lendingRouter = require('../routes/lending');
const LendingTracker = require('../models/LendingTracker');
const Book = require('../models/Book');

const app = express();
app.use(express.json());
app.use('/lending', lendingRouter);

// Mock database models
jest.mock('../models/LendingTracker');
jest.mock('../models/Book');

describe('Lending Routes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /lent-out', () => {
    it('should return 400 if readerid is missing', async () => {
      const response = await request(app).get('/lending/lent-out');
      expect(response.status).toBe(400);
    });

    it('should fetch lent out books', async () => {
      Book.find.mockResolvedValue([{ bookid: 1 }, { bookid: 2 }]);
      LendingTracker.find.mockResolvedValue([{ bookId: 1, status: "lent" }]);
      Book.find.mockResolvedValueOnce([{ bookid: 1 }]);

      const response = await request(app).get('/lending/lent-out?readerid=123');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /borrowed', () => {
    it('should return 400 if readerid is missing', async () => {
      const response = await request(app).get('/lending/borrowed');
      expect(response.status).toBe(400);
    });

    it('should fetch borrowed books', async () => {
      Book.find.mockResolvedValue([{ bookid: 1 }]);
      LendingTracker.find.mockResolvedValue([{ bookId: 1, status: "borrowed" }]);
      Book.find.mockResolvedValueOnce([{ bookid: 1 }]);

      const response = await request(app).get('/lending/borrowed?readerid=123');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /:bookId', () => {
    it('should return 404 if lending record not found', async () => {
      LendingTracker.findOne.mockResolvedValue(null);

      const response = await request(app).get('/lending/10');
      expect(response.status).toBe(404);
    });

    it('should fetch lending status', async () => {
      LendingTracker.findOne.mockResolvedValue({ bookId: 10, status: "lent" });

      const response = await request(app).get('/lending/10');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /', () => {
    it('should return 400 if readerid is missing', async () => {
      const response = await request(app).get('/lending');
      expect(response.status).toBe(400);
    });

    it('should fetch lending records', async () => {
      Book.find.mockResolvedValue([{ bookid: 1 }]);
      LendingTracker.find.mockResolvedValue([{ bookId: 1, status: "lent" }]);

      const response = await request(app).get('/lending?readerid=123');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /', () => {
    it('should return 400 if fields are missing', async () => {
      const response = await request(app).post('/lending').send({});
      expect(response.status).toBe(400);
    });

    it('should return 404 if book not found', async () => {
      Book.findOne.mockResolvedValue(null);

      const response = await request(app).post('/lending').send({
        bookId: 1, personName: "John", status: "lent", date: "2024-04-25"
      });
      expect(response.status).toBe(404);
    });

    it('should return 400 if book is already lent', async () => {
      Book.findOne.mockResolvedValue({ bookid: 1 });
      LendingTracker.findOne.mockResolvedValue({ bookId: 1, status: "lent" });

      const response = await request(app).post('/lending').send({
        bookId: 1, personName: "John", status: "lent", date: "2024-04-25"
      });
      expect(response.status).toBe(400);
    });

    it('should create a lending record', async () => {
      Book.findOne.mockResolvedValue({ bookid: 1, readerid: 123 });
      LendingTracker.findOne.mockResolvedValue(null);
      LendingTracker.prototype.save = jest.fn().mockResolvedValue();

      const response = await request(app).post('/lending').send({
        bookId: 1, personName: "John", status: "lent", date: "2024-04-25"
      });
      expect(response.status).toBe(201);
    });
  });

  describe('DELETE /:bookId', () => {
    it('should return 404 if no record to delete', async () => {
      LendingTracker.deleteMany.mockResolvedValue({ deletedCount: 0 });

      const response = await request(app).delete('/lending/10');
      expect(response.status).toBe(404);
    });

    it('should delete lending record', async () => {
      LendingTracker.deleteMany.mockResolvedValue({ deletedCount: 1 });

      const response = await request(app).delete('/lending/10');
      expect(response.status).toBe(200);
    });
  });

});