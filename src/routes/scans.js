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
 *   description: Aid collection scan endpoints
 */

const scanValidation = [
	body('eventId').isUUID().withMessage('Valid eventId is required'),
	body('beneficiaryDid').isString().trim().notEmpty().withMessage('Valid beneficiaryDid is required')
];

/**
 * @swagger
 * /api/scans:
 *   post:
 *     summary: Log aid collection by scanning beneficiary QR (volunteer only)
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
 *                 description: Event MongoDB ID
 *               beneficiaryDid:
 *                 type: string
 *                 description: Beneficiary simulated DID
 *     responses:
 *       200:
 *         description: Aid collection status
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [collected]
 *                     transactionId:
 *                       type: string
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [duplicate-blocked]
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authMiddleware, roleMiddleware(['volunteer', 'admin']), scanValidation, scanController.scan);

module.exports = router;
