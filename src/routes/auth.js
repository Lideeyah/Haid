/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegistration:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - role
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [beneficiary, donor, volunteer, ngo, auditor]
 *         password:
 *           type: string
 *           description: Required for donor, volunteer, ngo, auditor
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         did:
 *           type: string
 *           description: Anchored DID
 *         qrCodeUrl:
 *           type: string
 *           format: uri
 *         createdAt:
 *           type: string
 *           format: date-time
 *         hederaTx:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *             transactionId:
 *               type: string
 *             sequenceNumber:
 *               type: integer
 *             runningHash:
 *               type: string
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 */

// src/routes/auth.js
const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user registration
 */

// Validation rules
const registerValidation = [
  body("name").isString().trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("role")
    .isIn(["beneficiary", "donor", "volunteer", "ngo", "auditor"])
    .withMessage("Valid role is required"),
  body("password")
    .if(body("role").not().equals("beneficiary"))
    .isLength({ min: 6 })
    .withMessage("Password (min 6 chars) required for non-beneficiaries"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password is required"),
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (beneficiary, donor, volunteer, NGO, auditor)
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
 *                 enum: [beneficiary, donor, volunteer, ngo, auditor]
 *               password:
 *                 type: string
 *                 description: Required for donor, volunteer, ngo, auditor
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     did:
 *                       type: string
 *                       description: Anchored DID
 *                     qrCodeUrl:
 *                       type: string
 *                       format: uri
 *                     hederaTx:
 *                       $ref: '#/components/schemas/UserResponse/properties/hederaTx'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/UserResponse'
 *                     hederaTx:
 *                       $ref: '#/components/schemas/UserResponse/properties/hederaTx'
 *       400:
 *         description: Validation error or user already exists
 */
router.post("/register", registerValidation, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login as donor, volunteer, NGO, or auditor
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
 *         description: Login successful, JWT token is set in HttpOnly cookie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid credentials or validation error
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                 - type: object
 *                   properties:
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           msg:
 *                             type: string
 *                           param:
 *                             type: string
 *                           location:
 *                             type: string
 */
router.post("/login", loginValidation, authController.login);

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
router.post("/logout", authController.logout);

module.exports = router;
