// src/controllers/scanController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateTransactionId } = require('../utils/generateDid');
const { validationResult } = require('express-validator');

exports.scan = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { eventId, beneficiaryDid } = req.body;
    // Find beneficiary by simulatedDid
    const beneficiary = await prisma.user.findUnique({ where: { simulatedDid: beneficiaryDid } });
    if (!beneficiary) return res.status(404).json({ message: 'Beneficiary not found' });

    // Check if already collected for this event
    const alreadyCollected = await prisma.aidLog.findFirst({
      where: {
        eventId,
        beneficiaryId: beneficiary.id,
        status: 'collected'
      }
    });
    if (alreadyCollected) {
      return res.json({ status: 'duplicate-blocked' });
    }

    // Create new AidLog
    const aidLog = await prisma.aidLog.create({
      data: {
        eventId,
        beneficiaryId: beneficiary.id,
        volunteerId: req.user.id,
        transactionId: generateTransactionId(),
        status: 'collected'
      }
    });
    res.json({ status: 'collected', transactionId: aidLog.transactionId });
  } catch (err) {
    next(err);
  }
};
