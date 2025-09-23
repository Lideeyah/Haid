const eventService = require('../services/eventService');

/**
 * Event controller for managing aid distribution events
 */

/**
 * Create a new event
 * POST /events
 */
const createEvent = async (req, res) => {
  try {
    const { name, date, location } = req.body;
    
    const eventData = await eventService.createEvent({
      name,
      date,
      location
    });
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: eventData
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({
      success: false,
      error: {
        message: 'Failed to create event',
        details: error.message,
        status: 400
      }
    });
  }
};

/**
 * Get all events
 * GET /events
 */
const getAllEvents = async (req, res) => {
  try {
    const events = await eventService.getAllEvents();
    
    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Error retrieving events:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve events',
        details: error.message,
        status: 500
      }
    });
  }
};

/**
 * Get event by ID
 * GET /events/:id
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Event not found',
          status: 404
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Event retrieved successfully',
      data: event
    });
  } catch (error) {
    console.error('Error retrieving event:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve event',
        details: error.message,
        status: 500
      }
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById
};