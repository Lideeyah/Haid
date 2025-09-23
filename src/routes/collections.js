const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collectionsController');

// POST /collections - Process aid collection
router.post('/', collectionsController.postCollection);

// GET /collections/status - Check collection status
router.get('/status', collectionsController.getCollectionStatus);

module.exports = router;