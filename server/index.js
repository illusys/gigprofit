require('dotenv').config();
const express = require('express');
const authRoutes = require('./api/authRoutes');
const tripRoutes = require('./api/tripRoutes');
const reportRoutes = require('./api/reportRoutes');
const profileRoutes = require('./api/profileRoutes');
const adminRoutes = require('./api/adminRoutes');
const aiRoutes = require('./api/aiRoutes');
const { securityMiddleware } = require('./middleware/security');
const { csrfProtection } = require('./middleware/csrf');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { bootstrapSuperAdmin } = require('./prisma/seed');

const app = express();
app.set('trust proxy', 1);
app.use(securityMiddleware());
app.use(express.json({ limit: '1mb' }));
app.use(csrfProtection);

// Prevent browser caching of API responses so new data is always fetched
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.get('/health', (req, res) => res.json({ ok: true, service: 'gigprofit-api' }));
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'gigprofit-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use(notFound);
app.use(errorHandler);

// Standalone server mode (local dev / Render fallback)
if (require.main === module) {
  bootstrapSuperAdmin()
    .then(() => {
      const port = Number(process.env.PORT || 4000);
      app.listen(port, () => console.log(`GigProfit API listening on :${port}`));
    })
    .catch((error) => { console.error(error); process.exit(1); });
}

// Vercel serverless: bootstrapSuperAdmin on first cold start
bootstrapSuperAdmin().catch((e) => console.warn('Bootstrap skipped:', e.message));

module.exports = app;
