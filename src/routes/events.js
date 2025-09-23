const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

// GET /events/:id/logs - Get all collection logs for a specific event
router.get('/:id/logs', eventsController.getEventLogs);

// GET /events/:id/analytics - Get analytics summary for a specific event
router.get('/:id/analytics', eventsController.getEventAnalytics);

module.exports = router;