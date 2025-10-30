const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Auditor/Donor dashboard endpoints
router.get('/distributions', authMiddleware, roleMiddleware(['admin', 'auditor', 'ngo']), analyticsController.getVerifiedDistributions);
router.get('/blockchain-stats', analyticsController.getBlockchainStats);
router.get('/event-summary/:eventId', authMiddleware, analyticsController.getEventSummary);

module.exports = router;
