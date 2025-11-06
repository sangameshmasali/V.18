const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  action: String,   // e.g. "Student Added", "Fee Payment"
  adminName: String,
  details: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
