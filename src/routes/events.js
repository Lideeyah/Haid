/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         location:
 *           type: string
 *         createdBy:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */
// src/routes/events.js
const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Aid event management
 */

const createEventValidation = [
	body('name').isString().trim().notEmpty().withMessage('Event name is required'),
	body('type').isString().trim().notEmpty().withMessage('Event type is required'),
	body('location').isString().trim().notEmpty().withMessage('Location is required'),
	body('startTime').isISO8601().withMessage('Valid startTime is required'),
	body('endTime').isISO8601().withMessage('Valid endTime is required')
];

const getEventValidation = [
	param('id').isUUID().withMessage('Valid event id required')
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
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authMiddleware, roleMiddleware(['ngo']), createEventValidation, eventController.createEvent);
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
 *                 $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, eventController.getEvents);
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
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
router.get('/:id', authMiddleware, getEventValidation, eventController.getEvent);

module.exports = router;
