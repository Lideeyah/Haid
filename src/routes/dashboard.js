// src/routes/dashboard.js
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
 * GET /api/dashboard/donor
 * Donor impact statistics
 */
router.get('/donor', (req, res, next) => {
  try {
    const data = readData();
    
    const stats = {
      totalDistributions: data.messages.filter(m => m.type === 'SCAN' || m.type === 'AID_DISTRIBUTION').length,
      uniqueBeneficiaries: new Set(data.messages.map(m => m.did || m.beneficiaryDID)).size,
      aidTypes: data.messages.reduce((acc, m) => {
        if (m.aidType) {
          acc[m.aidType] = (acc[m.aidType] || 0) + 1;
        }
        return acc;
      }, {}),
      recentEvents: data.messages.slice(-10).reverse(),
      timestamp: new Date().toISOString()
    };
    
    res.json({
      dashboard: 'Donor Dashboard',
      stats,
      message: 'Track your humanitarian aid impact in real-time'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/auditor
 * Auditor transparency dashboard
 */
router.get('/auditor', (req, res, next) => {
  try {
    const data = readData();
    
    const audit = {
      totalEvents: data.messages.length,
      eventsByType: data.messages.reduce((acc, m) => {
        const type = m.type || 'UNKNOWN';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      suspiciousActivity: data.overrides?.length || 0,
      verificationStatus: {
        verified: data.messages.filter(m => m.verified === true).length,
        pending: data.messages.filter(m => !m.verified).length
      },
      fullHistory: data.messages,
      hcsTopics: {
        events: process.env.HAID_EVENTS_TOPIC_ID,
        scans: process.env.HAID_SCANS_TOPIC_ID
      },
      timestamp: new Date().toISOString()
    };
    
    res.json({
      dashboard: 'Auditor Dashboard',
      audit,
      message: 'Complete transparency via Hedera Consensus Service'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/dashboard/stats
 * General statistics
 */
router.get('/stats', (req, res, next) => {
  try {
    const data = readData();
    
    res.json({
      totalEvents: data.messages.length,
      totalBeneficiaries: new Set(data.messages.map(m => m.did || m.beneficiaryDID)).size,
      systemStatus: 'operational',
      hcsConnected: !!process.env.HAID_SCANS_TOPIC_ID,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;