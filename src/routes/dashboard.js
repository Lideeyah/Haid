// src/routes/dashboard.js
const express = require('express');
const { param } = require('express-validator');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: NGO dashboard endpoints
 */

const statsValidation = [
	param('eventId').isUUID().withMessage('Valid eventId required')
];

/**
 * @swagger
 * /api/dashboard/stats/{eventId}:
 *   get:
 *     summary: Get event stats (NGO only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: Event MongoDB ID
 *     responses:
 *       200:
 *         description: Event stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalServed:
 *                   type: integer
 *                 duplicates:
 *                   type: integer
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Event not found
 */
router.get('/stats/:eventId', authMiddleware, roleMiddleware(['ngo', 'admin']), statsValidation, dashboardController.getStats);

module.exports = router;
