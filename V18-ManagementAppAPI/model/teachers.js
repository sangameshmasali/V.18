const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  subjects: [String],
  branches: [String],
  qualifications: [String],
  experience: Number,
  salary: Number,
  joinDate: Date,
  onboardedBy: String,
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  classType: { type: String, enum: ["regular", "vacation"] }
}, { timestamps: true });

module.exports = mongoose.model("Teacher", teacherSchema);
