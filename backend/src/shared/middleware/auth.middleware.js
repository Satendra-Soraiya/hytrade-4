const { verifyJWT } = require('../../config/security');
const { SessionService } = require('../../modules/auth/session.service');
const { getBalanceInr } = require('../../modules/wallet/wallet.service');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];
    verifyJWT(token);

    const session = await SessionService.validateSession(token);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please login again.',
        code: 'SESSION_EXPIRED',
      });
    }

    const user = session.userId;
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account deactivated.',
        code: 'USER_NOT_FOUND',
      });
    }

    const accountBalance = await getBalanceInr(user._id);

    req.user = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'user',
      accountBalance,
      isVerified: user.isVerified,
      tradingExperience: user.tradingExperience,
      riskTolerance: user.riskTolerance,
      lastLoginAt: user.lastLoginAt,
      profilePicture: user.profilePicture || '',
      profilePictureType: user.profilePictureType || '',
    };

    req.session = {
      id: session.sessionId,
      deviceInfo: session.deviceInfo,
      lastActivity: session.lastActivity,
      createdAt: session.createdAt,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired. Please login again.',
        code: 'INVALID_TOKEN',
      });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication service error.',
      code: 'AUTH_SERVICE_ERROR',
    });
  }
}

module.exports = { authMiddleware };
