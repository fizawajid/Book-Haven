const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  isDowntimeEnabled: {
    type: Boolean,
    default: false
  },
  downtimeMessage: {
    type: String,
    default: "The system is currently under maintenance. Please try again later."
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure only one settings document exists
systemSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema); 