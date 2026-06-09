const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/hytrade-test';
process.env.MARKET_DATA_PROVIDER = 'finnhub';
process.env.MARKET_DATA_API_KEY = 'test-key';

const { validatePasswordStrength, generateJWT, verifyJWT } = require('../src/config/security');

test('validatePasswordStrength rejects weak passwords', () => {
  const weak = validatePasswordStrength('short');
  assert.equal(weak.isValid, false);
  assert.ok(weak.errors.length > 0);
});

test('validatePasswordStrength accepts strong passwords', () => {
  const strong = validatePasswordStrength('StrongPass1!');
  assert.equal(strong.isValid, true);
});

test('JWT sign and verify roundtrip', () => {
  const token = generateJWT({ userId: 'abc', email: 'a@b.com', role: 'user' });
  const decoded = verifyJWT(token);
  assert.equal(decoded.email, 'a@b.com');
});
