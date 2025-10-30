// src/controllers/donorController.js

const Event = require('../models/Event');
const AidLog = require('../models/AidLog');

// Donor dashboard: high-level KPIs, progress, geographic impact (no personal data)
exports.getDashboard = async (req, res, next) => {
  try {
    const donorId = req.user.id || req.user._id;
    // 1. Total contribution (sum of all HBAR donated by the donor)
    const donationLogs = await AidLog.find({ donor: donorId, type: 'hbar' }).sort({ timestamp: -1 });
    const totalContribution = donationLogs.reduce((sum, log) => sum + (log.amount || 0), 0);

    // 2. People helped (unique recipients)
    const uniqueRecipients = [...new Set(donationLogs.map(log => String(log.recipient)))];
    const peopleHelped = uniqueRecipients.length;

    // 3. Locations reached (from recipient's NGO or event location if available)
    // For now, we use event locations if present
    const eventIds = donationLogs.map(log => log.event).filter(Boolean);
    const events = eventIds.length ? await Event.find({ _id: { $in: eventIds } }) : [];
    const locations = [...new Set(events.map(e => e.location).filter(Boolean))];
    const locationsReached = locations;

    // 4. Impact score (simple: peopleHelped * totalContribution)
    const impactScore = peopleHelped * totalContribution;

    // 5. Monthly impact (donations per month)
    const monthlyImpact = {};
    donationLogs.forEach(log => {
      if (!log.timestamp) return;
      const month = log.timestamp.getFullYear() + '-' + String(log.timestamp.getMonth() + 1).padStart(2, '0');
      monthlyImpact[month] = (monthlyImpact[month] || 0) + (log.amount || 0);
    });

    // 6. Donation flow (timeline of donations)
    const donationFlow = donationLogs.map(log => ({
      amount: log.amount,
      recipient: log.recipient,
      timestamp: log.timestamp,
      txId: log.txId
    }));

    // 7. Recent distributions (latest 5 donations)
    const recentDistributions = donationFlow.slice(0, 5);

    // 8. Distribution progress: total events, events completed (endTime < now)
    const totalEvents = await Event.countDocuments();
    const completedEvents = await Event.countDocuments({ endTime: { $lt: new Date() } });

    // 9. Geographic impact: count of events per location
    const allEvents = await Event.find({});
    const locationCounts = {};
    allEvents.forEach(event => {
      if (event.location) {
        locationCounts[event.location] = (locationCounts[event.location] || 0) + 1;
      }
    });
    const geographicImpact = Object.entries(locationCounts).map(([location, events]) => ({ location, events }));

    res.json({
      totalContribution,
      peopleHelped,
      locationsReached,
      impactScore,
      monthlyImpact,
      donationFlow,
      recentDistributions,
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
