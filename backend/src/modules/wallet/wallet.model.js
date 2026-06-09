const { Schema, model } = require('mongoose');

const WalletSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balancePaise: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'INR', enum: ['INR'] },
  },
  { timestamps: true, collection: 'wallets' }
);

const LedgerEntrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    reason: {
      type: String,
      enum: ['signup_bonus', 'deposit', 'buy', 'sell', 'adjustment'],
      required: true,
    },
    amountPaise: { type: Number, required: true, min: 1 },
    balanceAfterPaise: { type: Number, required: true },
    refType: { type: String, default: null },
    refId: { type: Schema.Types.ObjectId, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: 'ledger_entries' }
);

const Wallet = model('Wallet', WalletSchema);
const LedgerEntry = model('LedgerEntry', LedgerEntrySchema);

module.exports = { Wallet, LedgerEntry };
