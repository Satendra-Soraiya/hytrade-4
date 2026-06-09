const app = require('./app');
const { config } = require('./config/env');
const { connectDB } = require('./shared/db/connection');
const { SessionService } = require('./modules/auth/session.service');
const { startQuoteRefreshJob } = require('./modules/market/market-data.service');

async function startServer() {
  await connectDB();

  try {
    const cleaned = await SessionService.cleanExpiredSessions();
    console.log(`Cleaned ${cleaned} expired sessions on startup`);
  } catch (err) {
    console.warn('Session cleanup warning:', err.message);
  }

  startQuoteRefreshJob();

  const server = app.listen(config.port, () => {
    console.log(`Hytrade API v3.0 running on port ${config.port} (${config.nodeEnv})`);
  });

  const shutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
