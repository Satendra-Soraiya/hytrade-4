const mongoose = require('mongoose');
const { Wallet, LedgerEntry } = require('./wallet.model');
const { config } = require('../../config/env');
const { formatInrFromPaise } = require('../../shared/utils/money');

async function getOrCreateWallet(userId, session = null) {
  let wallet = await Wallet.findOne({ userId }).session(session || null);
  if (!wallet) {
    const created = await Wallet.create(
      [{ userId, balancePaise: 0, currency: 'INR' }],
      session ? { session } : undefined
    );
    wallet = created[0];
  }
  return wallet;
}

async function creditWallet(
  { userId, amountPaise, reason, refType = null, refId = null, metadata = {} },
  session = null
) {
  const wallet = await getOrCreateWallet(userId, session);
  wallet.balancePaise += amountPaise;
  await wallet.save(session ? { session } : undefined);

  const [entry] = await LedgerEntry.create(
    [{
      userId,
      type: 'credit',
      reason,
      amountPaise,
      balanceAfterPaise: wallet.balancePaise,
      refType,
      refId,
      metadata,
    }],
    session ? { session } : undefined
  );

  return { wallet, ledgerEntry: entry };
}

async function debitWallet(
  { userId, amountPaise, reason, refType = null, refId = null, metadata = {} },
  session = null
) {
  const wallet = await getOrCreateWallet(userId, session);
  if (wallet.balancePaise < amountPaise) {
    throw new Error(
      `Insufficient balance. Required: ₹${formatInrFromPaise(amountPaise).toFixed(2)}, Available: ₹${formatInrFromPaise(wallet.balancePaise).toFixed(2)}`
    );
  }
  wallet.balancePaise -= amountPaise;
  await wallet.save(session ? { session } : undefined);

  const [entry] = await LedgerEntry.create(
    [{
      userId,
      type: 'debit',
      reason,
      amountPaise,
      balanceAfterPaise: wallet.balancePaise,
      refType,
      refId,
      metadata,
    }],
    session ? { session } : undefined
  );

  return { wallet, ledgerEntry: entry };
}

async function linkLedgerToOrder(ledgerEntryId, orderId, session = null) {
  await LedgerEntry.findByIdAndUpdate(
    ledgerEntryId,
    { refType: 'order', refId: orderId },
    session ? { session } : undefined
  );
}

async function initializeWalletForUser(userId, session = null) {
  const startingPaise = config.startingBalanceInr * 100;
  const wallet = await getOrCreateWallet(userId, session);

  const existingBonus = await LedgerEntry.findOne({
    userId,
    reason: 'signup_bonus',
  }).session(session || null);

  if (existingBonus) return wallet;

  wallet.balancePaise = startingPaise;
  await wallet.save(session ? { session } : undefined);

  await LedgerEntry.create(
    [{
      userId,
      type: 'credit',
      reason: 'signup_bonus',
      amountPaise: startingPaise,
      balanceAfterPaise: wallet.balancePaise,
      refType: 'user',
      refId: userId,
      metadata: { note: 'Paper trading starting balance' },
    }],
    session ? { session } : undefined
  );

  return wallet;
}

async function ensureWalletForUser(userId) {
  const wallet = await getOrCreateWallet(userId);
  const hasLedger = await LedgerEntry.exists({ userId });
  if (!hasLedger) {
    await initializeWalletForUser(userId);
  }
  return getOrCreateWallet(userId);
}

async function getBalanceInr(userId) {
  const wallet = await getOrCreateWallet(userId);
  return formatInrFromPaise(wallet.balancePaise);
}

async function withOptionalTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    await session.abortTransaction();
    if (
      err.message &&
      err.message.includes('Transaction numbers are only allowed')
    ) {
      if (config.isProduction) {
        throw new Error('Database transactions are required in production but unavailable');
      }
      return fn(null);
    }
    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = {
  getOrCreateWallet,
  creditWallet,
  debitWallet,
  linkLedgerToOrder,
  initializeWalletForUser,
  ensureWalletForUser,
  getBalanceInr,
  withOptionalTransaction,
};
