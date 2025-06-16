const mongoose = require("mongoose")
const AutoIncrement = require("mongoose-sequence")(mongoose)

const lendingTrackerSchema = new mongoose.Schema(
  {
    bookId: {
      type: Number,
      required: true,
      ref: "Book", // Reference to the Book model
    },
    personName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["lent", "borrowed"],
      default: "lent",
    },
    date: {
      type: String,
      required: true,
    },
    lendingId: Number,
    readerid: Number, // To track which reader lent the book
  },
  { collection: "LendingTracker" },
)

// Apply auto-increment plugin
lendingTrackerSchema.plugin(AutoIncrement, { inc_field: "lendingId" })

module.exports = mongoose.model("LendingTracker", lendingTrackerSchema)