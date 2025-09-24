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
 * @param {string} eventData.ngoId - The ID of the NGO creating the event
 * @returns {Object} Created event with ID
 */
const createEvent = async (eventData) => {
  // Validate required fields
  if (!eventData.name || !eventData.date || !eventData.location || !eventData.ngoId) {
    throw new Error('Missing required fields: name, date, location, and ngoId are required');
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
    ngoId: eventData.ngoId,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  events.push(newEvent);
  return newEvent;
};

/**
 * Get all events
 * @param {Object} filters - Optional filters for events
 * @returns {Array} List of all events
 */
const getAllEvents = async (filters = {}) => {
  let filteredEvents = events;

  if (filters.date) {
    filteredEvents = filteredEvents.filter(event => event.date.startsWith(filters.date));
  }

  if (filters.location) {
    filteredEvents = filteredEvents.filter(event => event.location.toLowerCase().includes(filters.location.toLowerCase()));
  }

  if (filters.ngoId) {
    filteredEvents = filteredEvents.filter(event => event.ngoId === filters.ngoId);
  }

  return filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
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
 * Update an existing event
 * @param {number} eventId - The ID of the event to update
 * @param {Object} updateData - The data to update
 * @returns {Object|null} The updated event or null if not found
 */
const updateEvent = async (eventId, updateData) => {
  const eventIndex = events.findIndex(event => event.id === parseInt(eventId));
  if (eventIndex === -1) {
    return null;
  }

  const updatedEvent = { ...events[eventIndex], ...updateData, updatedAt: new Date().toISOString() };
  events[eventIndex] = updatedEvent;
  return updatedEvent;
};


/**
 * Delete an event by ID
 * @param {number} eventId - The ID of the event to delete
 * @returns {boolean} True if deleted, false if not found
 */
const deleteEvent = async (eventId) => {
  const eventIndex = events.findIndex(event => event.id === parseInt(eventId));
  if (eventIndex === -1) {
    return false;
  }

  events.splice(eventIndex, 1);
  return true;
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
  updateEvent,
  deleteEvent,
  updateEventStatus
};