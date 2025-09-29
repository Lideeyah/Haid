// src/routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user registration
 */

// Validation rules
const registerValidation = [
	body('name').isString().trim().notEmpty().withMessage('Name is required'),
	body('email').isEmail().withMessage('Valid email is required'),
	body('role').isIn(['beneficiary', 'ngo', 'volunteer', 'admin']).withMessage('Valid role is required'),
	body('password').if(body('role').not().equals('beneficiary')).isLength({ min: 6 }).withMessage('Password (min 6 chars) required for non-beneficiaries')
];

const loginValidation = [
	body('email').isEmail().withMessage('Valid email is required'),
	body('password').isLength({ min: 6 }).withMessage('Password is required')
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (beneficiary, NGO, volunteer, admin)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [beneficiary, ngo, volunteer, admin]
 *               password:
 *                 type: string
 *                 description: Required for non-beneficiaries
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     beneficiaryDid:
 *                       type: string
 *                     qrCodeUrl:
 *                       type: string
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/register', registerValidation, authController.register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login as NGO, volunteer, or admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid credentials or validation error
 */
router.post('/login', loginValidation, authController.login);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (clears JWT cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/logout', authController.logout);

module.exports = router;
