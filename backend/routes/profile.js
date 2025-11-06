const express = require('express');
const router = express.Router();
const { CustomUserModel } = require('../model/CustomUserModel');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Use centralized auth middleware that attaches req.user

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await CustomUserModel.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        profilePictureType: user.profilePictureType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, profilePicture, profilePictureType } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (profilePictureType !== undefined) updateData.profilePictureType = profilePictureType;

    const user = await CustomUserModel.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        profilePictureType: user.profilePictureType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Upload custom profile picture
router.post('/profile/upload', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;
    
    const user = await CustomUserModel.findByIdAndUpdate(
      req.user.id,
      {
        profilePicture: fileUrl,
        profilePictureType: 'custom',
        updatedAt: new Date()
      },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: fileUrl,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        profilePictureType: user.profilePictureType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Test endpoint to check if uploads are working
router.get('/profile/test-upload', (req, res) => {
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, '../uploads/profiles');
  
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const files = fs.readdirSync(uploadsDir);
    res.json({
      success: true,
      uploadsDir: uploadsDir,
      files: files,
      message: 'Uploads directory is accessible'
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      message: 'Error accessing uploads directory'
    });
  }
});

// Get default profile picture options
router.get('/profile/default-options', (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const dir = path.join(__dirname, '../public/images/default-avatars');
    if (!fs.existsSync(dir)) {
      return res.json({ success: true, options: [] });
    }

    const files = fs.readdirSync(dir)
      .filter(f => /\.(png|jpg|jpeg|gif|svg)$/i.test(f))
      .sort((a, b) => a.localeCompare(b));

    const options = files.map((filename, idx) => {
      const name = filename.replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/avatar/i, '')
        .trim() || `Avatar ${idx + 1}`;
      return {
        id: `default-${idx + 1}`,
        name,
        url: `${baseUrl}/images/default-avatars/${encodeURIComponent(filename)}`
      };
    });

    res.json({ success: true, options });
  } catch (error) {
    console.error('Default options error:', error);
    res.status(500).json({ success: false, message: 'Failed to list default avatars' });
  }
});

// Proxy remote images to avoid cross-origin resource policy blocks in dev
router.get('/proxy/image', async (req, res) => {
  try {
    const target = req.query.url;
    if (!target) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      return res.status(400).json({ success: false, message: 'Missing url parameter' });
    }

    let parsed;
    try {
      parsed = new URL(target);
    } catch (e) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      return res.status(400).json({ success: false, message: 'Invalid URL' });
    }

    // Allowlist remote hosts and paths we expect
    const allowedHosts = [
      'hytrade-backend.onrender.com',
      'www.hytrade-backend.onrender.com'
    ];
    const allowedPathPrefixes = ['/uploads/profiles/', '/images/default-avatars/'];
    const isHostAllowed = allowedHosts.includes(parsed.host);
    const isPathAllowed = allowedPathPrefixes.some(prefix => parsed.pathname.startsWith(prefix));
    if (!isHostAllowed || !isPathAllowed) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      return res.status(403).json({ success: false, message: 'Remote image not allowed' });
    }

    // Upgrade to https for onrender to avoid mixed-content issues
    if (parsed.host.endsWith('.onrender.com') && parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
    }

    const client = parsed.protocol === 'https:' ? https : http;

    const tryFetch = (urlObj, retryOnDefault = true) => {
      const protoClient = urlObj.protocol === 'https:' ? https : http;
      protoClient.get(urlObj, (upstream) => {
        if (upstream.statusCode && upstream.statusCode >= 400) {
          // If 404 and a default avatar path with out-of-range index, clamp and retry once
          if (retryOnDefault && upstream.statusCode === 404) {
            const m = urlObj.pathname.match(/\/images\/default-avatars\/AVATAR(\d+)\.jpe?g$/i);
            if (m) {
              const MAX_DEFAULTS = 12;
              let n = parseInt(m[1], 10);
              if (!Number.isFinite(n) || n < 1) n = 1;
              if (n > MAX_DEFAULTS) n = ((n - 1) % MAX_DEFAULTS) + 1;
              urlObj.pathname = urlObj.pathname.replace(/AVATAR\d+\.jpe?g$/i, `AVATAR${n}.jpeg`);
              return tryFetch(urlObj, false);
            }
          }
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
          res.status(upstream.statusCode).json({ success: false, message: `Upstream error ${upstream.statusCode}` });
          upstream.resume();
          return;
        }
        const contentType = upstream.headers['content-type'] || 'image/jpeg';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        // Allow cross-origin embedding
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        upstream.pipe(res);
      }).on('error', (err) => {
        console.error('Image proxy error:', err);
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.status(500).json({ success: false, message: 'Failed to proxy image' });
      });
    };

    tryFetch(parsed, true);
  } catch (error) {
    console.error('Proxy image handler error:', error);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
