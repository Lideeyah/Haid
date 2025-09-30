// src/controllers/scanController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');

const { submitMessage } = require("../utils/hedera");
const { v4: uuidv4 } = require('uuid');

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

    // Find beneficiary by anchored DID
    const beneficiary = await prisma.user.findUnique({
      where: { did: beneficiaryDid },
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
          status: "duplicate-blocked",
          timestamp: new Date(),
        },
      });
      return res.json({ status: "duplicate-blocked" });
    }

    // Generate UUID for aidLog before Hedera submission
    const aidLogId = uuidv4();

    // Submit distribution to Hedera Consensus Service with scanId
    let hederaTx = null;
    if (!process.env.HEDERA_TOPIC_ID) {
      return res.status(500).json({ message: "Hedera topic not configured." });
    }
    try {
      const rawTx = await submitMessage(process.env.HEDERA_TOPIC_ID, {
        type: "distribution",
        scanId: aidLogId,
        eventId,
        beneficiaryDid: beneficiary.did,
        status: "collected",
        timestamp: Date.now(),
      });
      hederaTx = {
        status: rawTx.status,
        transactionId: rawTx.transactionId,
        sequenceNumber: Number(rawTx.sequenceNumber),
        runningHash: rawTx.runningHash,
      };
    } catch (hcsErr) {
      return res.status(500).json({ message: "Failed to anchor distribution on blockchain." });
    }

    // Only create AidLog in DB if Hedera succeeded, using the same UUID
    let aidLog = await prisma.aidLog.create({
      data: {
        id: aidLogId,
        eventId,
        beneficiaryId: beneficiary.id,
        volunteerId: req.user.id,
        status: "collected",
        timestamp: new Date(),
        hederaTx
      },
    });

    res.json({
      status: aidLog.status,
      timestamp: aidLog.timestamp,
      hederaTx: aidLog.hederaTx,
    });
  } catch (err) {
    next(err);
  }
};
