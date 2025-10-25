const AidLog = require('../models/AidLog');
const Event = require('../models/Event');
const { Parser } = require('json2csv');

// Helper to parse date filters
function parseDateRange(query) {
  const { start, end, preset } = query;
  let startDate = start ? new Date(start) : null;
  let endDate = end ? new Date(end) : null;
  const now = new Date();
  if (preset === 'last30') {
    startDate = new Date(now); startDate.setDate(now.getDate() - 30);
    endDate = now;
  } else if (preset === 'last7') {
    startDate = new Date(now); startDate.setDate(now.getDate() - 7);
    endDate = now;
  } else if (preset === 'today') {
    startDate = new Date(now); startDate.setHours(0,0,0,0);
    endDate = now;
  }
  return { startDate, endDate };
}

// GET /api/ngo/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = parseDateRange(req.query);
    const logFilter = {};
    const eventFilter = {};
    if (startDate || endDate) {
      logFilter.timestamp = {};
      if (startDate) logFilter.timestamp.$gte = startDate;
      if (endDate) logFilter.timestamp.$lte = endDate;
      eventFilter.createdAt = {};
      if (startDate) eventFilter.createdAt.$gte = startDate;
      if (endDate) eventFilter.createdAt.$lte = endDate;
    }

    // Total beneficiaries: unique DID in collected logs
    const collected = await AidLog.find({ ...logFilter, status: 'collected' });
    const uniqueDids = [...new Set(collected.map(l => l.did))];
    const totalBeneficiaries = uniqueDids.length;

    // Aid distributed: sum of event quantities for events in range
    const events = await Event.find(eventFilter);
    const aidDistributed = events.reduce((s, e) => s + (e.quantity || 0), 0);

    // Locations breakdown
    const locationMap = {};
    events.forEach(e => {
      const loc = e.location || 'Unknown';
      locationMap[loc] = locationMap[loc] ? locationMap[loc] + 1 : 1;
    });
    const locations = Object.entries(locationMap).map(([location, count]) => ({ location, events: count }));

    // Distribution efficiency: beneficiaries / aidDistributed (per unit)
    const distributionEfficiency = aidDistributed ? Math.round((totalBeneficiaries / aidDistributed) * 1000) / 1000 : null;

    // Trends by category (type)
    const typeMap = {};
    events.forEach(e => {
      const t = e.type || 'other';
      typeMap[t] = (typeMap[t] || 0) + (e.quantity || 0);
    });
    const distributionTrends = Object.entries(typeMap).map(([type, qty]) => ({ type, quantity: qty }));

    // Geographical performance: beneficiaries per location (approx using logs)
    const logsByLocation = {};
    for (const l of collected) {
      const ev = l.event ? await Event.findById(l.event) : null;
      const loc = ev && ev.location ? ev.location : 'Unknown';
      logsByLocation[loc] = (logsByLocation[loc] || 0) + 1;
    }
    const geoPerformance = Object.entries(logsByLocation).map(([location, count]) => ({ location, beneficiaries: count }));

    res.json({
      totalBeneficiaries,
      aidDistributed,
      locations,
      distributionEfficiency,
      distributionTrends,
      geoPerformance
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/ngo/export?format=csv
exports.exportReport = async (req, res, next) => {
  try {
    const analyticsRes = await exports.getAnalytics.bind({})(req, { json: x => x }, next);
    // The above call isn't ideal: instead recompute inline quickly
    const { startDate, endDate } = parseDateRange(req.query);
    const logFilter = {};
    const eventFilter = {};
    if (startDate || endDate) {
      logFilter.timestamp = {};
      if (startDate) logFilter.timestamp.$gte = startDate;
      if (endDate) logFilter.timestamp.$lte = endDate;
      eventFilter.createdAt = {};
      if (startDate) eventFilter.createdAt.$gte = startDate;
      if (endDate) eventFilter.createdAt.$lte = endDate;
    }
    const collected = await AidLog.find({ ...logFilter, status: 'collected' });
    const events = await Event.find(eventFilter);

    const rows = events.map(e => ({
      eventId: e._id,
      name: e.name,
      type: e.type,
      location: e.location,
      quantity: e.quantity || 0,
      startTime: e.startTime,
      endTime: e.endTime,
      createdAt: e.createdAt
    }));
    const parser = new Parser();
    const csv = parser.parse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment(`ngo-report-${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};
