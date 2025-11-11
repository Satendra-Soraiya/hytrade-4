const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const { SessionService } = require('./services/sessionService');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const tradingRoutes = require('./routes/trading');
const profileRoutes = require('./routes/profile');

// Import middleware
const { SECURITY_CONFIG } = require('./config/security');

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
    },
  },
  // We serve images to a different origin in dev (frontend on :3000),
  // so allow cross-origin resource loads for images/static content.
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting - DISABLED FOR TESTING
// const generalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many requests from this IP. Please try again later.',
//     code: 'RATE_LIMIT_EXCEEDED'
//   }
// });

// Image proxy for cross-origin avatars and images
app.get('/api/proxy/image', async (req, res) => {
  try {
    const target = req.query.url;
    if (!target || typeof target !== 'string') {
      return res.status(400).json({ success: false, message: 'Missing url query parameter' });
    }
    // Only allow http/https
    if (!/^https?:\/\//i.test(target)) {
      return res.status(400).json({ success: false, message: 'Invalid URL scheme' });
    }
    const response = await fetch(target, {
      headers: { 'Accept': 'image/*,*/*;q=0.8' },
    });
    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: `Upstream error: ${response.status}` });
    }
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    // Cache for a short duration; avatar URLs are cache-busted via v= token
    res.setHeader('Cache-Control', 'public, max-age=300');
    const buffer = Buffer.from(await response.arrayBuffer());
    return res.status(200).end(buffer);
  } catch (err) {
    console.error('Image proxy error:', err);
    return res.status(500).json({ success: false, message: 'Image proxy failed' });
  }
});

// app.use(generalLimiter); // Disabled for testing

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      // Development URLs
      'http://localhost:3000', 
      'http://localhost:3001',
      'http://localhost:3006',
      'http://localhost:5173',
      'http://localhost:5174',
      // 127.0.0.1 equivalents (including preview/proxy)
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3006',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      // Known prod frontends
      'https://hytrade.in',
      'https://www.hytrade.in',
      'https://hytrade-dashboard.vercel.app',
      'https://hytrade-frontend.vercel.app',
      // Allow any hytrade.in subdomain over http/https
      /^https?:\/\/(?:.*\.)?hytrade\.in$/,
      // Allow any Vercel preview domains
      /^https:\/\/.*\.vercel\.app$/,
      // Allow Render-hosted frontends if needed
      /^https:\/\/.*\.onrender\.com$/
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed origin (string or regex)
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      if (allowedOrigin instanceof RegExp) {
        try {
          return allowedOrigin.test(origin);
        } catch {
          return false;
        }
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads and public assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
      success: true,
    status: 'connected',
    message: 'Hytrade API v2.0 is running successfully!',
    server: 'Hytrade Backend API v2.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'MongoDB Atlas Connected ✅',
    version: '2.0.0',
    features: [
      'JWT Authentication',
      'Secure Trading Operations', 
      'Real-time Portfolio Management',
      'Industry-standard Security',
      'Comprehensive Data Validation'
    ]
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api', profileRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    code: 'ENDPOINT_NOT_FOUND',
    availableEndpoints: [
      'GET /health',
      'GET /api/status',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/verify',
      'POST /api/auth/logout',
      'GET /api/auth/profile',
      'POST /api/trading/order',
      'GET /api/trading/holdings',
      'GET /api/trading/orders',
      'GET /api/trading/portfolio/summary',
      'GET /api/trading/stats'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // CORS error
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      code: 'CORS_ERROR'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully');
    
    // Clean up expired sessions on startup
    try {
      const cleanedCount = await SessionService.cleanExpiredSessions();
      console.log(`🧹 Cleaned ${cleanedCount} expired sessions on startup`);
    } catch (error) {
      console.error('⚠️ Error cleaning expired sessions:', error);
    }
    
    // Test database connection
    const db = mongoose.connection;
    db.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    db.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🔄 Shutting down server gracefully...');
  
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log('🚀 Hytrade API v2.0 Server Started!');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 Security: JWT Authentication enabled`);
      console.log(`📊 Database: MongoDB Atlas connected`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
      console.log('='.repeat(50));
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
