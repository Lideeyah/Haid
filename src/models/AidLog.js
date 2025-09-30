const mongoose = require('mongoose');

const aidLogSchema = new mongoose.Schema({
  did: { type: String },
  hederaTx: { type: mongoose.Schema.Types.Mixed },
  status: { type: String },
  timestamp: { type: Date },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
});

module.exports = mongoose.model('AidLog', aidLogSchema);