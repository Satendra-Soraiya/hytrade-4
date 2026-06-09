const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { config } = require('./config/env');

const authRoutes = require('./modules/auth/auth.routes');
const tradingRoutes = require('./modules/trading/trading.routes');
const marketRoutes = require('./modules/market/market.routes');
const watchlistRoutes = require('./modules/market/watchlist.routes');
const profileRoutes = require('./modules/profile/profile.routes');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isProduction ? 300 : 1000,
  message: { success: false, message: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
});
app.use(generalLimiter);

const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3004',
      'http://localhost:3006',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3004',
      'http://127.0.0.1:3006',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'https://hytrade.in',
      'https://www.hytrade.in',
      'https://dashboard.hytrade.in',
    ];
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '3.0.0',
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'connected',
    message: 'Hytrade API v3.0 is running successfully!',
    server: 'Hytrade Backend API v3.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: 'MongoDB Connected',
    version: '3.0.0',
    features: [
      'JWT Authentication',
      'Indian Paper Trading (INR)',
      'Server-authoritative market quotes',
      'Wallet ledger',
      'Portfolio management',
    ],
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api', profileRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    code: 'ENDPOINT_NOT_FOUND',
  });
});

app.use((error, req, res, next) => {
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS policy violation', code: 'CORS_ERROR' });
  }
  console.error('Global error handler:', error);
  res.status(500).json({ success: false, message: 'Internal server error', code: 'INTERNAL_ERROR' });
});

module.exports = app;
