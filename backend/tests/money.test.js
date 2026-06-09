const { test } = require('node:test');
const assert = require('node:assert/strict');
const { inrToPaise, paiseToInr, formatInrFromPaise } = require('../src/shared/utils/money');

test('inrToPaise rounds correctly', () => {
  assert.equal(inrToPaise(100), 10000);
  assert.equal(inrToPaise(99.99), 9999);
});

test('paiseToInr converts back', () => {
  assert.equal(paiseToInr(10050), 100.5);
});

test('formatInrFromPaise returns 2 decimal places', () => {
  assert.equal(formatInrFromPaise(12345), 123.45);
});
