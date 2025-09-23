/**
 * Events service to handle collection logs and analytics data
 * For MVP: Using mock data stored in memory before database integration
 */

// Mock data structure for demonstration - in production this would come from database
const mockEventLogs = {
  '1': [
    {
      id: 'log_001',
      eventId: '1',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'success',
      recipientId: 'recipient_001',
      itemsCollected: ['item1', 'item2'],
      locationHash: 'hash_001'
    },
    {
      id: 'log_002',
      eventId: '1',
      timestamp: '2024-01-15T11:00:00Z',
      status: 'success',
      recipientId: 'recipient_002',
      itemsCollected: ['item1'],
      locationHash: 'hash_002'
    },
    {
      id: 'log_003',
      eventId: '1',
      timestamp: '2024-01-15T11:30:00Z',
      status: 'duplicate_prevented',
      recipientId: 'recipient_001',
      attemptedItems: ['item1'],
      locationHash: 'hash_003'
    }
  ],
  '2': [
    {
      id: 'log_004',
      eventId: '2',
      timestamp: '2024-01-16T09:00:00Z',
      status: 'success',
      recipientId: 'recipient_003',
      itemsCollected: ['item3', 'item4'],
      locationHash: 'hash_004'
    },
    {
      id: 'log_005',
      eventId: '2',
      timestamp: '2024-01-16T09:30:00Z',
      status: 'duplicate_prevented',
      recipientId: 'recipient_003',
      attemptedItems: ['item3'],
      locationHash: 'hash_005'
    }
  ]
};

/**
 * Get all successful collection logs for a specific event
 * @param {string} eventId - The ID of the event
 * @returns {Array} Array of successful collection records
 */
const getEventLogs = async (eventId) => {
  try {
    const logs = mockEventLogs[eventId] || [];
    // Return all logs for the event (both successful and duplicate prevention attempts)
    return logs;
  } catch (error) {
    console.error('Error fetching event logs:', error);
    throw new Error('Failed to fetch event logs');
  }
};

/**
 * Get analytics summary for a specific event
 * @param {string} eventId - The ID of the event
 * @returns {Object} Analytics object with totalServed and duplicatesPrevented counts
 */
const getEventAnalytics = async (eventId) => {
  try {
    const logs = mockEventLogs[eventId] || [];
    
    // Count successful collections and duplicates prevented
    const totalServed = logs.filter(log => log.status === 'success').length;
    const duplicatesPrevented = logs.filter(log => log.status === 'duplicate_prevented').length;
    
    return {
      totalServed,
      duplicatesPrevented
    };
  } catch (error) {
    console.error('Error calculating event analytics:', error);
    throw new Error('Failed to calculate event analytics');
  }
};

/**
 * Check if an event exists
 * @param {string} eventId - The ID of the event
 * @returns {boolean} True if event exists, false otherwise
 */
const eventExists = async (eventId) => {
  return mockEventLogs.hasOwnProperty(eventId);
};

module.exports = {
  getEventLogs,
  getEventAnalytics,
  eventExists
};