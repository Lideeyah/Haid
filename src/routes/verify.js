// src/routes/verify.js
const express = require('express');
const router = express.Router();

/**
 * GET /api/verify/:did
 * Verify event immutability via HCS
 */
router.get('/:did', async (req, res, next) => {
  try {
    const { did } = req.params;

    // Mock verification (replace with actual HCS verification)
    const verification = {
      did,
      immutable: true,
      eventsCount: 3,
      hcsProof: {
        topicId: process.env.HAID_SCANS_TOPIC_ID || '0.0.12345',
        consensusTimestamp: '1729767000.123456789',
        sequenceNumber: 42,
        runningHash: 'sha384:abc123...'
      },
      verified: true,
      message: 'All events verified on Hedera Consensus Service',
      timestamp: req.timestamp
    };

    res.json(verification);

  } catch (error) {
    next(error);
  }
});

module.exports = router;