const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  grade: String,
  subjects: [String],
  branch: String,
  branchId: String, 
  monthlyFee: Number,
  feesPaid: { type: Number, default: 0 },
  feesRemaining: { type: Number, default: 0 },
  initialPayment: { type: Number, default: 0 },
  additionalPayment: { type: Number, default: 0 },
  registrationDate: Date,
  onboardedBy: String,
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  classType: { type: String, enum: ["regular", "vacation"] }
}, { timestamps: true });

const receiptSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  receiptNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true }
});

module.exports = mongoose.model("Student", studentSchema);
