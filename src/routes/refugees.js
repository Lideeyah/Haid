const express = require('express');
const router = express.Router();
const refugeeController = require('../controllers/refugeeController');

// POST /refugees - Generate new DID for refugee onboarding
router.post('/', refugeeController.createRefugeeDID);

module.exports = router;