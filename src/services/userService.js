
const { pool } = require('../config/database');
const authService = require('./authService');
const logger = require('./logger').logger;

/**
 * User service for managing users and roles
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} userData.role - User's role (e.g., 'NGO', 'volunteer', 'admin')
 * @returns {Object} Created user
 */
const createUser = async (userData) => {
  const client = await pool.connect();
  
  try {
    // Validate required fields
    if (!userData.email || !userData.password || !userData.role) {
      throw new Error('Missing required fields: email, password, and role are required');
    }

    // Hash the password
    const passwordHash = await authService.hashPassword(userData.password);

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [userData.email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const result = await client.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [userData.email, passwordHash, userData.role]
    );

    const newUser = result.rows[0];
    logger.logAuth('user_created', { userId: newUser.id, email: newUser.email, role: newUser.role });
    
    return newUser;
  } catch (error) {
    logger.logError(error, { operation: 'createUser', email: userData.email });
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Find a user by email
 * @param {string} email - User's email
 * @returns {Object|undefined} User or undefined if not found
 */
const findUserByEmail = async (email) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT id, email, password_hash, role, created_at FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || undefined;
  } catch (error) {
    logger.logError(error, { operation: 'findUserByEmail', email });
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Find a user by ID
 * @param {number} id - User's ID
 * @returns {Object|undefined} User or undefined if not found
 */
const findUserById = async (id) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT id, email, password_hash, role, created_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || undefined;
  } catch (error) {
    logger.logError(error, { operation: 'findUserById', userId: id });
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Authenticate a user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object|null} User if authentication is successful, otherwise null
 */
const authenticateUser = async (email, password) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT id, email, password_hash, role, created_at FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    const isValidPassword = await authService.comparePassword(password, user.password_hash);
    
    if (isValidPassword) {
      logger.logAuth('user_login_success', { userId: user.id, email: user.email });
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      };
    } else {
      logger.logAuth('user_login_failed', { email, reason: 'invalid_password' });
      return null;
    }
  } catch (error) {
    logger.logError(error, { operation: 'authenticateUser', email });
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  authenticateUser
};
