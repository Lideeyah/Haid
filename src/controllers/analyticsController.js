const AidLog = require('../models/AidLog');
const Event = require('../models/Event');
const User = require('../models/User');

// Get all verified distributions for auditor/donor dashboard
exports.getVerifiedDistributions = async (req, res, next) => {
  try {
    const { startDate, endDate, eventId } = req.query;
    const filter = {
      status: 'collected',
      'hederaTx.status': 'SUCCESS'
    };
    if (startDate) filter.timestamp = { $gte: new Date(startDate) };
    if (endDate) filter.timestamp = { ...(filter.timestamp || {}), $lte: new Date(endDate) };
    if (eventId) filter.event = eventId;
    const logs = await AidLog.find(filter)
      .populate('event', 'name type location')
      .populate('volunteer', 'name email')
      .sort({ timestamp: -1 });
    res.json({
      count: logs.length,
      distributions: logs.map(log => ({
        id: log._id,
        event: log.event,
        beneficiaryDid: log.did,
        volunteer: log.volunteer,
        timestamp: log.timestamp,
        blockchain: {
          transactionId: log.hederaTx?.transactionId,
          sequenceNumber: log.hederaTx?.sequenceNumber,
          runningHash: log.hederaTx?.runningHash,
          verificationUrl: log.hederaTx?.transactionId ? `https://hashscan.io/testnet/transaction/${log.hederaTx.transactionId}` : null
        }
      }))
    });
  } catch (err) { next(err); }
};

// Get blockchain statistics for donor transparency
exports.getBlockchainStats = async (req, res, next) => {
  try {
    const totalDistributions = await AidLog.countDocuments({ status: 'collected', 'hederaTx.status': 'SUCCESS' });
    const totalEvents = await Event.countDocuments({ 'hederaTx.status': 'SUCCESS' });
    const duplicatesBlocked = await AidLog.countDocuments({ status: 'duplicate-blocked' });
    const totalNGOs = await User.countDocuments({ role: 'ngo', did: { $exists: true } });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer', did: { $exists: true } });
    res.json({
      blockchain: 'Hedera Testnet',
      topicId: process.env.HEDERA_TOPIC_ID,
      statistics: {
        totalDistributions,
        totalEvents,
        duplicatesBlocked,
        totalNGOs,
        totalVolunteers,
        fraudPreventionRate: totalDistributions > 0 ? ((duplicatesBlocked / (totalDistributions + duplicatesBlocked)) * 100).toFixed(2) + '%' : '0%'
      },
      explorerUrl: `https://hashscan.io/testnet/topic/${process.env.HEDERA_TOPIC_ID}`
    });
  } catch (err) { next(err); }
};

// Get summary for a specific event
exports.getEventSummary = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId)
      .populate('ngo', 'name email')
      .populate('volunteers', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const logs = await AidLog.find({ event: eventId });
    const collected = logs.filter(l => l.status === 'collected');
    const duplicates = logs.filter(l => l.status === 'duplicate-blocked');
    const uniqueBeneficiaries = new Set(collected.map(l => l.did)).size;
    res.json({
      event: {
        id: event._id,
        name: event.name,
        type: event.type,
        location: event.location,
        startTime: event.startTime,
        endTime: event.endTime,
        ngo: event.ngo,
        blockchain: {
          transactionId: event.hederaTx?.transactionId,
          sequenceNumber: event.hederaTx?.sequenceNumber,
          explorerUrl: event.hederaTx?.transactionId ? `https://hashscan.io/testnet/transaction/${event.hederaTx.transactionId}` : null
        }
      },
      statistics: {
        totalDistributions: collected.length,
        uniqueBeneficiaries,
        duplicatesBlocked: duplicates.length,
        volunteersAssigned: event.volunteers.length,
        fraudPreventionRate: collected.length > 0 ? ((duplicates.length / (collected.length + duplicates.length)) * 100).toFixed(2) + '%' : '0%'
      },
      distributions: collected.map(log => ({
        beneficiaryDid: log.did,
        timestamp: log.timestamp,
        transactionId: log.hederaTx?.transactionId,
        verified: !!log.hederaTx?.status
      }))
    });
  } catch (err) { next(err); }
};
