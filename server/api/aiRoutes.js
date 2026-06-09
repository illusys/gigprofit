const express = require('express');
const c = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');
const router = express.Router();
router.post('/coach', authenticate, requireFields(['prompt']), c.coach);
module.exports = router;
