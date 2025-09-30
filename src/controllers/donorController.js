// src/controllers/donorController.js

const Event = require('../models/Event');
const AidLog = require('../models/AidLog');

// Donor dashboard: high-level KPIs, progress, geographic impact (no personal data)
exports.getDashboard = async (req, res, next) => {
  try {
    // Total recipients served (unique beneficiaries with collected aid)
    const collectedLogs = await AidLog.find({ status: "collected" });
    const uniqueBeneficiaries = [...new Set(collectedLogs.map(log => log.did))];
    const recipientsServed = uniqueBeneficiaries.length;
    // Distribution progress: total events, events completed (endTime < now)
    const totalEvents = await Event.countDocuments();
    const completedEvents = await Event.countDocuments({ endTime: { $lt: new Date() } });
    // Geographic impact: count of events per location
    const events = await Event.find({});
    const locationCounts = {};
    events.forEach(event => {
      if (event.location) {
        locationCounts[event.location] = (locationCounts[event.location] || 0) + 1;
      }
    });
    const geographicImpact = Object.entries(locationCounts).map(([location, events]) => ({ location, events }));
    res.json({
      recipientsServed,
      distributionProgress: {
        totalEvents,
        completedEvents,
        percentCompleted: totalEvents ? Math.round((completedEvents / totalEvents) * 100) : 0
      },
      geographicImpact
    });
  } catch (err) {
    next(err);
  }
};
