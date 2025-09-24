const userService = require('../services/userService');
const authService = require('../services/authService');
const { getSuccessMessage, getErrorMessage } = require('../services/i18nService');

/**
 * User controller for handling user registration and login
 */

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           examples:
 *             ngo_user:
 *               summary: NGO User Registration
 *               value:
 *                 email: "ngo@example.com"
 *                 password: "SecurePass123"
 *                 role: "NGO"
 *             volunteer_user:
 *               summary: Volunteer Registration
 *               value:
 *                 email: "volunteer@example.com"
 *                 password: "SecurePass123"
 *                 role: "volunteer"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await userService.createUser({ email, password, role });
    
    // Generate JWT token
    const token = authService.generateToken(user);
    const refreshToken = authService.generateRefreshToken(user);
    
    res.status(201).json({
      success: true,
      message: getSuccessMessage('user.registered', {}, req.language),
      data: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        token,
        refreshToken
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        message: getErrorMessage('failed_to_register', {}, req.language),
        details: error.message,
        status: 400
      }
    });
  }
};

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ngo@example.com"
 *               password:
 *                 type: string
 *                 example: "SecurePass123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User logged in successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.authenticateUser(email, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: getErrorMessage('invalid_credentials', {}, req.language),
          status: 401
        }
      });
    }
    
    // Generate JWT token
    const token = authService.generateToken(user);
    const refreshToken = authService.generateRefreshToken(user);
    
    res.status(200).json({
      success: true,
      message: getSuccessMessage('user.logged_in', {}, req.language),
      data: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        token,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: getErrorMessage('failed_to_login', {}, req.language),
        details: error.message,
        status: 500
      }
    });
  }
};

module.exports = {
  registerUser,
  loginUser
};