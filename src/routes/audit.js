// src/routes/audit.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data.json');

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { messages: [], overrides: [] };
  }
}

/**
 * GET /api/audit/:did
 * or GET /api/audit/merge/:did (for backward compatibility)
 * Get complete audit trail for a DID
 */
router.get(['/:did', '/merge/:did'], async (req, res, next) => {
  try {
    const { did } = req.params;
    const data = readData();

    const history = data.messages.filter(m => m.did === did || m.beneficiaryDID === did);
    const overrides = data.overrides?.filter(o => o.oldDid === did || o.newDid === did) || [];

    res.json({
      did,
      history,
      overrides,
      totalEvents: history.length,
      timestamp: req.timestamp
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;