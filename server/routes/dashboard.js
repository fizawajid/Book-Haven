const express = require("express");
const Book = require("../models/Book");
const Timer = require("../models/Timer")
const router = express.Router();

// GET /dashboard/summary/:readerid
router.get("/summary/:readerid", async (req, res) => {
    try {
      const readerId = Number(req.params.readerid); // ensure it's a number
  
      const totalBooks = await Book.countDocuments({
        readerid: readerId,
        reading_status: { $ne: "Trash" }
      });
      const completedBooks = await Book.countDocuments({ readerid: readerId, reading_status: "Completed" });
      const currentlyReading = await Book.countDocuments({ readerid: readerId, reading_status: "Reading" });
  
      res.json({ totalBooks, completedBooks, currentlyReading });
    } catch (err) {
      console.error("Error in /dashboard/summary/:readerid:", err);
      res.status(500).json({ error: "Server error while fetching summary" });
    }
  });
  router.get("/timer/:readerid", async (req, res) => {
    try {
        const readerId = Number(req.params.readerid);

        // Calculate 7 days ago from now (including today)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // include today + past 6 days

        const summary = await Timer.aggregate([
            {
                $addFields: {
                    date: { $toDate: "$date" } // ensure date is a Date type before match
                }
            },
            {
                $match: {
                    reader_id: readerId,
                    date: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalPages: { $sum: "$pages_read" },
                    totalRealTimeSeconds: { $sum: "$real_time" }
                }
            },
            {
                $project: {
                    date: "$_id",
                    totalPages: 1,
                    totalMinutes: { $divide: ["$totalRealTimeSeconds", 60] },
                    _id: 0
                }
            },
            { $sort: { date: 1 } }
        ]);

        console.log("Aggregated Summary:", summary);

        if (summary.length === 0) {
            return res.status(404).json({ message: "No reading data found for this reader." });
        }

        res.json(summary);
    } catch (err) {
        console.error("Error in /timer/:readerid:", err);
        res.status(500).json({ error: "Server error while fetching timer data" });
    }
});
router.get("/currently-reading/:readerid", async (req, res) => {
    const { readerid } = req.params;
    try {
      const books = await Book.find({ readerid, reading_status: "Reading" });
      res.json(books);
    } catch (err) {
      res.status(500).json({ message: "Error fetching currently reading books" });
    }
  });
  router.get("/genre-counts/:readerid", async (req, res) => {
    // Convert readerid to a Number
    const readerid = Number(req.params.readerid);  // Ensure readerid is a Number
  
    try {
      const genres = await Book.aggregate([
        { $match: { readerid: readerid , reading_status: { $ne: "Trash" } } },  // Match by readerid
        { $group: { _id: "$genre", count: { $sum: 1 } } }  // Group by genre
      ]);
  
      // Check if genres were returned
      console.log("Aggregated genres:", genres);
  
      if (genres.length === 0) {
        return res.status(404).json({ message: "No genres found for this reader." });
      }
  
      res.json(genres);  // Return the aggregated genres
    } catch (err) {
      console.error("Error fetching genre counts:", err);
      res.status(500).json({ message: "Error fetching genre counts" });
    }
  });
module.exports = router;