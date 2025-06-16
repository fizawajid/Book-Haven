const express = require("express");

const Reader = require("../models/Reader");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const router = express.Router();
const SystemSettings = require('../models/SystemSettings');

// Test endpoint to check session status - MUST BE BEFORE /:id route
router.get("/check-session", auth, (req, res) => {
  res.json({
    sessionExists: !!req.session,
    sessionId: req.sessionID,
    readerId: req.session?.reader_id,
    user: req.user,
    message: "Session check successful"
  });
});

// Get All Readers
router.get("/", async (req, res) => {
    try {
        // Check if the requested ID matches the token's user ID
        if (req.params.id !== req.user.id) {
          return res.status(403).json({ message: "Access denied: You can only access your own profile." });
        }
    
        const reader = await Reader.findById(req.params.id);
        if (!reader) {
          return res.status(404).json({ message: "Reader not found" });
        }
    
        res.json({ reader: readerData });
      } catch (error) {
        console.error("Error fetching reader:", error);
        res.status(500).json({ message: "Error fetching reader details", error });
      }
});

// Get reader by ID - MUST BE AFTER /check-session route
router.get("/:id",  auth, async (req, res) => {
    try {
      if (Number(req.params.id) !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
        const reader = await Reader.findOne({ reader_id: req.params.id }) || await Reader.findById(req.params.id);
        if (!reader) {
            return res.status(404).json({ message: "Reader not found" });
        }
    
        res.json({ reader });
    } catch (error) {
        console.error("Error fetching reader:", error);
        res.status(500).json({ message: "Error fetching reader details", error });
    }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check system downtime
    const settings = await SystemSettings.getSettings();
    if (settings.isDowntimeEnabled) {
      // First check if the user is an admin
      const reader = await Reader.findOne({ email });
      if (!reader || !reader.isAdmin) {
        return res.status(503).json({ 
          message: settings.downtimeMessage,
          isDowntime: true
        });
      }
      // If we get here, the user is an admin, so we continue with login
    }

    const reader = await Reader.findOne({ email });
    if (!reader) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, reader.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate token
    const token = jwt.sign({ 
      id: reader.reader_id,
      isAdmin: reader.isAdmin 
    }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Initialize session
    req.session.reader_id = reader.reader_id;
    req.session.reader_email = reader.email;
    req.session.token = token;
    req.session.isAdmin = reader.isAdmin;

    // Return success with token and reader info
    res.json({ 
      message: "Login successful", 
      reader_id: reader.reader_id,
      token: token,
      isAdmin: reader.isAdmin
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});


// **Register Route**
router.post("/register", async (req, res) => {
    const { first_name, last_name, email, password, date_of_birth } = req.body;

    try {
        const existingReader = await Reader.findOne({ email });
        if (existingReader) {
            return res.status(400).json({ message: "Email already registered." });
        }

        const newReader = new Reader({ first_name, last_name, email, password, date_of_birth });
        await newReader.save();

        res.json({ message: "Registration successful" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Add update-last-login endpoint
router.post("/update-last-login", auth, async (req, res) => {
  const { reader_id } = req.body;
  if (!reader_id) {
    return res.status(400).json({ error: "Reader ID is required" });
  }
  try {
    await Reader.updateOne({ reader_id }, { $set: { last_login: new Date() } });
    res.json({ message: "Last login updated successfully" });
  } catch (error) {
    console.error("Error updating last login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
