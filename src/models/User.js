const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, required: true },
  did: { type: String, unique: true },
  // Hedera custodial wallet fields
  hederaAccountId: { type: String, unique: true, sparse: true },
  hederaPublicKey: { type: String },
  hederaPrivateKey: { type: String, select: false },
  hederaTx: {
    status: String,
    transactionId: String,
    sequenceNumber: Number,
    runningHash: String,
  },
  didPublicKey: { type: String },
  didPrivateKey: { type: String, select: false }, // select: false hides it from queries by default
  didHederaTx: {
    status: String,
    transactionId: String,
    sequenceNumber: Number,
    runningHash: String,
  },
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