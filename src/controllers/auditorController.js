// src/controllers/auditorController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Auditor dashboard: filter logs by event/date, compare with Hedera Guardian indexer
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
        transactionId: true
      }
    });
    // Placeholder for Hedera Guardian indexer comparison
    // In production, fetch and compare with external indexer data
    const hederaMatch = true; // Assume match for now
    res.json({
      logs,
      hederaMatch
    });
  } catch (err) {
    next(err);
  }
};
