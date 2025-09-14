const crypto = require('crypto');
const { SessionModel } = require('../model/SessionModel');
const { CustomUserModel } = require('../model/CustomUserModel');

class SessionService {
  // Generate unique session ID
  static generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create new session
  static async createSession(userId, token, req) {
    try {
      const sessionId = this.generateSessionId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Get device info
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
      const deviceType = this.getDeviceType(userAgent);

      const session = new SessionModel({
        sessionId,
        userId,
        token,
        deviceInfo: {
          userAgent,
          ipAddress,
          deviceType
        },
        expiresAt,
        loginLocation: this.getLocationFromIP(ipAddress)
      });

      await session.save();
      
      // Update user's last login
      await CustomUserModel.findByIdAndUpdate(userId, {
        lastLoginAt: new Date()
      });

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Validate session
  static async validateSession(token) {
    try {
      const session = await SessionModel.findOne({
        token,
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).populate('userId', '-password');

      if (!session) {
        return null;
      }

      // Update last activity
      await session.updateActivity();
      
      return session;
    } catch (error) {
      console.error('Error validating session:', error);
      return null;
    }
  }

  // Get device type from user agent
  static getDeviceType(userAgent) {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  // Get location from IP (simplified)
  static getLocationFromIP(ip) {
    // In production, you'd use a service like GeoIP
    if (ip === '127.0.0.1' || ip === '::1') {
      return 'Local Development';
    }
    return 'Unknown Location';
  }

  // Deactivate session (logout)
  static async deactivateSession(token) {
    try {
      const session = await SessionModel.findOne({ token });
      if (session) {
        await session.deactivate();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deactivating session:', error);
      return false;
    }
  }

  // Get user's active sessions
  static async getUserActiveSessions(userId) {
    try {
      return await SessionModel.getActiveSessions(userId);
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  // Deactivate all sessions for a user
  static async deactivateAllUserSessions(userId) {
    try {
      const result = await SessionModel.updateMany(
        { userId, isActive: true },
        { 
          isActive: false, 
          loggedOutAt: new Date() 
        }
      );
      return result.modifiedCount;
    } catch (error) {
      console.error('Error deactivating all user sessions:', error);
      return 0;
    }
  }

  // Clean expired sessions
  static async cleanExpiredSessions() {
    try {
      const deletedCount = await SessionModel.cleanExpiredSessions();
      console.log(`Cleaned ${deletedCount} expired sessions`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
      return 0;
    }
  }

  // Get session statistics
  static async getSessionStats() {
    try {
      const totalSessions = await SessionModel.countDocuments();
      const activeSessions = await SessionModel.countDocuments({ 
        isActive: true, 
        expiresAt: { $gt: new Date() } 
      });
      const expiredSessions = await SessionModel.countDocuments({ 
        expiresAt: { $lt: new Date() } 
      });

      return {
        total: totalSessions,
        active: activeSessions,
        expired: expiredSessions
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return { total: 0, active: 0, expired: 0 };
    }
  }
}

module.exports = { SessionService };
