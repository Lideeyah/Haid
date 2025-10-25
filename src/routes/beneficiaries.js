const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controllers/beneficiaryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { param, query } = require('express-validator');

// Aid history (optionally filter by month)
router.get(
  '/:id/aid-history',
  authMiddleware,
  roleMiddleware(['beneficiary', 'admin', 'ngo']),
  param('id').isMongoId().withMessage('Valid beneficiary ID required'),
  query('month').optional().isString(),
  beneficiaryController.getAidHistory
);

// QR code
router.get(
  '/:id/qr',
  authMiddleware,
  roleMiddleware(['beneficiary', 'admin', 'ngo']),
  param('id').isMongoId().withMessage('Valid beneficiary ID required'),
  beneficiaryController.getQRCode
);

// Summary (last distribution, upcoming, status, stats)
router.get(
  '/:id/summary',
  authMiddleware,
  roleMiddleware(['beneficiary', 'admin', 'ngo']),
  param('id').isMongoId().withMessage('Valid beneficiary ID required'),
  beneficiaryController.getSummary
);

// Upcoming distributions
router.get(
  '/:id/upcoming-distributions',
  authMiddleware,
  roleMiddleware(['beneficiary', 'admin', 'ngo']),
  param('id').isMongoId().withMessage('Valid beneficiary ID required'),
  beneficiaryController.getUpcomingDistributions
);

module.exports = router;
