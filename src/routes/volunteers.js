
/**
 * @swagger
 * components:
 *   schemas:
 *     Volunteer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         assignedEvents:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *         did:
 *           type: string
 *           description: Anchored DID
 */

// src/routes/volunteers.js
const express = require("express");
const router = express.Router();
const volunteerController = require("../controllers/volunteerController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { body, param, query } = require("express-validator");

/**
 * @swagger
 * tags:
 *   name: Volunteers
 *   description: Volunteer management (admin, NGO only)
 */

/**
 * @swagger
 * /api/volunteers:
 *   get:
 *     summary: Get all volunteers (admin, NGO only)
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of volunteers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Volunteer'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Get all volunteers (admin, NGO only)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "ngo"]),
  volunteerController.getAllVolunteers
);

/**
 * @swagger
 * /api/volunteers/{id}:
 *   get:
 *     summary: Get a single volunteer by ID (admin, NGO only)
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Volunteer PostgreSQL UUID
 *     responses:
 *       200:
 *         description: Volunteer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Volunteer'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Volunteer not found
 */
// Get a single volunteer by ID (admin, NGO only)
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "ngo"]),
  param("id").isMongoId().withMessage("Valid volunteer ID required"),
  volunteerController.getVolunteer
);

// Volunteer activity
router.get(
  '/:id/activity',
  authMiddleware,
  roleMiddleware(['admin', 'ngo']),
  param('id').isMongoId().withMessage('Valid volunteer ID required'),
  volunteerController.getVolunteerActivity
);

// Volunteer rating
router.get(
  '/:id/rating',
  authMiddleware,
  roleMiddleware(['admin', 'ngo']),
  param('id').isMongoId().withMessage('Valid volunteer ID required'),
  volunteerController.getVolunteerRating
);


// Set volunteer's NGO
router.patch(
  '/:id/ngo',
  authMiddleware,
  roleMiddleware(['volunteer', 'admin']),
  param('id').isMongoId().withMessage('Valid volunteer ID required'),
  body('ngoId').isMongoId().withMessage('Valid NGO ID required'),
  volunteerController.setVolunteerNGO
);

// Get all scans by volunteer
router.get(
  '/:id/scans',
  authMiddleware,
  roleMiddleware(['volunteer', 'admin', 'ngo']),
  param('id').isMongoId().withMessage('Valid volunteer ID required'),
  volunteerController.getVolunteerScans
);

// Get events assigned to volunteer (with date/status filter)
router.get(
  '/:id/events',
  authMiddleware,
  roleMiddleware(['volunteer', 'admin', 'ngo']),
  param('id').isMongoId().withMessage('Valid volunteer ID required'),
  query('date').optional().isISO8601(),
  query('status').optional().isIn(['upcoming', 'completed']),
  volunteerController.getVolunteerEvents
);

// Get volunteer stats
router.get(
  '/:id/stats',
  authMiddleware,
  roleMiddleware(['volunteer', 'admin', 'ngo']),
  param('id').isMongoId().withMessage('Valid volunteer ID required'),
  volunteerController.getVolunteerStats
);

module.exports = router;
