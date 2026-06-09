const crypto = require('crypto');
const { Session } = require('./session.model');
const { User } = require('../users/user.model');
const { hashToken } = require('../../config/security');

class SessionService {
  static generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  static getDeviceType(userAgent = '') {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile';
    if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
    return 'desktop';
  }

  static async createSession(userId, token, req) {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection?.remoteAddress || 'Unknown';

    const session = await Session.create({
      sessionId,
      userId,
      tokenHash: hashToken(token),
      deviceInfo: { userAgent, ipAddress, deviceType: this.getDeviceType(userAgent) },
      expiresAt,
    });

    await User.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
    return session;
  }

  static async validateSession(token) {
    const session = await Session.findOne({
      tokenHash: hashToken(token),
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).populate('userId', '-password');

    if (!session) return null;
    await session.updateActivity();
    return session;
  }

  static async deactivateSession(token) {
    const session = await Session.findOne({ tokenHash: hashToken(token) });
    if (!session) return false;
    await session.deactivate();
    return true;
  }

  static async getUserActiveSessions(userId) {
    return Session.getActiveSessions(userId);
  }

  static async cleanExpiredSessions() {
    return Session.cleanExpiredSessions();
  }
}

module.exports = { SessionService };
