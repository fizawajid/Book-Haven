const express = require("express");
const mongoose = require("mongoose");
const ReadingGoal = require("../models/ReadingGoal");
const Book = require("../models/Book"); // Import the Book model
const router = express.Router();
const auth = require("../middleware/auth");
// Helper function to get start & end dates
const getNewGoalDates = (type) => {
    const now = new Date();
    if (type === "year") {
        return {
            start: `${now.getFullYear()}-01-01`,
            end: `${now.getFullYear()}-12-31`
        };
    } else if (type === "month") {
        return {
            start: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]
        };
    } else if (type === "week") {
        const start = new Date(now.setDate(now.getDate() - now.getDay())); // Start of the week (Sunday)
        const end = new Date(start);
        end.setDate(end.getDate() + 6); // End of the week (Saturday)
        return {
            start: start.toISOString().split("T")[0],
            end: end.toISOString().split("T")[0]
        };
    }
};

// Fetch reading goals by reader_id and reset expired goals
router.get("/:rID", auth, async (req, res) => {
    try {
        if (Number(req.params.rID) !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
          }
        const readerId = Number(req.params.rID);
        console.log("Fetching goals for reader_id:", readerId);

        let goals = await ReadingGoal.findOne({ reader_id: readerId });

        if (!goals) {
            console.log("No goals found for reader:", readerId);
            return res.status(404).json({ message: "Goals not found" });
        }

        const today = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format
        let updatedFields = {}; // Store fields to update if necessary

        // Reset yearly goal if the year has ended
        if (today > goals.year_end) {
            const newDates = getNewGoalDates("year");
            updatedFields.year_start = newDates.start;
            updatedFields.year_end = newDates.end;
            updatedFields.yearly_goal = 0;
            updatedFields.yearly_progress = 0;
        }

        // Reset monthly goal if the month has ended
        if (today > goals.month_end) {
            const newDates = getNewGoalDates("month");
            updatedFields.month_start = newDates.start;
            updatedFields.month_end = newDates.end;
            updatedFields.monthly_goal = 0;
            updatedFields.monthly_progress = 0;
        }

        // Reset weekly goal if the week has ended
        if (today > goals.week_end) {
            const newDates = getNewGoalDates("week");
            updatedFields.week_start = newDates.start;
            updatedFields.week_end = newDates.end;
            updatedFields.weekly_goal = 0;
            updatedFields.weekly_progress = 0;
        }

        // If any goal was reset, update in the database
        if (Object.keys(updatedFields).length > 0) {
            await ReadingGoal.updateOne({ reader_id: readerId }, { $set: updatedFields });
            goals = await ReadingGoal.findOne({ reader_id: readerId }); // Fetch updated data
        }

        // Fetch completed books within goal time ranges
        const yearlyCompleted = await Book.countDocuments({
            readerid: readerId,
            reading_status: "Completed",
            end_date: { $gte: goals.year_start, $lte: goals.year_end }
        });

        const monthlyCompleted = await Book.countDocuments({
            readerid: readerId,
            reading_status: "Completed",
            end_date: { $gte: goals.month_start, $lte: goals.month_end }
        });

        const weeklyCompleted = await Book.countDocuments({
            readerid: readerId,
            reading_status: "Completed",
            end_date: { $gte: goals.week_start, $lte: goals.week_end }
        });

        // Update the goal progress dynamically
        const updatedGoals = {
            ...goals.toObject(),
            yearly_progress: yearlyCompleted,
            monthly_progress: monthlyCompleted,
            weekly_progress: weeklyCompleted
        };

        res.json(updatedGoals);
    } catch (error) {
        console.error("Error fetching reading goals:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Create new reading goals if they don't exist
const createNewGoals = async (readerId, goalData, res) => {
    try {
        const yearDates = getNewGoalDates("year");
        const monthDates = getNewGoalDates("month");
        const weekDates = getNewGoalDates("week");

        const newGoals = new ReadingGoal({
            reader_id: readerId,
            year_start: yearDates.start,
            year_end: yearDates.end,
            yearly_goal: goalData.yearly_goal,
            yearly_progress: 0,
            month_start: monthDates.start,
            month_end: monthDates.end,
            monthly_goal: goalData.monthly_goal,
            monthly_progress: 0,
            week_start: weekDates.start,
            week_end: weekDates.end,
            weekly_goal: goalData.weekly_goal,
            weekly_progress: 0
        });

        const savedGoals = await newGoals.save();
        return res.status(201).json(savedGoals);
    } catch (error) {
        console.error("Error creating new reading goals:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update existing goals or create if not found
router.put("/:rID", auth, async (req, res) => {
    try {
        if (Number(req.params.rID) !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
          }
        const readerId = Number(req.params.rID);
        console.log("Updating goals for reader_id:", readerId);

        let updatedGoals = await ReadingGoal.findOneAndUpdate(
            { reader_id: readerId },
            req.body,
            { new: true } // Return updated document
        );

        // If no goals exist, create new ones
        if (!updatedGoals) {
            console.log("No existing goals found, creating new goals.");
            return createNewGoals(readerId, req.body, res);
        }

        res.json(updatedGoals);
    } catch (error) {
        console.error("Error updating reading goals:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
