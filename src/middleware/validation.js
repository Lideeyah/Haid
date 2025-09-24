const { body, param, query, validationResult } = require('express-validator');

/**
 * Input validation middleware
 */

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array(),
        status: 400
      }
    });
  }
  next();
};

/**
 * User registration validation
 */
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .isIn(['admin', 'NGO', 'volunteer'])
    .withMessage('Role must be one of: admin, NGO, volunteer'),
  handleValidationErrors
];

/**
 * User login validation
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Event creation validation
 */
const validateEventCreation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Event name must be between 3 and 255 characters'),
  body('date')
    .isISO8601()
    .withMessage('Valid date in ISO 8601 format is required'),
  body('location')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Location must be between 3 and 255 characters'),
  body('ngoId')
    .isInt({ min: 1 })
    .withMessage('Valid NGO ID is required'),
  handleValidationErrors
];

/**
 * Event update validation
 */
const validateEventUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid event ID is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Event name must be between 3 and 255 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Valid date in ISO 8601 format is required'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Location must be between 3 and 255 characters'),
  handleValidationErrors
];

/**
 * Collection validation
 */
const validateCollection = [
  body('refugeeDid')
    .matches(/^did:haid:[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .withMessage('Valid refugee DID is required'),
  body('eventId')
    .isInt({ min: 1 })
    .withMessage('Valid event ID is required'),
  handleValidationErrors
];

/**
 * Manual collection validation
 */
const validateManualCollection = [
  body('refugeeDid')
    .matches(/^did:haid:[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .withMessage('Valid refugee DID is required'),
  body('eventId')
    .isInt({ min: 1 })
    .withMessage('Valid event ID is required'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  handleValidationErrors
];

/**
 * Bulk collection validation
 */
const validateBulkCollections = [
  body('collections')
    .isArray({ min: 1 })
    .withMessage('Collections array is required'),
  body('collections.*.refugeeDid')
    .matches(/^did:haid:[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .withMessage('Valid refugee DID is required for each collection'),
  body('collections.*.eventId')
    .isInt({ min: 1 })
    .withMessage('Valid event ID is required for each collection'),
  handleValidationErrors
];

/**
 * Collection status validation
 */
const validateCollectionStatus = [
  query('refugeeDid')
    .matches(/^did:haid:[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .withMessage('Valid refugee DID is required'),
  query('eventId')
    .isInt({ min: 1 })
    .withMessage('Valid event ID is required'),
  handleValidationErrors
];

/**
 * Event ID parameter validation
 */
const validateEventId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid event ID is required'),
  handleValidationErrors
];

/**
 * User ID parameter validation
 */
const validateUserId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateEventCreation,
  validateEventUpdate,
  validateCollection,
  validateManualCollection,
  validateBulkCollections,
  validateCollectionStatus,
  validateEventId,
  validateUserId,
  handleValidationErrors
};