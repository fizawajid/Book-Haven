const request = require('supertest');
const express = require('express');
const summaryRouter = require('../routes/summary');

// MOCK the Gemini AI
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => "This is a mock summary of the book."
          }
        })
      })
    }))
  };
});

const app = express();
app.use(express.json());
app.use('/summary', summaryRouter);

describe('POST /summary', () => {
  it('should return 400 if bookName is missing', async () => {
    const response = await request(app)
      .post('/summary')
      .send({ authorName: "J.K. Rowling" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Missing bookName or authorName");
  });

  it('should return 400 if authorName is missing', async () => {
    const response = await request(app)
      .post('/summary')
      .send({ bookName: "Harry Potter" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Missing bookName or authorName");
  });

  it('should attempt to generate a summary with correct input', async () => {
    const response = await request(app)
      .post('/summary')
      .send({ bookName: "Harry Potter", authorName: "J.K. Rowling" });

    expect(response.status).toBe(200);
    expect(response.body.summary).toBe("This is a mock summary of the book.");
  });
});
