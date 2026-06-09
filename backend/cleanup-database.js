#!/usr/bin/env node
/**
 * DANGER: Wipes all Hytrade v3 paper-trading data and legacy collections.
 * Development use only. Run seed:instruments after reset.
 */
require('dotenv').config();

const mongoose = require('mongoose');
const { User } = require('./src/modules/users/user.model');
const { Wallet, LedgerEntry } = require('./src/modules/wallet/wallet.model');
const { Holding, Order } = require('./src/modules/trading/holding.model');
const { Instrument, QuoteCache } = require('./src/modules/market/instrument.model');
const { Watchlist } = require('./src/modules/market/watchlist.model');
const { Session } = require('./src/modules/auth/session.model');

const LEGACY_COLLECTIONS = [
  'customholdings',
  'customorders',
  'sessions',
  'holdings',
  'orders',
  'watchlists',
];

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run cleanup in production');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI required');

  await mongoose.connect(uri);

  await Promise.all([
    User.deleteMany({}),
    Wallet.deleteMany({}),
    LedgerEntry.deleteMany({}),
    Holding.deleteMany({}),
    Order.deleteMany({}),
    Instrument.deleteMany({}),
    QuoteCache.deleteMany({}),
    Session.deleteMany({}),
    Watchlist.deleteMany({}),
  ]);

  const db = mongoose.connection.db;
  for (const name of LEGACY_COLLECTIONS) {
    const collections = await db.listCollections({ name }).toArray();
    if (collections.length > 0) {
      await db.dropCollection(name);
      console.log(`Dropped legacy collection: ${name}`);
    }
  }

  console.log('Database reset complete. Run: npm run seed:instruments');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
