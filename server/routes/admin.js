const express = require("express");
const router = express.Router();
const Reader = require("../models/Reader");
const Book = require("../models/Book");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const SystemSettings = require('../models/SystemSettings');
const bcrypt = require("bcryptjs");

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
  next();
};

// Apply auth and admin middleware to all routes
router.use(auth, isAdmin);

// Verify admin password
router.post("/verify-password", async (req, res) => {
  try {
    const { password } = req.body;
    const admin = await Reader.findOne({ reader_id: req.user.id });
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    res.json({ verified: isMatch });
  } catch (error) {
    console.error("Error verifying password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await Reader.find({}, { password: 0 });
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const user = await Reader.findOne({ reader_id: req.params.id }, { password: 0 });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user
router.put("/users/:id", async (req, res) => {
  try {
    const { first_name, last_name, email, isAdmin } = req.body;
    const user = await Reader.findOne({ reader_id: req.params.id });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (email) user.email = email;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await Reader.findOne({ reader_id: req.params.id });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Reader.deleteOne({ reader_id: req.params.id });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get dashboard statistics
router.get("/dashboard", async (req, res) => {
  try {
    // Get total users and admin users
    const totalUsers = await Reader.countDocuments();
    const totalAdmins = await Reader.countDocuments({ isAdmin: true });
    
    // Get total books
    const totalBooks = await Book.countDocuments();

    // Get recent activities (last 10 user logins)
    const recentLogins = await Reader.find({}, { 
      first_name: 1, 
      last_name: 1, 
      last_login: 1, 
      isAdmin: 1 
    })
    .sort({ last_login: -1 })
    .limit(10);

    const recentActivities = recentLogins.map(user => ({
      type: user.isAdmin ? 'admin' : 'user',
      description: `${user.first_name} ${user.last_name} logged in`,
      timestamp: user.last_login || new Date()
    }));

    res.json({
      totalUsers,
      totalAdmins,
      totalBooks,
      recentActivities
    });
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
});

// Get system status
router.get("/system-status", async (req, res) => {
  try {
    // Check database connection state
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1; // 1 = connected
    
    // Get database stats using the native driver
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    
    // Get connection pool stats
    const poolStats = {
      totalConnections: serverStatus.connections?.current || 0,
      activeConnections: serverStatus.connections?.active || 0,
      databaseName: mongoose.connection.name,
      databaseState: getConnectionStateName(dbState),
      // Add more detailed connection info
      connectionDetails: {
        current: serverStatus.connections?.current || 0,
        available: serverStatus.connections?.available || 0,
        active: serverStatus.connections?.active || 0,
        pending: serverStatus.connections?.pending || 0
      }
    };

    res.json({
      database: dbStatus,
      metrics: {
        database: poolStats,
        lastChecked: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error checking system status:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message,
      status: {
        database: false
      }
    });
  }
});

// Get system settings
router.get('/system-settings', async (req, res) => {
  try {
    const settings = await SystemSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system settings' });
  }
});

// Update system settings
router.post('/system-settings', async (req, res) => {
  try {
    const { isDowntimeEnabled, downtimeMessage } = req.body;
    const settings = await SystemSettings.getSettings();
    
    settings.isDowntimeEnabled = isDowntimeEnabled;
    if (downtimeMessage) {
      settings.downtimeMessage = downtimeMessage;
    }
    settings.lastUpdated = new Date();
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating system settings' });
  }
});

// Helper function to get connection state name
function getConnectionStateName(state) {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[state] || 'unknown';
}

module.exports = router; 