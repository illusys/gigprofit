// Vercel serverless entry point — wraps the Express app.
// Handles all requests to /api/* on gigsprofit.com.
const app = require('../server/index.js');
module.exports = app;
