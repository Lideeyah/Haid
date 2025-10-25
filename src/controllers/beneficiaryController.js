const User = require('../models/User');
const AidLog = require('../models/AidLog');
const Event = require('../models/Event');

// GET /api/beneficiaries/:id/aid-history?month=YYYY-MM
exports.getAidHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { month } = req.query;
    const user = await User.findById(id);
    if (!user || user.role !== 'beneficiary') return res.status(404).json({ message: 'Beneficiary not found' });
    let filter = { did: user.did, status: 'collected' };
    if (month) {
      const [year, m] = month.split('-');
      const start = new Date(Number(year), Number(m) - 1, 1);
      const end = new Date(Number(year), Number(m), 1);
      filter.timestamp = { $gte: start, $lt: end };
    }
    const logs = await AidLog.find(filter).populate('event');
    res.json(logs.map(l => ({
      id: l._id,
      event: l.event ? { id: l.event._id, name: l.event.name, location: l.event.location } : null,
      status: l.status,
      timestamp: l.timestamp,
      hederaTx: l.hederaTx || null
    })));
  } catch (err) { next(err); }
};

// GET /api/beneficiaries/:id/qr
exports.getQRCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || user.role !== 'beneficiary') return res.status(404).json({ message: 'Beneficiary not found' });
    res.json({ did: user.did, qrCodeUrl: user.qrCodeUrl });
  } catch (err) { next(err); }
};

// GET /api/beneficiaries/:id/summary
exports.getSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || user.role !== 'beneficiary') return res.status(404).json({ message: 'Beneficiary not found' });
    // Last distribution
    const lastLog = await AidLog.findOne({ did: user.did, status: 'collected' }).sort({ timestamp: -1 }).populate('event');
    // Upcoming events (events with startTime > now)
    const now = new Date();
    const upcomingEvents = await Event.find({ startTime: { $gt: now } }).sort({ startTime: 1 }).limit(5);
    // Registration status
    const registrationStatus = !!user.did;
    // Upcoming schedule (next event)
    const nextEvent = upcomingEvents[0] || null;
    // Aid history stats
    const totalAids = await AidLog.countDocuments({ did: user.did, status: 'collected' });
    res.json({
      lastDistribution: lastLog ? {
        event: lastLog.event ? { id: lastLog.event._id, name: lastLog.event.name } : null,
        timestamp: lastLog.timestamp
      } : null,
      upcomingEvents: upcomingEvents.map(e => ({ id: e._id, name: e.name, startTime: e.startTime, location: e.location })),
      registrationStatus,
      upcomingSchedule: nextEvent ? { id: nextEvent._id, name: nextEvent.name, startTime: nextEvent.startTime } : null,
      totalAids
    });
  } catch (err) { next(err); }
};

// GET /api/beneficiaries/:id/upcoming-distributions
exports.getUpcomingDistributions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || user.role !== 'beneficiary') return res.status(404).json({ message: 'Beneficiary not found' });
    const now = new Date();
    const events = await Event.find({ startTime: { $gt: now } }).sort({ startTime: 1 });
    res.json(events.map(e => ({
      id: e._id,
      name: e.name,
      location: e.location,
      startTime: e.startTime,
      endTime: e.endTime
    })));
  } catch (err) { next(err); }
};
