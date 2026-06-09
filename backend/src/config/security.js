const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { config } = require('./env');

function generateJWT(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    issuer: 'hytrade-api',
    audience: 'hytrade-users',
  });
}

function verifyJWT(token) {
  return jwt.verify(token, config.jwtSecret, {
    issuer: 'hytrade-api',
    audience: 'hytrade-users',
  });
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function validatePasswordStrength(password) {
  const errors = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters long');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/\d/.test(password)) errors.push('Password must contain at least one number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain at least one special character');
  return { isValid: errors.length === 0, errors };
}

function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

module.exports = {
  generateJWT,
  verifyJWT,
  hashToken,
  validatePasswordStrength,
  generateSecureToken,
};
