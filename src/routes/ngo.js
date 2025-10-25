const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Analytics for NGO: totals, trends, geo-performance. Admin/NGO only.
router.get('/analytics', authMiddleware, roleMiddleware(['ngo','admin']), ngoController.getAnalytics);
router.get('/export', authMiddleware, roleMiddleware(['ngo','admin']), ngoController.exportReport);

module.exports = router;
