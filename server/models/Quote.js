const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
  bookId: {
    type: Number,
    required: true
  },
  quote: {
    type: String,
    required: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

// Create a unique ID for quotes
quoteSchema.pre('save', async function(next) {
  if (!this.quoteId) {
    // Find the highest quoteId and increment by 1
    const highestQuote = await this.constructor.findOne({}, {}, { sort: { quoteId: -1 } });
    this.quoteId = highestQuote && highestQuote.quoteId ? highestQuote.quoteId + 1 : 1;
  }
  next();
});

quoteSchema.add({
  quoteId: {
    type: Number,
    unique: true
  }
});

module.exports = mongoose.model("Quote", quoteSchema);