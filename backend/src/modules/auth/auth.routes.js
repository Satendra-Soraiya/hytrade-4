const express = require('express');
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, mapUserResponse } = require('./auth.service');
const { SessionService } = require('./session.service');
const { User } = require('../users/user.model');
const { getBalanceInr } = require('../wallet/wallet.service');
const { resolveDefaultAvatarIndex } = require('../profile/profile.validation');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');
const { validateRegistration, validateLogin } = require('../../shared/middleware/validation.middleware');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many auth requests', code: 'RATE_LIMIT_EXCEEDED' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: 'Too many login attempts', code: 'RATE_LIMIT_EXCEEDED' },
});

router.post('/register', authLimiter, validateRegistration, async (req, res) => {
  try {
    const result = await registerUser(req.body, req);
    res.status(201).json({ success: true, message: 'Account created successfully', ...result });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Registration failed',
      code: error.code || 'REGISTRATION_ERROR',
    });
  }
});

router.post('/login', loginLimiter, validateLogin, async (req, res) => {
  try {
    const result = await loginUser(req.body, req);
    res.json({ success: true, message: 'Login successful', ...result });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Login failed',
      code: error.code || 'LOGIN_ERROR',
    });
  }
});

router.get('/verify', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Token is valid', user: req.user });
});

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const sessionDeactivated = await SessionService.deactivateSession(token);
    res.json({ success: true, message: 'Logged out successfully', sessionDeactivated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed', code: 'LOGOUT_ERROR' });
  }
});

router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const sessions = await SessionService.getUserActiveSessions(req.user.id);
    res.json({
      success: true,
      sessions: sessions.map((s) => ({
        id: s.sessionId,
        deviceInfo: s.deviceInfo,
        lastActivity: s.lastActivity,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        isCurrent: s.sessionId === req.session.id,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get sessions', code: 'SESSIONS_ERROR' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found', code: 'USER_NOT_FOUND' });
    const accountBalance = await getBalanceInr(user._id);
    res.json({ success: true, user: await mapUserResponse(user, accountBalance) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile', code: 'PROFILE_FETCH_ERROR' });
  }
});

router.get('/avatar-url', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('profilePicture profilePictureType updatedAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const baseApiUrl = `${req.protocol}://${req.get('host')}`;
    const versionToken = user.updatedAt ? new Date(user.updatedAt).getTime() : Date.now();

    let url;
    if (user.profilePictureType === 'custom' && user.profilePicture) {
      if (/^https?:\/\//i.test(user.profilePicture)) {
        url = `${baseApiUrl}/api/proxy/image?url=${encodeURIComponent(user.profilePicture)}&v=${versionToken}`;
      } else {
        const path = user.profilePicture.startsWith('/') ? user.profilePicture : `/${user.profilePicture}`;
        url = `${baseApiUrl}${path}?v=${versionToken}`;
      }
    } else if (/^https?:\/\//i.test(user.profilePicture) && user.profilePicture.includes('/images/default-avatars/')) {
      url = `${baseApiUrl}/api/proxy/image?url=${encodeURIComponent(user.profilePicture)}&v=${versionToken}`;
    } else {
      const idx = resolveDefaultAvatarIndex(user.profilePicture);
      url = `${baseApiUrl}/images/default-avatars/AVATAR${idx}.jpeg?v=${versionToken}`;
    }

    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to resolve avatar URL' });
  }
});

module.exports = router;
