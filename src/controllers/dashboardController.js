// src/controllers/dashboardController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');

exports.getStats = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { eventId } = req.params;
    const totalServed = await prisma.aidLog.count({ where: { eventId, status: 'collected' } });
    const duplicates = await prisma.aidLog.count({ where: { eventId, status: 'duplicate-blocked' } });
    res.json({ totalServed, duplicates });
  } catch (err) {
    next(err);
  }
};
