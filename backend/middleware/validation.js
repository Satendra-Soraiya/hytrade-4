const { body, param, query, validationResult } = require('express-validator');
const { validatePasswordStrength } = require('../config/security');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2-50 characters')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('First name can only contain letters, numbers, and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2-50 characters')
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage('Last name can only contain letters, numbers, and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),
  
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required'),
  
  body('tradingExperience')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced', 'Professional'])
    .withMessage('Invalid trading experience level'),
  
  body('riskTolerance')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid risk tolerance level'),
  
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty'),
  
  handleValidationErrors
];

// Trading order validation
const validateOrder = [
  body('stockSymbol')
    .trim()
    .notEmpty()
    .withMessage('Stock symbol is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Stock symbol must be between 1-20 characters')
    .matches(/^[A-Z0-9.-]+$/)
    .withMessage('Stock symbol can only contain uppercase letters, numbers, dots, and hyphens'),
  
  body('stockName')
    .trim()
    .notEmpty()
    .withMessage('Stock name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Stock name must be between 1-100 characters'),
  
  body('orderType')
    .trim()
    .toUpperCase()
    .isIn(['BUY', 'SELL'])
    .withMessage('Order type must be either BUY or SELL'),
  
  body('quantity')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Quantity must be a positive integer between 1 and 10,000'),
  
  body('price')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Price must be a positive number between 0.01 and 1,000,000')
    .custom((value) => {
      // Ensure price has at most 2 decimal places
      if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
        throw new Error('Price can have at most 2 decimal places');
      }
      return true;
    }),
  
  body('orderMode')
    .optional()
    .isIn(['MARKET', 'LIMIT', 'STOP_LOSS'])
    .withMessage('Invalid order mode'),
  
  handleValidationErrors
];

// Portfolio update validation
const validatePortfolioUpdate = [
  body('accountBalance')
    .optional()
    .isFloat({ min: 0, max: 100000000 })
    .withMessage('Account balance must be between 0 and 100,000,000'),
  
  body('tradingExperience')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced', 'Professional'])
    .withMessage('Invalid trading experience level'),
  
  body('riskTolerance')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid risk tolerance level'),
  
  handleValidationErrors
];

// Watchlist validation
const validateWatchlist = [
  body('stockSymbol')
    .trim()
    .notEmpty()
    .withMessage('Stock symbol is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Stock symbol must be between 1-20 characters')
    .matches(/^[A-Z0-9.-]+$/)
    .withMessage('Stock symbol can only contain uppercase letters, numbers, dots, and hyphens'),
  
  body('stockName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Stock name must be less than 100 characters'),
  
  handleValidationErrors
];

// ID parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// Query parameter validation for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'price', 'quantity', 'profitLoss'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  handleValidationErrors
];

// Amount validation for financial operations
const validateAmount = [
  body('amount')
    .isFloat({ min: 0.01, max: 10000000 })
    .withMessage('Amount must be between 0.01 and 10,000,000')
    .custom((value) => {
      // Ensure amount has at most 2 decimal places
      if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
        throw new Error('Amount can have at most 2 decimal places');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Stock search validation
const validateStockSearch = [
  query('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Search query must be between 1-50 characters')
    .matches(/^[a-zA-Z0-9\s.-]+$/)
    .withMessage('Search query can only contain letters, numbers, spaces, dots, and hyphens'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateOrder,
  validatePortfolioUpdate,
  validateWatchlist,
  validateObjectId,
  validatePagination,
  validateAmount,
  validateStockSearch,
  handleValidationErrors
};
