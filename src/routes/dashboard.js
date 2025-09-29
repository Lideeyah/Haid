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

/**
 * @swagger
 * /api/dashboard/general-stats:
 *   get:
 *     summary: Get general dashboard stats (admin, NGO only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: General dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventsCount:
 *                   type: integer
 *                 volunteersCount:
 *                   type: integer
 *                 beneficiariesCount:
 *                   type: integer
 *                 aidDistributed:
 *                   type: integer
 *                 aidTypes:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// General dashboard stats endpoint
router.get('/general-stats', authMiddleware, roleMiddleware(['admin', 'ngo']), dashboardController.getGeneralStats);

module.exports = router;
