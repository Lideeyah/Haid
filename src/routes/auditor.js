// src/routes/auditor.js
const express = require('express');
const { query } = require('express-validator');
const router = express.Router();
const auditorController = require('../controllers/auditorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Auditor
 *   description: Auditor dashboard and verification (auditor only)
 */

// Validation rules for auditor dashboard
const dashboardValidation = [
  query('eventId').optional().isUUID().withMessage('Valid eventId required'),
  query('date').optional().isISO8601().withMessage('Valid date required')
];

/**
 * @swagger
 * /api/auditor/dashboard:
 *   get:
 *     summary: Get auditor dashboard logs and verification (auditor only)
 *     tags: [Auditor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: Filter logs by event ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filter logs by date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Auditor dashboard logs and Guardian verification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       did:
 *                         type: string
 *                         description: Anchored DID
 *                       hederaTx:
 *                         type: object
 *                         description: Blockchain transaction info
 *                         properties:
 *                           status:
 *                             type: string
 *                           transactionId:
 *                             type: string
 *                           sequenceNumber:
 *                             type: integer
 *                           runningHash:
 *                             type: string
 *                       status:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                 guardianMatch:
 *                   type: boolean
 *                   description: True if logs match Hedera Guardian indexer
 *       400:
 *         description: Validation error (invalid eventId or date)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 */
// Get auditor dashboard logs and verification (auditor only)
router.get('/dashboard',
  authMiddleware,
  roleMiddleware(['auditor']),
  dashboardValidation,
  auditorController.getDashboard
);

module.exports = router;
