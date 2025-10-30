const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/donations/hbar
router.post('/hbar', authMiddleware, donationController.donateHbar);

module.exports = router;
