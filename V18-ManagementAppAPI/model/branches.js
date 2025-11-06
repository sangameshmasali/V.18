const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  manager: String,
  capacity: Number,
  currentStudents: Number,
  status: String,
  establishedDate: Date,
  admin: {
    name: String,
    email: String,
    phone: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);