// tests/timer.test.js
const request = require("supertest");
const express = require('express');

// Create a mock Timer model with save method
const mockSave = jest.fn();
jest.mock("../models/Timer", () => {
  return jest.fn().mockImplementation(function(data) {
    // Store the data on the instance
    Object.assign(this, data);
    // Add the save method
    this.save = mockSave;
    // Return the instance
    return this;
  });
});

// Import Timer after mocking
const Timer = require("../models/Timer");

// Create test app
const app = express();
app.use(express.json());
app.use('/timer', require('../routes/timer'));

describe("POST /timer/log", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/timer/log")
      .send({
        reader_id: 1,   // Missing bookId and pages_read
        duration: 30,
        real_time: 25
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Missing required fields.");
  });

  it("should log a new timer session successfully", async () => {
    const mockSession = {
      reader_id: 1,
      bookId: 101,
      duration: 30,
      real_time: 25,
      pages_read: 15,
      date: new Date()
    };

    // Configure mockSave to resolve with the session data
    mockSave.mockResolvedValueOnce(mockSession);

    const res = await request(app)
      .post("/timer/log")
      .send(mockSession);

    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Timer session logged successfully!");
    // Make sure the Mongoose document was passed correctly to the response
    expect(res.body).toHaveProperty("session");
    expect(res.body.session).toHaveProperty("reader_id", mockSession.reader_id);
    expect(res.body.session).toHaveProperty("bookId", mockSession.bookId);
  });

  it("should return 500 if there is a server error", async () => {
    const mockSession = {
      reader_id: 1,
      bookId: 101,
      duration: 30,
      real_time: 25,
      pages_read: 15
    };

    // Make the save method throw an error for this test
    mockSave.mockRejectedValueOnce(new Error("Server error"));

    const res = await request(app)
      .post("/timer/log")
      .send(mockSession);

    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to save timer session.");
    expect(res.body.error).toBe("Server error");
  });
});