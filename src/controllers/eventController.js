const eventService = require('../services/eventService');
const { Parser } = require('json2csv');

/**
 * Event controller for managing aid distribution events
 */

/**
 * Create a new event
 * POST /events
 */
const createEvent = async (req, res) => {
  try {
    const { name, date, location, ngoId } = req.body;
    
    const eventData = await eventService.createEvent({
      name,
      date,
      location,
      ngoId
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
    const events = await eventService.getAllEvents(req.query);
    
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

/**
 * Update an event by ID
 * PUT /events/:id
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEvent = await eventService.updateEvent(id, req.body);

    if (!updatedEvent) {
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
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update event',
        details: error.message,
        status: 500
      }
    });
  }
};

/**
 * Delete an event by ID
 * DELETE /events/:id
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await eventService.deleteEvent(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Event not found',
          status: 404
        }
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete event',
        details: error.message,
        status: 500
      }
    });
  }
};

/**
 * Export events to CSV
 * GET /events/export
 */
const exportEvents = async (req, res) => {
  try {
    const events = await eventService.getAllEvents(req.query);
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(events);

    res.header('Content-Type', 'text/csv');
    res.attachment('events.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting events:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to export events',
        details: error.message,
        status: 500
      }
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  exportEvents
};