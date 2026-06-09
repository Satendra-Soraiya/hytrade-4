#!/usr/bin/env node
/**
 * Migrates legacy Custom* collections to v2 schema.
 * Usage: node scripts/migrate-v1-to-v2.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../src/modules/users/user.model');
const { Wallet, LedgerEntry } = require('../src/modules/wallet/wallet.model');
const { Holding, Order } = require('../src/modules/trading/holding.model');
const { inrToPaise } = require('../src/shared/utils/money');
const { config } = require('../src/config/env');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const legacyUsers = mongoose.connection.collection('users');
  const legacyHoldings = mongoose.connection.collection('customholdings');
  const legacyOrders = mongoose.connection.collection('customorders');

  const users = await legacyUsers.find({}).toArray();
  console.log(`Found ${users.length} legacy users`);

  for (const u of users) {
    const email = (u.email || '').toLowerCase();
    if (!email) continue;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName: u.firstName || 'User',
        lastName: u.lastName || '',
        email,
        password: u.password || await bcrypt.hash('ChangeMe123!', 12),
        tradingExperience: u.tradingExperience || 'Beginner',
        riskTolerance: u.riskTolerance || 'Medium',
        profilePicture: u.profilePicture || 'default-1',
        profilePictureType: u.profilePictureType || 'default',
        totalInvestmentPaise: inrToPaise(u.totalInvestment || 0),
        totalPnLPaise: inrToPaise(u.totalPnL || 0),
        isActive: u.isActive !== false,
        isVerified: !!u.isVerified,
        lastLoginAt: u.lastLoginAt || new Date(),
        createdAt: u.createdAt || new Date(),
      });
    }

    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      const balancePaise = inrToPaise(u.accountBalance ?? config.startingBalanceInr);
      wallet = await Wallet.create({ userId: user._id, balancePaise, currency: 'INR' });
      await LedgerEntry.create({
        userId: user._id,
        type: 'credit',
        reason: 'adjustment',
        amountPaise: balancePaise,
        balanceAfterPaise: balancePaise,
        refType: 'migration',
        metadata: { note: 'Migrated from v1 accountBalance' },
      });
    }
  }

  const holdings = await legacyHoldings.find({}).toArray();
  console.log(`Migrating ${holdings.length} holdings`);
  for (const h of holdings) {
    const user = await User.findById(h.userId);
    if (!user) continue;

    await Holding.findOneAndUpdate(
      { userId: user._id, symbol: (h.stockSymbol || '').toUpperCase() },
      {
        userId: user._id,
        symbol: (h.stockSymbol || '').toUpperCase(),
        stockName: h.stockName || h.stockSymbol,
        qty: h.quantity || 0,
        avgPricePaise: inrToPaise(h.averagePrice || 0),
        investedPaise: inrToPaise(h.totalInvestment || 0),
        purchaseDate: h.purchaseDate || new Date(),
        lastUpdated: h.lastUpdated || new Date(),
      },
      { upsert: true }
    );
  }

  const orders = await legacyOrders.find({}).toArray();
  console.log(`Migrating ${orders.length} orders`);
  for (const o of orders) {
    const user = await User.findById(o.userId);
    if (!user) continue;

    const exists = await Order.findOne({
      userId: user._id,
      symbol: (o.stockSymbol || '').toUpperCase(),
      orderDate: o.orderDate,
      quantity: o.quantity,
      orderType: o.orderType,
    });
    if (exists) continue;

    await Order.create({
      userId: user._id,
      symbol: (o.stockSymbol || '').toUpperCase(),
      stockName: o.stockName || o.stockSymbol,
      orderType: o.orderType,
      quantity: o.quantity,
      requestedPricePaise: inrToPaise(o.price || 0),
      executedPricePaise: inrToPaise(o.price || 0),
      totalAmountPaise: inrToPaise(o.totalAmount || (o.price * o.quantity)),
      orderMode: o.orderMode || 'MARKET',
      orderStatus: o.orderStatus || 'COMPLETED',
      profitLossPaise: o.profitLoss != null ? inrToPaise(o.profitLoss) : null,
      profitLossPercentage: o.profitLossPercentage,
      orderDate: o.orderDate || new Date(),
      executedAt: o.executedAt || o.orderDate || new Date(),
    });
  }

  console.log('Migration complete');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
