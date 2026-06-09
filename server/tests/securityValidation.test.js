const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePasswordStrength, normalizeEmail, isValidEmail, isValidIsoDate, canManageRole } = require('../services/validationService');

test('auth validation enforces strong passwords and email normalization', () => {
  assert.equal(validatePasswordStrength('weak').valid, false);
  assert.equal(validatePasswordStrength('VeryStrong!234').valid, true);
  assert.equal(normalizeEmail('  USER@Example.COM '), 'user@example.com');
  assert.equal(isValidEmail('user@example.com'), true);
  assert.equal(isValidEmail('bad-email'), false);
});

test('authorization validation limits admin role management to super admins', () => {
  assert.equal(canManageRole('ADMIN', 'USER'), true);
  assert.equal(canManageRole('ADMIN', 'ADMIN'), false);
  assert.equal(canManageRole('SUPER_ADMIN', 'ADMIN'), true);
});

test('date validation accepts only valid ISO calendar dates', () => {
  assert.equal(isValidIsoDate('2026-06-09'), true);
  assert.equal(isValidIsoDate('2026-02-30'), false);
  assert.equal(isValidIsoDate('06/09/2026'), false);
});
