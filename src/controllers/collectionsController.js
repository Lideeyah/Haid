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
 * Process manual aid collection request
 * POST /collections/manual
 */
const manualCollection = async (req, res) => {
  try {
    const { refugeeDid, eventId, reason } = req.body;

    // Validate required fields
    if (!refugeeDid || !eventId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'refugeeDid, eventId, and reason are required'
      });
    }

    // Process the manual collection
    const result = await collectionsService.manualCollection(refugeeDid, eventId, reason);

    return res.status(201).json(result);
  } catch (error) {
    console.error('Manual collection request failed:', error);
    
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to process manual collection request',
      details: error.message
    });
  }
};

/**
 * Process bulk aid collection requests
 * POST /collections/bulk
 */
const bulkCollections = async (req, res) => {
  try {
    const { collections } = req.body;

    if (!collections || !Array.isArray(collections)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'A \'collections\' array is required'
      });
    }

    const result = await collectionsService.processBulkCollections(collections);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Bulk collection request failed:', error);
    
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to process bulk collection request',
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
  manualCollection,
  bulkCollections,
  getCollectionStatus
};