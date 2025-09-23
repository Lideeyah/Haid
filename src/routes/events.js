const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

// GET /events/:id/logs - Get all collection logs for a specific event
router.get('/:id/logs', eventsController.getEventLogs);

// GET /events/:id/analytics - Get analytics summary for a specific event
router.get('/:id/analytics', eventsController.getEventAnalytics);
=======
const eventController = require('../controllers/eventController');

// POST /events - Create new event
router.post('/', eventController.createEvent);

// GET /events - Get all events
router.get('/', eventController.getAllEvents);

// GET /events/:id - Get event by ID
router.get('/:id', eventController.getEventById);

module.exports = router;