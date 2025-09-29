// src/routes/donor.js
const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Donor
 *   description: Donor dashboard and oversight (donor only)
 */

/**
 * @swagger
 * /api/donor/dashboard:
 *   get:
 *     summary: Get donor dashboard KPIs and impact (donor only)
 *     tags: [Donor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Donor dashboard metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRecipientsServed:
 *                   type: integer
 *                   description: Number of unique beneficiaries who received aid (collected)
 *                 distributionProgress:
 *                   type: object
 *                   properties:
 *                     totalEvents:
 *                       type: integer
 *                     completedEvents:
 *                       type: integer
 *                     percentCompleted:
 *                       type: integer
 *                 geographicImpact:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       location:
 *                         type: string
 *                       events:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Get donor dashboard KPIs and impact (donor only)
router.get('/dashboard', authMiddleware, roleMiddleware(['donor']), donorController.getDashboard);

module.exports = router;
