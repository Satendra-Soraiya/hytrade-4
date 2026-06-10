#!/usr/bin/env node
/**
 * Seeds NSE instruments for paper trading.
 * Usage: node scripts/seed-instruments.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { Instrument } = require('../src/modules/market/instrument.model');

const NSE_INSTRUMENTS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy', referencePriceInr: 1285 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'IT', referencePriceInr: 4050 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Finance', referencePriceInr: 1720 },
  { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT', referencePriceInr: 1820 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Finance', referencePriceInr: 1280 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'Consumer', referencePriceInr: 2380 },
  { symbol: 'ITC', name: 'ITC Ltd', sector: 'Consumer', referencePriceInr: 465 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Finance', referencePriceInr: 820 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom', referencePriceInr: 1580 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', sector: 'Finance', referencePriceInr: 1780 },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', sector: 'Industrial', referencePriceInr: 3580 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Finance', referencePriceInr: 1120 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Materials', referencePriceInr: 2280 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', sector: 'Auto', referencePriceInr: 12400 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Healthcare', referencePriceInr: 1780 },
  { symbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Consumer', referencePriceInr: 3380 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'Finance', referencePriceInr: 7200 },
  { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT', referencePriceInr: 480 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', sector: 'Materials', referencePriceInr: 11800 },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', sector: 'Consumer', referencePriceInr: 2280 },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'IT', referencePriceInr: 1680 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd', sector: 'Utilities', referencePriceInr: 320 },
  { symbol: 'NTPC', name: 'NTPC Ltd', sector: 'Utilities', referencePriceInr: 380 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Auto', referencePriceInr: 780 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', sector: 'Auto', referencePriceInr: 2950 },
];

async function seedInstruments() {
  let upserted = 0;

  for (const item of NSE_INSTRUMENTS) {
    await Instrument.findOneAndUpdate(
      { symbol: item.symbol, exchange: 'NSE' },
      {
        symbol: item.symbol,
        name: item.name,
        exchange: 'NSE',
        sector: item.sector,
        isTradable: true,
        lotSize: 1,
        providerSymbol: `${item.symbol}.NS`,
        referencePricePaise: Math.round(item.referencePriceInr * 100),
      },
      { upsert: true, new: true }
    );
    upserted += 1;
  }

  return upserted;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI required');

  await mongoose.connect(uri);
  const upserted = await seedInstruments();
  console.log(`Seeded ${upserted} NSE instruments`);
  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { NSE_INSTRUMENTS, seedInstruments };
