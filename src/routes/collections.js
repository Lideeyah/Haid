const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collectionsController');
const { protect, authorize } = require('../middleware/auth');
const { 
  validateCollection, 
  validateManualCollection, 
  validateBulkCollections, 
  validateCollectionStatus 
} = require('../middleware/validation');

// POST /collections - Process aid collection
router.post('/', protect, authorize('admin', 'NGO', 'volunteer'), validateCollection, collectionsController.postCollection);

// POST /collections/manual - Process manual aid collection
router.post('/manual', protect, authorize('admin', 'NGO'), validateManualCollection, collectionsController.manualCollection);

// POST /collections/bulk - Process bulk aid collections
router.post('/bulk', protect, authorize('admin', 'NGO', 'volunteer'), validateBulkCollections, collectionsController.bulkCollections);

// GET /collections/status - Check collection status
router.get('/status', protect, authorize('admin', 'NGO', 'volunteer'), validateCollectionStatus, collectionsController.getCollectionStatus);

module.exports = router;