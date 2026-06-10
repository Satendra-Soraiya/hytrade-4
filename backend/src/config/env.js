require('dotenv').config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return String(value).trim();
}

const nodeEnv = process.env.NODE_ENV || 'development';

const config = {
  port: parseInt(process.env.PORT || '3002', 10),
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isDevelopment: nodeEnv === 'development',

  mongodbUri: requireEnv('MONGODB_URI'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // Optional for paper trading — reference prices used when live quotes fail
  marketDataProvider: process.env.MARKET_DATA_PROVIDER || 'finnhub',
  marketDataApiKey: process.env.MARKET_DATA_API_KEY || '',
  quoteCacheTtlMs: parseInt(process.env.QUOTE_CACHE_TTL_MS || '60000', 10),

  startingBalanceInr: parseInt(process.env.STARTING_BALANCE_INR || '100000', 10),
  limitOrderBandPct: parseFloat(process.env.LIMIT_ORDER_BAND_PCT || '5'),

  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  lockoutTimeMs: parseInt(process.env.LOCKOUT_TIME || String(15 * 60 * 1000), 10),

  awsRegion: process.env.AWS_REGION || '',
  awsS3Bucket: process.env.AWS_S3_BUCKET || '',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsS3PublicBaseUrl: process.env.AWS_S3_PUBLIC_BASE_URL || '',
};

module.exports = { config, requireEnv };
