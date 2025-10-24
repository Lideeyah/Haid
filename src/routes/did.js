// src/routes/did.js
const express = require('express');
const router = express.Router();

/**
 * POST /api/did/create
 * Create new DID for wristband
 */
router.post('/create', async (req, res, next) => {
  try {
    const { wristbandId, beneficiaryName, metadata } = req.body;

    if (!wristbandId) {
      return res.status(400).json({
        error: 'wristbandId is required'
      });
    }

    // Mock DID creation
    const did = `did:hedera:testnet:${Math.random().toString(36).substr(2, 16)}`;

    res.status(201).json({
      success: true,
      did,
      wristbandId,
      beneficiaryName,
      metadata,
      createdAt: new Date().toISOString(),
      message: 'DID created successfully'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/did/:wristbandId
 * Get DID by wristband ID
 */
router.get('/:wristbandId', async (req, res, next) => {
  try {
    const { wristbandId } = req.params;

    // Mock DID lookup
    res.json({
      wristbandId,
      did: `did:hedera:testnet:mock${wristbandId}`,
      status: 'active',
      createdAt: '2025-10-24T10:00:00Z'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;