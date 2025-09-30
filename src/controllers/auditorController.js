// src/controllers/auditorController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    const where = {};
    if (eventId) {
      // Check if event exists
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) {
        return res.status(404).json({ message: "Event not found." });
      }
      where.eventId = eventId;
    }
    if (date) {
      // Validate date format
      const start = new Date(date);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
      }
      const end = new Date(start);
      end.setUTCHours(23, 59, 59, 999);
      where.timestamp = { gte: start, lte: end };
    }
    // Get logs
    const logs = await prisma.aidLog.findMany({
      where,
      select: {
        id: true,
        eventId: true,
        beneficiaryId: true,
        volunteerId: true,
        timestamp: true,
        status: true,
        hederaTx: true
      }
    });

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

    // Compare each log individually
    const logsWithMatch = logs.map(log => {
      if (!log.hederaTx) {
        // Not submitted to Hedera (e.g., duplicate-blocked)
        return { ...log, hederaMatch: null };
      }
      // Look for a matching message on Hedera
      const found = topicMessages.some(msg => {
        try {
          const payload = JSON.parse(Buffer.from(msg.message, 'base64').toString('utf8'));
          // Debug: print payload for inspection
          console.log('Decoded Hedera payload:', payload);
          // Compare only scanId/eventId for matching
          return (payload.scanId && payload.scanId === log.id) || (payload.eventId && payload.eventId === log.eventId);
        } catch (e) {
          console.log('Error decoding Hedera payload:', e);
          return false;
        }
      });
      return { ...log, hederaMatch: found };
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
