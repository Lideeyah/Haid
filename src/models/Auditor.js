const mongoose = require('mongoose');

const auditorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Auditor', auditorSchema);