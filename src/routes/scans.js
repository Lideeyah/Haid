// src/routes/scans.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const scanController = require('../controllers/scanController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Scans
 *   description: Aid distribution scanning (volunteer only)
 */

const scanValidation = [
	body('eventId').isMongoId().withMessage('Valid eventId is required'),
	body('beneficiaryDid').isString().trim().notEmpty().withMessage('Valid beneficiaryDid is required')
];

/**
 * @swagger
 * /api/scans:
 *   post:
 *     summary: Scan beneficiary QR code and log aid distribution (volunteer only)
 *     tags: [Scans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - beneficiaryDid
 *             properties:
 *               eventId:
 *                 type: string
 *                 format: uuid
 *                 description: Event PostgreSQL UUID
 *               beneficiaryDid:
 *                 type: string
 *                 description: Beneficiary DID
 *     responses:
 *       200:
 *         description: Aid log created or duplicate blocked
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [collected]
 *                     hederaTx:
 *                       type: object
 *                       description: Blockchain transaction info
 *                       properties:
 *                         status:
 *                           type: string
 *                         transactionId:
 *                           type: string
 *                         sequenceNumber:
 *                           type: integer
 *                         runningHash:
 *                           type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [duplicate-blocked]
 *       400:
 *         description: Validation error (invalid eventId or beneficiaryDid)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Volunteer not assigned to event
 *       404:
 *         description: Event or beneficiary not found
 */
// Scan beneficiary QR code and log aid distribution (volunteer only)
router.post('/', authMiddleware, roleMiddleware(['volunteer', 'admin']), scanValidation, scanController.scan);

module.exports = router;
