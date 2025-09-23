const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// POST /events - Create new event
router.post('/', eventController.createEvent);

// GET /events - Get all events
router.get('/', eventController.getAllEvents);

// GET /events/:id - Get event by ID
router.get('/:id', eventController.getEventById);

module.exports = router;