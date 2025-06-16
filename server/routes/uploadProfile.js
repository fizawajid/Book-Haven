const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Reader = require("../models/Reader");
const Book = require('../models/Book');
const Favorite = require('../models/Favorite');
const LendingTracker = require('../models/LendingTracker');
const Quote = require('../models/Quote');
const ReadingGoal = require('../models/ReadingGoal');
const Rereader = require('../models/Rereader');
const Tag = require('../models/Tag');
const Timer = require('../models/Timer');
const Trash = require('../models/Trash');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-profile", upload.single("image"), async (req, res) => {
    const { readerId } = req.body;

    if (!req.file || !readerId) {
        return res.status(400).json({ error: "Image and readerId are required" });
    }

    try {
        // Upload image to Cloudinary using a promise wrapper
        const uploadedImage = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "BookHaven/ProfilePics" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        // Save the image URL to the reader's profile in DB
        await Reader.updateOne(
            { reader_id: readerId },
            { $set: { profilePicUrl: uploadedImage.secure_url } }
        );

        // Return the URL to the frontend
        res.json({
            message: "Upload successful",
            profilePicUrl: uploadedImage.secure_url,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload failed" });
    }
});
router.post("/remove-profile", async (req, res) => {
    const { readerId } = req.body;
  
    if (!readerId) {
      return res.status(400).json({ error: "readerId is required" });
    }
  
    try {
      await Reader.updateOne({ reader_id: readerId }, { $set: { profilePicUrl: "" } });
      res.json({ message: "Profile picture removed" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to remove profile picture" });
    }
  });
  
// Route to update reader's details
router.post("/update-reader-info", async (req, res) => {
    const { readerId, first_name, last_name, email } = req.body;

    if (!readerId || !first_name || !last_name || !email) {
        return res.status(400).json({ error: "All fields (first_name, last_name, email, readerId) are required" });
    }

    try {
        const updatedReader = await Reader.updateOne(
            { reader_id: readerId },
            { $set: { first_name, last_name, email } }
        );

        if (updatedReader.nModified === 0) {
            return res.status(400).json({ error: "No changes made or reader not found" });
        }

        res.json({
            message: "Reader info updated successfully",
            reader: { first_name, last_name, email },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Update failed" });
    }
});
router.post("/update-password", auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
  
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }
  
    try {
      // Use reader_id from the authenticated user
      const reader = await Reader.findOne({ reader_id: req.user.id });
  
      if (!reader) {
        return res.status(404).json({ error: "Reader not found." });
      }
  
      // Compare current password
      const isMatch = await bcrypt.compare(currentPassword, reader.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Current password is incorrect." });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the password
      await Reader.updateOne(
        { reader_id: req.user.id },
        { $set: { password: hashedPassword } }
      );
  
      res.json({ message: "Password updated successfully." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Update failed." });
    }
  });

router.post("/delete-account", async (req, res) => {
    const { reader_id } = req.body;
  
    if (!reader_id) {
      return res.status(400).json({ error: "Reader ID is required" });
    }
  
    try {
      // 1. Find all books owned by the reader
      const books = await Book.find({ readerid: reader_id });
      const bookIds = books.map(book => book.bookid);
  
      await Favorite.deleteMany({ bookId: { $in: bookIds } });
      await LendingTracker.deleteMany({ bookId: { $in: bookIds } });
      await Quote.deleteMany({ bookId: { $in: bookIds } });
      await ReadingGoal.deleteOne({ reader_id });
      await Rereader.deleteMany({ bookid: { $in: bookIds } });
      await Tag.deleteMany({ bookid: { $in: bookIds } });
      await Timer.deleteMany({ bookId: { $in: bookIds } });
      await Trash.deleteMany({ bookId: { $in: bookIds } });
      await Book.deleteMany({ readerid: reader_id });
      await Reader.deleteOne({ reader_id });
  
      res.status(200).json({ message: "Reader and related data deleted successfully." });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

module.exports = router;
