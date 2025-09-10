const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Security Configuration
const SECURITY_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-jwt-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  LOCKOUT_TIME: parseInt(process.env.LOCKOUT_TIME) || 15 * 60 * 1000, // 15 minutes
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars',
  ACCOUNT_ENCRYPTION_SALT: process.env.ACCOUNT_ENCRYPTION_SALT || 'default-salt'
};

// Generate secure JWT token
const generateJWT = (payload) => {
  return jwt.sign(payload, SECURITY_CONFIG.JWT_SECRET, {
    expiresIn: SECURITY_CONFIG.JWT_EXPIRES_IN,
    issuer: 'hytrade-api',
    audience: 'hytrade-users'
  });
};

// Verify JWT token
const verifyJWT = (token) => {
  try {
    return jwt.verify(token, SECURITY_CONFIG.JWT_SECRET, {
      issuer: 'hytrade-api',
      audience: 'hytrade-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Encrypt sensitive data (like account balances)
const encryptSensitiveData = (data) => {
  const cipher = crypto.createCipher('aes-256-cbc', SECURITY_CONFIG.ENCRYPTION_KEY);
  let encrypted = cipher.update(data.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// Decrypt sensitive data
const decryptSensitiveData = (encryptedData) => {
  const decipher = crypto.createDecipher('aes-256-cbc', SECURITY_CONFIG.ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return parseFloat(decrypted);
};

// Validate password strength
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Generate secure random token
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash sensitive identifiers
const hashIdentifier = (identifier) => {
  return crypto.createHash('sha256').update(identifier + SECURITY_CONFIG.ACCOUNT_ENCRYPTION_SALT).digest('hex');
};

module.exports = {
  SECURITY_CONFIG,
  generateJWT,
  verifyJWT,
  encryptSensitiveData,
  decryptSensitiveData,
  validatePasswordStrength,
  generateSecureToken,
  hashIdentifier
};
