// src/controllers/auditorController.js

const Event = require('../models/Event');
const AidLog = require('../models/AidLog');

// Auditor dashboard: filter logs by event/date, verify with Hedera mirror node
const axios = require('axios');

async function getTopicMessages(topicId, limit = 100) {
  const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?limit=${limit}`;
  const response = await axios.get(url);
  if (response.status !== 200) throw new Error(`Mirror node error: ${response.status}`);
  return response.data.messages;
}

exports.getDashboard = async (req, res, next) => {
  try {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { eventId, date } = req.query;
    // Build filter
    const filter = {};
    if (eventId) {
      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }
      filter.event = eventId;
    }
    if (date) {
      // Validate date format
      const start = new Date(date);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
      }
      const end = new Date(start);
      end.setUTCHours(23, 59, 59, 999);
      filter.timestamp = { $gte: start, $lte: end };
    }
    // Get logs
    const logs = await AidLog.find(filter);

    // Fetch Hedera messages from mirror node
    let topicMessages = [];
    try {
      const topicId = process.env.HEDERA_TOPIC_ID;
      if (!topicId) throw new Error('HEDERA_TOPIC_ID not set');
      topicMessages = await getTopicMessages(topicId, 100);
    } catch (mirrorErr) {
      // If mirror node fails, do not block, but set topicMessages to empty
      console.error('Mirror node verification error:', mirrorErr);
      topicMessages = [];
    }

    // Compare each log individually and sanitize output
    const logsWithMatch = logs.map(log => {
      const obj = log.toObject();
      let hederaMatch = null;
      if (obj.hederaTx) {
        hederaMatch = topicMessages.some(msg => {
          try {
            const payload = JSON.parse(Buffer.from(msg.message, 'base64').toString('utf8'));
            // Compare only scanId/eventId for matching
            return (payload.scanId && payload.scanId === String(obj._id)) || (payload.eventId && payload.eventId === String(obj.event));
          } catch (e) {
            return false;
          }
        });
      }
      return {
        _id: obj._id,
        did: obj.did,
        hederaTx: obj.hederaTx,
        status: obj.status,
        timestamp: obj.timestamp,
        event: obj.event,
        hederaMatch
      };
    });

    // Optionally, add a global allHederaMatch flag
    const allHederaMatch = logsWithMatch.every(l => l.hederaMatch === true || l.hederaMatch === null);

    res.json({
      logs: logsWithMatch,
      allHederaMatch
    });
  } catch (err) {
    next(err);
  }
};
