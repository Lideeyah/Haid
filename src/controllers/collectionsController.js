const collectionsService = require('../services/collectionsService');

/**
 * Collections controller to handle aid collection requests
 */

/**
 * Process aid collection request
 * POST /collections
 */
const postCollection = async (req, res) => {
  try {
    const { refugeeDid, eventId } = req.body;

    // Validate required fields
    if (!refugeeDid || !eventId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Both refugeeDid and eventId are required',
        details: {
          refugeeDid: refugeeDid ? 'provided' : 'missing',
          eventId: eventId ? 'provided' : 'missing'
        }
      });
    }

    // Process the collection
    const result = await collectionsService.processCollection(refugeeDid, eventId);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      // Handle duplicate claim
      return res.status(409).json(result);
    }
  } catch (error) {
    console.error('Collection request failed:', error);
    
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to process collection request',
      details: error.message
    });
  }
};

/**
 * Check collection status for a refugee and event
 * GET /collections/status?refugeeDid=...&eventId=...
 */
const getCollectionStatus = async (req, res) => {
  try {
    const { refugeeDid, eventId } = req.query;

    if (!refugeeDid || !eventId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Both refugeeDid and eventId query parameters are required'
      });
    }

    const hasCollected = collectionsService.hasCollected(refugeeDid, eventId);

    return res.status(200).json({
      success: true,
      data: {
        refugeeDid,
        eventId,
        hasCollected,
        message: hasCollected ? 'Aid has been collected' : 'Aid has not been collected'
      }
    });
  } catch (error) {
    console.error('Status check failed:', error);
    
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to check collection status',
      details: error.message
    });
  }
};

module.exports = {
  postCollection,
  getCollectionStatus
};