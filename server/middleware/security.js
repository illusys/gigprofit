const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

function securityMiddleware() {
  const origins = (process.env.CORS_ORIGINS || '').split(',').map((x) => x.trim()).filter(Boolean);
  // When deployed on Vercel (same domain), CORS_ORIGINS can be empty — allow all.
  return [
    helmet({ crossOriginOpenerPolicy: false }),
    cors({ origin: origins.length ? origins : true, credentials: true }),
    rateLimit({ windowMs: 15 * 60 * 1000, limit: Number(process.env.RATE_LIMIT || 300), standardHeaders: true, legacyHeaders: false }),
    morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'),
  ];
}

module.exports = { securityMiddleware };
