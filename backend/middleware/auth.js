const { verifyJWT } = require('../config/security');
const { CustomUserModel } = require('../model/CustomUserModel');

// Enhanced authentication middleware
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

    // Verify JWT token
    const decoded = verifyJWT(token);
    
    // Fetch user from database to ensure they still exist and are active
    const user = await CustomUserModel.findById(decoded.userId).select('-password');
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

    // Attach user information to request object
    req.user = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'user',
      accountBalance: user.accountBalance,
      isVerified: user.isVerified,
      tradingExperience: user.tradingExperience,
      riskTolerance: user.riskTolerance
    };

    // Update last activity timestamp
    user.lastLoginAt = new Date();
    await user.save();

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
