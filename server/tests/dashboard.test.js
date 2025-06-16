const request = require("supertest");
const express = require("express");
const dashboardRouter = require("../routes/dashboard");
const Book = require("../models/Book");
const Timer = require("../models/Timer");

jest.mock("../models/Book");
jest.mock("../models/Timer");


jest.mock("../middleware/auth", () => (req, res, next) => {
    req.user = { id: 1 };  // simulate a logged-in user
    next();
  });
  
  jest.mock("../middleware/sessionAuth", () => (req, res, next) => {
    next();
  });
  

// Mock middleware to bypass auth/sessionAuth
const app = express();
app.use(express.json());

// Fake auth middlewares to inject req.user
app.use((req, res, next) => {
  req.user = { id: 1 };
  next();
});
app.use("/dashboard", dashboardRouter);

describe("Dashboard routes", () => {

  describe("GET /dashboard/summary/:readerid", () => {
    it("should return summary for valid reader", async () => {
      Book.countDocuments
        .mockResolvedValueOnce(10) // totalBooks
        .mockResolvedValueOnce(5)  // completedBooks
        .mockResolvedValueOnce(3); // currentlyReading

      const res = await request(app).get("/dashboard/summary/1");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        totalBooks: 10,
        completedBooks: 5,
        currentlyReading: 3,
      });
    });

    it("should deny access for mismatched reader id", async () => {
      const res = await request(app).get("/dashboard/summary/2");
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Access denied");
    });

    it("should handle server error", async () => {
      Book.countDocuments.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/dashboard/summary/1");
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe("Server error while fetching summary");
    });
  });

  describe("GET /dashboard/timer/:readerid", () => {
    it("should return aggregated timer data", async () => {
      Timer.aggregate.mockResolvedValue([
        { date: "2025-04-20", totalPages: 50, totalMinutes: 30 },
        { date: "2025-04-21", totalPages: 20, totalMinutes: 12 },
      ]);

      const res = await request(app).get("/dashboard/timer/1");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it("should return 404 if no timer data", async () => {
      Timer.aggregate.mockResolvedValue([]);

      const res = await request(app).get("/dashboard/timer/1");
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("No reading data found for this reader.");
    });

    it("should handle server error", async () => {
      Timer.aggregate.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/dashboard/timer/1");
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe("Server error while fetching timer data");
    });
  });

  describe("GET /dashboard/currently-reading/:readerid", () => {
    it("should return currently reading books", async () => {
      Book.find.mockResolvedValue([{ title: "Book 1" }, { title: "Book 2" }]);

      const res = await request(app).get("/dashboard/currently-reading/1");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it("should handle server error", async () => {
      Book.find.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/dashboard/currently-reading/1");
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe("Error fetching currently reading books");
    });
  });

  describe("GET /dashboard/genre-counts/:readerid", () => {
    it("should return genre counts", async () => {
      Book.aggregate.mockResolvedValue([
        { _id: "Fantasy", count: 5 },
        { _id: "Sci-Fi", count: 3 },
      ]);

      const res = await request(app).get("/dashboard/genre-counts/1");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it("should return 404 if no genres found", async () => {
      Book.aggregate.mockResolvedValue([]);

      const res = await request(app).get("/dashboard/genre-counts/1");
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("No genres found for this reader.");
    });

    it("should handle server error", async () => {
      Book.aggregate.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/dashboard/genre-counts/1");
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe("Error fetching genre counts");
    });
  });

});