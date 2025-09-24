const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { 
  validateEventCreation, 
  validateEventUpdate, 
  validateEventId 
} = require('../middleware/validation');

// GET /events/export - Export events to CSV
router.get('/export', protect, authorize('admin', 'NGO'), eventController.exportEvents);

// GET /events/:id/logs - Get all collection logs for a specific event
router.get('/:id/logs', validateEventId, eventsController.getEventLogs);

// GET /events/:id/analytics - Get analytics summary for a specific event
router.get('/:id/analytics', validateEventId, eventsController.getEventAnalytics);

// POST /events - Create new event
router.post('/', protect, authorize('admin', 'NGO'), validateEventCreation, eventController.createEvent);

// GET /events - Get all events
router.get('/', eventController.getAllEvents);

// GET /events/:id - Get event by ID
router.get('/:id', validateEventId, eventController.getEventById);

// PUT /events/:id - Update an event
router.put('/:id', protect, authorize('admin', 'NGO'), validateEventUpdate, eventController.updateEvent);

// DELETE /events/:id - Delete an event
router.delete('/:id', protect, authorize('admin', 'NGO'), validateEventId, eventController.deleteEvent);

module.exports = router;
