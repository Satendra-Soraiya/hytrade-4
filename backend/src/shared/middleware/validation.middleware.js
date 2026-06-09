const { body, param, query, validationResult } = require('express-validator');
const { validatePasswordStrength } = require('../../config/security');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg, value: e.value })),
    });
  }
  next();
}

const validateRegistration = [
  body('firstName').trim().isLength({ min: 2, max: 50 }),
  body('lastName').trim().isLength({ min: 2, max: 50 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').custom((value) => {
    const result = validatePasswordStrength(value);
    if (!result.isValid) throw new Error(result.errors.join('; '));
    return true;
  }),
  body('tradingExperience').optional().isIn(['Beginner', 'Intermediate', 'Advanced', 'Professional']),
  body('riskTolerance').optional().isIn(['Low', 'Medium', 'High']),
  handleValidationErrors,
];

const validateLogin = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors,
];

const validateOrder = [
  body('stockSymbol').trim().notEmpty().isLength({ max: 20 }).matches(/^[A-Za-z0-9&.-]+$/),
  body('stockName').trim().notEmpty().isLength({ max: 100 }),
  body('orderType').trim().toUpperCase().isIn(['BUY', 'SELL']),
  body('quantity').isInt({ min: 1, max: 10000 }),
  body('price').isFloat({ min: 0.01, max: 10000000 }),
  body('orderMode').optional().isIn(['MARKET', 'LIMIT']),
  handleValidationErrors,
];

const validatePagination = [
  query('page').optional().isInt({ min: 1, max: 1000 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
];

const validateObjectId = [
  param('id').isMongoId(),
  handleValidationErrors,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateOrder,
  validatePagination,
  validateObjectId,
  handleValidationErrors,
};
