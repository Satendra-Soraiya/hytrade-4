const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { CustomUserModel } = require('../model/CustomUserModel');
const { generateJWT, validatePasswordStrength, SECURITY_CONFIG } = require('../config/security');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');
const { SessionService } = require('../services/sessionService');

const router = express.Router();

// Rate limiting for authentication endpoints - DISABLED FOR TESTING
const authLimiter = (req, res, next) => next(); // Disabled for testing
const loginLimiter = (req, res, next) => next(); // Disabled for testing

// User Registration
router.post('/register', authLimiter, validateRegistration, async (req, res) => {
  try {
    const { firstName, lastName, email, password, tradingExperience, riskTolerance } = req.body;

    // Check if user already exists
    const existingUser = await CustomUserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash password with industry-standard rounds
    const hashedPassword = await bcrypt.hash(password, SECURITY_CONFIG.BCRYPT_ROUNDS);

    // Create new user
    const newUser = new CustomUserModel({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      tradingExperience: tradingExperience || 'Beginner',
      riskTolerance: riskTolerance || 'Medium',
      accountBalance: 100000, // Starting balance ₹1,00,000
      isActive: true,
      isVerified: false, // Require email verification
      createdAt: new Date(),
      lastLoginAt: new Date()
    });

    await newUser.save();

    // Generate JWT token
    const token = generateJWT({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role || 'user'
    });

    // Create session for new user
    const session = await SessionService.createSession(newUser._id, token, req);

    // Log successful registration
    console.log(`New user registered: ${email} | Session: ${session.sessionId}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: token,
      sessionId: session.sessionId,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        tradingExperience: newUser.tradingExperience,
        riskTolerance: newUser.riskTolerance,
        accountBalance: newUser.accountBalance,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt
      },
      session: {
        id: session.sessionId,
        deviceInfo: session.deviceInfo,
        expiresAt: session.expiresAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
        code: 'DUPLICATE_EMAIL'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// User Login
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await CustomUserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = generateJWT({
      userId: user._id,
      email: user.email,
      role: user.role || 'user'
    });

    // Create session
    const session = await SessionService.createSession(user._id, token, req);

    // Log successful login
    console.log(`User logged in: ${email} | Session: ${session.sessionId}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      sessionId: session.sessionId,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        tradingExperience: user.tradingExperience,
        riskTolerance: user.riskTolerance,
        accountBalance: user.accountBalance,
        totalInvestment: user.totalInvestment,
        totalPnL: user.totalPnL,
        isVerified: user.isVerified,
        lastLoginAt: user.lastLoginAt
      },
      session: {
        id: session.sessionId,
        deviceInfo: session.deviceInfo,
        expiresAt: session.expiresAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      code: 'LOGIN_ERROR'
    });
  }
});

// Token Validation
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: req.user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      code: 'VERIFICATION_ERROR'
    });
  }
});

// Logout with session management
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    
    // Deactivate the session
    const sessionDeactivated = await SessionService.deactivateSession(token);
    
    console.log(`User logged out: ${req.user.email} | Session deactivated: ${sessionDeactivated}`);
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      sessionDeactivated: sessionDeactivated
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

// Get user's active sessions
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const sessions = await SessionService.getUserActiveSessions(req.user.id);
    
    res.status(200).json({
      success: true,
      sessions: sessions.map(session => ({
        id: session.sessionId,
        deviceInfo: session.deviceInfo,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        isCurrent: session.sessionId === req.session.id
      }))
    });
  } catch (error) {
    console.error('Error getting user sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions',
      code: 'SESSIONS_ERROR'
    });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await CustomUserModel.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        tradingExperience: user.tradingExperience,
        riskTolerance: user.riskTolerance,
        accountBalance: user.accountBalance,
        totalInvestment: user.totalInvestment,
        totalPnL: user.totalPnL,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      code: 'PROFILE_FETCH_ERROR'
    });
  }
});

module.exports = router;
