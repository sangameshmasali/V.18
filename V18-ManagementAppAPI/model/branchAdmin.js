const mongoose = require('mongoose');

const branchAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  passwordEncrypted: { type: String, required: true },
  phone: String,
  role: { type: String, default: 'branch_admin' },
  branchId: { type: String, required: true },
  branchName: { type: String, required: true },
});

module.exports = mongoose.model('BranchAdmin', branchAdminSchema);