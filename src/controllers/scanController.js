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


    // Check if event exists and get assigned volunteers
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { volunteers: true }
    });
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if volunteer is assigned to this event
    const isAssigned = event.volunteers.some(v => v.id === req.user.id);
    if (!isAssigned) {
      return res.status(403).json({ message: "You are not assigned to this event." });
    }

    // Find beneficiary by simulatedDid
    const beneficiary = await prisma.user.findUnique({
      where: { simulatedDid: beneficiaryDid },
    });
    if (!beneficiary)
      return res.status(404).json({ message: "Beneficiary not found" });

    // Check if already collected for this event
    const alreadyCollected = await prisma.aidLog.findFirst({
      where: {
        eventId,
        beneficiaryId: beneficiary.id,
        status: "collected",
      },
    });
    if (alreadyCollected) {
      // Log the duplicate attempt
      await prisma.aidLog.create({
        data: {
          eventId,
          beneficiaryId: beneficiary.id,
          volunteerId: req.user.id,
          transactionId: generateTransactionId(),
          status: "duplicate-blocked",
          timestamp: new Date(),
        },
      });
      return res.json({ status: "duplicate-blocked" });
    }

    // Create new AidLog
    const aidLog = await prisma.aidLog.create({
      data: {
        eventId,
        beneficiaryId: beneficiary.id,
        volunteerId: req.user.id,
        transactionId: generateTransactionId(),
        status: "collected",
        timestamp: new Date(),
      },
    });
    res.json({
      status: "collected",
      transactionId: aidLog.transactionId,
      timestamp: aidLog.timestamp,
    });
  } catch (err) {
    next(err);
  }
};
