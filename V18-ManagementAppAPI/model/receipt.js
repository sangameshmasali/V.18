const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  receiptNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Receipt', receiptSchema);
