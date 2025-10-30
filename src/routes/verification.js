const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

// Verify event creation
router.get('/event/:eventId', verificationController.verifyEvent);
// Verify AidLog
router.get('/aidlog/:aidLogId', verificationController.verifyAidLog);
// Verify DID issuance
router.get('/did/:did', verificationController.verifyDID);

module.exports = router;
