const healthService = require('../services/healthService');

/**
 * Health check controller
 * Returns server status and basic system information
 */
const getHealth = async (req, res) => {
  try {
    const healthData = await healthService.checkHealth();
    res.status(200).json(healthData);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      message: 'Service unavailable',
      error: error.message
    });
  }
};

module.exports = {
  getHealth
};