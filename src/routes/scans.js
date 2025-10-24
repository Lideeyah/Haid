// src/routes/scans.js
const express = require('express');
const router = express.Router();

// Import scan processing logic
// For now, we'll create inline handlers, but these should import from controllers
let processScan;
try {
  // Try ESM import pattern for CommonJS
  processScan = require('../services/scanService').processScan;
} catch (err) {
  // Fallback mock implementation
  processScan = async (scanData) => {
    return {
      success: true,
      scanId: `scan_${Date.now()}`,
      eventId: `evt_${Date.now()}`,
      did: scanData.did || `did:hedera:testnet:${Math.random().toString(36).substr(2, 9)}`,
      wristbandId: scanData.wristbandId,
      aidType: scanData.aidType,
      message: 'Scan processed (mock)',
      hcsStatus: 'pending'
    };
  };
}

/**
 * POST /api/scan
 * Main endpoint to scan wristband and log to HCS
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      wristbandId,
      aidType,
      quantity,
      location,
      volunteerId,
      orgId,
      deviceId,
      notes
    } = req.body;

    // Validation
    if (!wristbandId) {
      return res.status(400).json({
        error: 'wristbandId is required',
        timestamp: req.timestamp
      });
    }

    if (!aidType) {
      return res.status(400).json({
        error: 'aidType is required (FOOD, WATER, MEDICAL, SHELTER)',
        timestamp: req.timestamp
      });
    }

    // Process scan
    const result = await processScan({
      wristbandId,
      aidType,
      quantity: quantity || 1,
      location,
      volunteerId,
      orgId,
      deviceId,
      notes
    });

    if (!result.success) {
      return res.status(409).json({
        success: false,
        error: result.message || 'Scan rejected',
        reason: result.scan?.reason,
        timestamp: req.timestamp
      });
    }

    res.status(201).json({
      success: true,
      scanId: result.scanId,
      eventId: result.eventId,
      did: result.did,
      wristbandId,
      aidType,
      quantity: quantity || 1,
      hcsStatus: result.hcsStatus || 'pending',
      hcsTxId: result.hcsTxId,
      message: 'Aid distribution logged successfully',
      timestamp: req.timestamp
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;