const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, required: true },
  did: { type: String, unique: true },
  qrCodeUrl: { type: String },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ratings: [{
    score: { type: Number, min: 1, max: 5 },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);