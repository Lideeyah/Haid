/**
 * Event service for managing aid distribution events
 */

// In-memory storage for events (in production, this would be a database)
let events = [];
let eventIdCounter = 1;

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @param {string} eventData.name - Event name
 * @param {string} eventData.date - Event date in ISO 8601 format
 * @param {string} eventData.location - Event location
 * @returns {Object} Created event with ID
 */
const createEvent = async (eventData) => {
  // Validate required fields
  if (!eventData.name || !eventData.date || !eventData.location) {
    throw new Error('Missing required fields: name, date, and location are required');
  }
  
  // Validate date format
  const eventDate = new Date(eventData.date);
  if (isNaN(eventDate.getTime())) {
    throw new Error('Invalid date format. Please use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)');
  }
  
  const newEvent = {
    id: eventIdCounter++,
    name: eventData.name.trim(),
    date: eventDate.toISOString(),
    location: eventData.location.trim(),
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  events.push(newEvent);
  return newEvent;
};

/**
 * Get all events
 * @returns {Array} List of all events
 */
const getAllEvents = async () => {
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Get event by ID
 * @param {number} eventId - Event ID
 * @returns {Object|null} Event or null if not found
 */
const getEventById = async (eventId) => {
  return events.find(event => event.id === parseInt(eventId)) || null;
};

/**
 * Update event status
 * @param {number} eventId - Event ID
 * @param {string} status - New status
 * @returns {Object|null} Updated event or null if not found
 */
const updateEventStatus = async (eventId, status) => {
  const event = await getEventById(eventId);
  if (event) {
    event.status = status;
    event.updatedAt = new Date().toISOString();
  }
  return event;
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEventStatus
};