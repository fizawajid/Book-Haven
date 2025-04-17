const express = require("express");
const cors = require("cors"); // Import CORS
const cron = require("node-cron");
const connectDB = require("./config/db");
const booksRoutes = require("./routes/books");
const readersRoutes = require("./routes/readers");
const readingGoalsRoutes = require("./routes/readingGoals");
const timerRoutes = require("./routes/timer");
const dashboardRoutes = require("./routes/dashboard")
const deleteOldTrash = require("./deleteOldTrash");
const summaryRoute = require("./routes/summary");
const uploadProfileRoute = require("./routes/uploadProfile");

require("dotenv").config();

const app = express();
app.use(express.json()); // Middleware for JSON parsing
app.use(cors()); // Enable CORS globally
const lendingRoutes = require('./routes/lending');


// Connect to Database
connectDB();

// Routes
app.use("/book", booksRoutes);
app.use("/reader", readersRoutes);
app.use("/reading-goals", readingGoalsRoutes); 
app.use("/timer", timerRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/summary", summaryRoute);
app.use('/lending', lendingRoutes);
app.use("/profile-pic", uploadProfileRoute);

console.log("Running startup trash cleanup...");
deleteOldTrash();

  
app.listen(8000, () => {
    console.log("Server started on port 8000");
});