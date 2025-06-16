const express = require("express");
const Timer = require("../models/Timer");
const router = express.Router();

router.post("/log", async (req, res) => {
    console.log("Received Timer Data:", req.body);  // Log incoming data

    const { reader_id, bookId, duration, real_time, pages_read } = req.body;

    // Check for missing required fields
    if (!reader_id || !bookId  || !pages_read) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    try {
        // Create a new Timer session object
        const newSession = new Timer({
            reader_id: reader_id, // Use reader_id passed in the body
            bookId: bookId,
            duration: Number(duration),
            real_time: Number(real_time),
            pages_read: Number(pages_read),
            date: new Date(), // Optionally override if needed
        });

        // Save the session to the database
        await newSession.save();
        res.status(201).json({ message: "Timer session logged successfully!", session: newSession });
    } catch (err) {
        console.error("Error saving timer session:", err);
        res.status(500).json({ message: "Failed to save timer session.", error: err.message });
    }
});


module.exports = router;
