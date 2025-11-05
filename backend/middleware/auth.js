const { verifyJWT } = require('../config/security');
const { CustomUserModel } = require('../model/CustomUserModel');
const { SessionService } = require('../services/sessionService');

// Enhanced authentication middleware with session management
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No valid token provided.",
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];

    // First verify JWT token
    const decoded = verifyJWT(token);
    
    // Then validate session
    const session = await SessionService.validateSession(token);
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        message: "Session expired or invalid. Please login again.",
        code: 'SESSION_EXPIRED'
      });
    }

    // Get user from session (already populated)
    const user = session.userId;
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found or account deactivated.",
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: "Account is deactivated. Please contact support.",
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Attach user and session information to request object
    req.user = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'user',
      accountBalance: user.accountBalance,
      isVerified: user.isVerified,
      tradingExperience: user.tradingExperience,
      riskTolerance: user.riskTolerance,
      lastLoginAt: user.lastLoginAt,
      profilePicture: user.profilePicture || '',
      profilePictureType: user.profilePictureType || ''
    };

    req.session = {
      id: session.sessionId,
      deviceInfo: session.deviceInfo,
      lastActivity: session.lastActivity,
      createdAt: session.createdAt
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.message === 'Invalid or expired token') {
      return res.status(401).json({ 
        success: false, 
        message: "Token is invalid or expired. Please login again.",
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Authentication service error.",
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

// Admin-only middleware
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required.",
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: "Admin access required.",
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }

  next();
};

// Verified user middleware (for sensitive trading operations)
const verifiedUserMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required.",
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ 
      success: false, 
      message: "Account verification required for trading operations.",
      code: 'VERIFICATION_REQUIRED'
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  verifiedUserMiddleware
};
