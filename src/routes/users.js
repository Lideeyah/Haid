const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

// POST /users/register - Register a new user
router.post('/register', validateUserRegistration, userController.registerUser);

// POST /users/login - Login a user
router.post('/login', validateUserLogin, userController.loginUser);

module.exports = router;