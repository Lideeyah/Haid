const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String },
  location: { type: String },
  quantity: { type: Number },
  supplies: [{ type: String }],
  volunteersCount: { type: Number },
  volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  logs: [{
    did: String,
    hederaTx: String,
    status: String,
    timestamp: Date
  }],
  guardianMatch: { type: Boolean },
  startTime: { type: Date },
  endTime: { type: Date },
  hederaTx: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', eventSchema);