const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const connectDB = require("./config/db");
const booksRoutes = require("./routes/books");
const readersRoutes = require("./routes/readers");
const readingGoalsRoutes = require("./routes/readingGoals");
const timerRoutes = require("./routes/timer");
const dashboardRoutes = require("./routes/dashboard");
const deleteOldTrash = require("./deleteOldTrash");
const summaryRoute = require("./routes/summary");
const lendingRoutes = require('./routes/lending');
const uploadProfileRoute = require("./routes/uploadProfile");
const adminRoutes = require("./routes/admin");

require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // Parse cookies

// CORS configuration must come before session middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 24 hours (1 day)
      httpOnly: true,
      sameSite: 'lax'
    },
    name: 'bookhaven.sid', // Custom session name
  })
);

// Add session debugging middleware
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session Data:', req.session);
  next();
});

// Connect to MongoDB
connectDB();

// Routes
app.use("/book", booksRoutes);
app.use("/reader", readersRoutes);
app.use("/reading-goals", readingGoalsRoutes); 
app.use("/timer", timerRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/summary", summaryRoute);
app.use("/lending", lendingRoutes);
app.use("/profile-pic", uploadProfileRoute);
app.use("/admin", adminRoutes);

// Startup Cleanup
console.log("Running startup trash cleanup...");
//deleteOldTrash();

// Start server
app.listen(8000, () => {
  console.log("Server started on port 8000");
});
