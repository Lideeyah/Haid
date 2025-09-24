const userService = require('../services/userService');
const authService = require('../services/authService');
const { logSecurity } = require('../services/logger');

/**
 * Authentication and authorization middleware
 */

/**
 * Middleware to protect routes that require authentication
 */
const protect = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.get('Authorization');
    const token = authService.extractTokenFromHeader(authHeader);

    if (!token) {
      logSecurity('unauthorized_access', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        reason: 'no_token'
      });
      
      return res.status(401).json({
        success: false,
        error: {
          message: 'Not authorized - No token provided',
          status: 401
        }
      });
    }

    // Verify token
    const decoded = authService.verifyToken(token);
    
    // Get user from database
    const user = await userService.findUserById(decoded.id);
    
    if (!user) {
      logSecurity('unauthorized_access', { 
        ip: req.ip, 
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        reason: 'user_not_found',
        userId: decoded.id
      });
      
      return res.status(401).json({
        success: false,
        error: {
          message: 'Not authorized - User not found',
          status: 401
        }
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    logSecurity('unauthorized_access', { 
      ip: req.ip, 
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      reason: 'invalid_token',
      error: error.message
    });
    
    return res.status(401).json({
      success: false,
      error: {
        message: 'Not authorized - Invalid token',
        status: 401
      }
    });
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Forbidden',
          status: 403
        }
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};