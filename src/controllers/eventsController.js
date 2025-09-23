const eventsService = require('../services/eventsService');

/**
 * Get all collection logs for a specific event
 * GET /events/:id/logs
 */
const getEventLogs = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate event ID
    if (!id) {
      return res.status(400).json({
        error: {
          message: 'Event ID is required',
          status: 400
        }
      });
    }

    // Check if event exists
    const exists = await eventsService.eventExists(id);
    if (!exists) {
      return res.status(404).json({
        error: {
          message: 'Event not found',
          status: 404
        }
      });
    }

    // Get logs for the event
    const logs = await eventsService.getEventLogs(id);
    
    res.status(200).json({
      eventId: id,
      logs: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Error fetching event logs:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Internal Server Error',
        status: 500
      }
    });
  }
};

/**
 * Get analytics summary for a specific event
 * GET /events/:id/analytics
 */
const getEventAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate event ID
    if (!id) {
      return res.status(400).json({
        error: {
          message: 'Event ID is required',
          status: 400
        }
      });
    }

    // Check if event exists
    const exists = await eventsService.eventExists(id);
    if (!exists) {
      return res.status(404).json({
        error: {
          message: 'Event not found',
          status: 404
        }
      });
    }

    // Get analytics for the event
    const analytics = await eventsService.getEventAnalytics(id);
    
    res.status(200).json({
      eventId: id,
      ...analytics
    });
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Internal Server Error',
        status: 500
      }
    });
  }
};

module.exports = {
  getEventLogs,
  getEventAnalytics
};