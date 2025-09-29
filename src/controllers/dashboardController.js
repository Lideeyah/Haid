// src/controllers/dashboardController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');


// General dashboard stats: number of events, volunteers, aid distributed, beneficiaries, aid types
exports.getGeneralStats = async (req, res, next) => {
  try {
    // Number of events
    const eventsCount = await prisma.event.count();
    // Number of volunteers
    const volunteersCount = await prisma.user.count({ where: { role: 'volunteer' } });
    // Number of beneficiaries
    const beneficiariesCount = await prisma.user.count({ where: { role: 'beneficiary' } });
    // Aid distributed (total 'collected' logs)
    const aidDistributed = await prisma.aidLog.count({ where: { status: 'collected' } });
    // Aid types distributed (distinct event types with at least one 'collected' aidLog)
    const aidTypeRows = await prisma.event.findMany({
      where: {
        aidLogs: {
          some: { status: 'collected' }
        }
      },
      select: { type: true }
    });
    const aidTypes = [...new Set(aidTypeRows.map(row => row.type))];

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
