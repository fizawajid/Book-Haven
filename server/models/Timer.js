// models/Timer.js
const mongoose = require("mongoose");

const timerSchema = new mongoose.Schema({
  reader_id: { type: Number, required: true },
  bookId: { type: Number, required: true },
  duration: { type: Number, required: true },      // Planned duration in seconds
  real_time: { type: Number, required: true },      // Actual time in seconds
  date: { type: Date, default: Date.now },
  pages_read: { type: Number, required: true }
});

module.exports = mongoose.model("Timer", timerSchema);
