const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function requireSecret(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    requireSecret('JWT_SECRET'),
    { expiresIn: process.env.JWT_ACCESS_TTL || '15m' }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, tokenType: 'refresh' },
    requireSecret('JWT_REFRESH_SECRET'),
    { expiresIn: process.env.JWT_REFRESH_TTL || '30d' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, requireSecret('JWT_SECRET'));
}

function verifyRefreshToken(token) {
  return jwt.verify(token, requireSecret('JWT_REFRESH_SECRET'));
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, hashToken, randomToken };
