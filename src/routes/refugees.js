const express = require('express');
const router = express.Router();
const refugeeController = require('../controllers/refugeeController');

// POST /api/v1/refugees - Register a new beneficiary
router.post('/', refugeeController.registerRefugee);

module.exports = router;