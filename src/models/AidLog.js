const mongoose = require('mongoose');



const aidLogSchema = new mongoose.Schema({
  // For legacy and event logs
  did: { type: String },
  hederaTx: { type: mongoose.Schema.Types.Mixed },
  status: { type: String },
  timestamp: { type: Date, default: Date.now },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // For HBAR donations
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number }, // HBAR amount
  txId: { type: String },
  note: { type: String },
  type: { type: String, enum: ['hbar', 'other'] },
});

module.exports = mongoose.model('AidLog', aidLogSchema);