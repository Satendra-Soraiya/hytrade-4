const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { User } = require('../users/user.model');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');
const { config } = require('../../config/env');
const { isS3Configured, uploadProfileImage } = require('./s3.service');
const { processProfileImage } = require('./image.service');
const { normalizeProfilePictureUpdate } = require('./profile.validation');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed!'), ok);
  },
});

function deleteLocalProfileFile(storedPath) {
  if (!storedPath || !storedPath.startsWith('/uploads/profiles/')) return;
  const filePath = path.join(__dirname, '../../..', storedPath);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn('Failed to delete old profile file:', err.message);
  }
}

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        tradingExperience: user.tradingExperience,
        riskTolerance: user.riskTolerance,
        profilePicture: user.profilePicture,
        profilePictureType: user.profilePictureType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, profilePicture, profilePictureType } = req.body;
    const update = { updatedAt: new Date() };
    if (firstName !== undefined) update.firstName = String(firstName).trim();
    if (lastName !== undefined) update.lastName = String(lastName).trim();

    if (profilePicture !== undefined || profilePictureType !== undefined) {
      const normalized = normalizeProfilePictureUpdate({ profilePicture, profilePictureType });
      if (normalized) {
        update.profilePicture = normalized.profilePicture;
        update.profilePictureType = normalized.profilePictureType;
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, select: '-password' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Invalid profile data' });
  }
});

router.post('/profile/upload', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const existing = await User.findById(req.user.id).select('profilePicture profilePictureType');
    const processed = await processProfileImage(req.file.buffer);
    let storedUrlOrPath;

    if (isS3Configured()) {
      const key = `profiles/profile-${req.user.id}-${Date.now()}${processed.ext}`;
      storedUrlOrPath = await uploadProfileImage(processed.buffer, processed.contentType, key);
    } else {
      const uploadDir = path.join(__dirname, '../../../uploads/profiles');
      fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `profile-${req.user.id}-${Date.now()}${processed.ext}`;
      fs.writeFileSync(path.join(uploadDir, filename), processed.buffer);
      storedUrlOrPath = `/uploads/profiles/${filename}`;
    }

    if (existing?.profilePictureType === 'custom') {
      deleteLocalProfileFile(existing.profilePicture);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: storedUrlOrPath, profilePictureType: 'custom', updatedAt: new Date() },
      { new: true, select: '-password' }
    );

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: storedUrlOrPath,
      user,
    });
  } catch (error) {
    console.error('Profile upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

router.get('/profile/default-options', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const dir = path.join(__dirname, '../../../public/images/default-avatars');
    if (!fs.existsSync(dir)) return res.json({ success: true, options: [] });

    const files = fs.readdirSync(dir).filter((f) => /\.(png|jpg|jpeg|gif|svg)$/i.test(f));
    const options = files
      .map((filename) => {
        const numMatch = filename.match(/AVATAR(\d+)\./i);
        const num = numMatch ? parseInt(numMatch[1], 10) : null;
        return num ? { filename, num } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.num - b.num)
      .map(({ filename, num }) => ({
        id: `default-${num}`,
        name: `Avatar ${num}`,
        previewUrl: `${baseUrl}/images/default-avatars/${encodeURIComponent(filename)}`,
      }));
    res.json({ success: true, options });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list default avatars' });
  }
});

router.get('/proxy/image', async (req, res) => {
  try {
    const target = req.query.url;
    if (!target) return res.status(400).json({ success: false, message: 'Missing url parameter' });

    let parsed;
    try {
      parsed = new URL(target);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid URL' });
    }

    const allowedHosts = ['hytrade-backend.onrender.com', 'www.hytrade-backend.onrender.com', 'localhost:3002', '127.0.0.1:3002'];
    if (config.awsS3PublicBaseUrl) {
      try {
        allowedHosts.push(new URL(config.awsS3PublicBaseUrl).host);
      } catch { /* ignore */ }
    }

    const allowedPathPrefixes = ['/uploads/profiles/', '/images/default-avatars/'];
    const isHostAllowed = allowedHosts.includes(parsed.host)
      || parsed.host.endsWith('amazonaws.com');
    const isPathAllowed = allowedPathPrefixes.some((p) => parsed.pathname.startsWith(p))
      || (parsed.host.endsWith('amazonaws.com') && parsed.pathname.includes('/profiles/'));

    if (!isHostAllowed || !isPathAllowed) {
      return res.status(403).json({ success: false, message: 'Remote image not allowed' });
    }

    if (parsed.host.endsWith('.onrender.com') && parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
    }

    const client = parsed.protocol === 'https:' ? https : http;
    client.get(parsed, (upstream) => {
      if (upstream.statusCode && upstream.statusCode >= 400) {
        res.status(upstream.statusCode).json({ success: false, message: `Upstream error ${upstream.statusCode}` });
        upstream.resume();
        return;
      }
      res.setHeader('Content-Type', upstream.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      upstream.pipe(res);
    }).on('error', () => res.status(500).json({ success: false, message: 'Failed to proxy image' }));
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
