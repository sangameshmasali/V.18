const mongoose = require('mongoose');

const superAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // plain text (as per your requirement)
  role: { type: String, default: 'super_admin' },
}, { timestamps: true });

module.exports = mongoose.model('SuperAdmin', superAdminSchema);
