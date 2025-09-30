/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           example: food
 *         location:
 *           type: string
 *         description:
 *           type: string
 *         quantity:
 *           type: integer
 *         supplies:
 *           type: array
 *           items:
 *             type: string
 *         volunteersCount:
 *           type: integer
 *         volunteers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Volunteer'
 *         totalServed:
 *           type: integer
 *         duplicates:
 *           type: integer
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         hederaTx:
 *           type: object
 *           description: Blockchain transaction info
 *           properties:
 *             status:
 *               type: string
 *             transactionId:
 *               type: string
 *             sequenceNumber:
 *               type: integer
 *             runningHash:
 *               type: string
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
 *         role:
 *           type: string
 *           example: volunteer
 */

// src/routes/events.js
const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Aid event management
 */

// Validation rules
const createEventValidation = [
  body("name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Event name is required"),
  body("type")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Event type is required"),
  body("location")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Location is required"),
  body("description").isString().trim().withMessage("Description is required"),
  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity is required and must be a positive integer"),
  body("supplies")
    .optional()
    .isArray()
    .withMessage("Supplies must be an array"),
  body("supplies.*")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each supply must be a non-empty string"),
  body("startTime").isISO8601().withMessage("Valid startTime is required"),
  body("endTime").isISO8601().withMessage("Valid endTime is required"),
];

const getEventValidation = [
  param("id").isMongoId().withMessage("Valid event id required"),
];

const assignVolunteerValidation = [
  body("eventId").isMongoId().withMessage("Valid eventId required"),
  body("volunteerId").isMongoId().withMessage("Valid volunteerId required"),
];

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new aid event (NGO only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - location
 *               - startTime
 *               - endTime
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 example: food
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               supplies:
 *                 type: array
 *                 items:
 *                   type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Event created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Event'
 *                 - type: object
 *                   properties:
 *                     hederaTx:
 *                       $ref: '#/components/schemas/Event/properties/hederaTx'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Create a new aid event (NGO only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ngo"]),
  createEventValidation,
  eventController.createEvent
);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: List all events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Event'
 *                   - type: object
 *                     properties:
 *                       hederaTx:
 *                         $ref: '#/components/schemas/Event/properties/hederaTx'
 *       401:
 *         description: Unauthorized
 */
// List all events
router.get("/", authMiddleware, eventController.getEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Event PostgreSQL UUID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Event'
 *                 - type: object
 *                   properties:
 *                     hederaTx:
 *                       $ref: '#/components/schemas/Event/properties/hederaTx'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
// Get a single event by ID
router.get(
  "/:id",
  authMiddleware,
  getEventValidation,
  eventController.getEvent
);

/**
 * @swagger
 * /api/events/assign-volunteer:
 *   post:
 *     summary: Assign a volunteer to an event (NGO only)
 *     tags: [Events]
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
 *               - volunteerId
 *             properties:
 *               eventId:
 *                 type: string
 *                 format: uuid
 *               volunteerId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Volunteer assigned to event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Assign a volunteer to an event (NGO only)
router.post(
  "/assign-volunteer",
  authMiddleware,
  roleMiddleware(["ngo"]),
  assignVolunteerValidation,
  eventController.assignVolunteer
);

module.exports = router;
