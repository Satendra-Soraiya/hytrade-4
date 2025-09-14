const express = require('express');
const router = express.Router();
const { UserModel } = require('../model/UserModel');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
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
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, profilePicture, profilePictureType } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (profilePictureType !== undefined) updateData.profilePictureType = profilePictureType;

    const user = await UserModel.findByIdAndUpdate(
      req.user.userId,
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
        name: user.name,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
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
router.post('/profile/upload', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;
    
    const user = await UserModel.findByIdAndUpdate(
      req.user.userId,
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
        name: user.name,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
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
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const defaultOptions = [
    { id: 'default-1', name: 'Alex', url: `${baseUrl}/images/default-avatars/avatar-1.svg` },
    { id: 'default-2', name: 'Sam', url: `${baseUrl}/images/default-avatars/avatar-2.svg` },
    { id: 'default-3', name: 'Jordan', url: `${baseUrl}/images/default-avatars/avatar-3.svg` },
    { id: 'default-4', name: 'Casey', url: `${baseUrl}/images/default-avatars/avatar-4.svg` },
    { id: 'default-5', name: 'Taylor', url: `${baseUrl}/images/default-avatars/avatar-5.svg` },
    { id: 'default-6', name: 'Morgan', url: `${baseUrl}/images/default-avatars/avatar-6.svg` },
    { id: 'default-7', name: 'Riley', url: `${baseUrl}/images/default-avatars/avatar-7.svg` },
    { id: 'default-8', name: 'Avery', url: `${baseUrl}/images/default-avatars/avatar-8.svg` }
  ];

  res.json({
    success: true,
    options: defaultOptions
  });
});

module.exports = router;
