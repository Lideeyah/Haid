// src/controllers/dashboardController.js

const Event = require('../models/Event');
const User = require('../models/User');
const AidLog = require('../models/AidLog');
const { validationResult } = require('express-validator');


// General dashboard stats: number of events, volunteers, aid distributed, beneficiaries, aid types
exports.getGeneralStats = async (req, res, next) => {
  try {
    // Number of events
    const eventsCount = await Event.countDocuments();
    // Number of volunteers
    const volunteersCount = await User.countDocuments({ role: 'volunteer' });
    // Number of beneficiaries
    const beneficiariesCount = await User.countDocuments({ role: 'beneficiary' });
    // Aid distributed (total 'collected' logs)
    const aidDistributed = await AidLog.countDocuments({ status: 'collected' });
    // Aid types distributed (distinct event types with at least one 'collected' aidLog)
    const collectedAidLogs = await AidLog.find({ status: 'collected' }).populate('event');
    const aidTypes = [...new Set(collectedAidLogs.map(log => log.event?.type).filter(Boolean))];

    res.json({
      eventsCount,
      volunteersCount,
      beneficiariesCount,
      aidDistributed,
      aidTypes
    });
  } catch (err) {
    next(err);
  }
};
