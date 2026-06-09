const express = require('express');
const c = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);
router.get('/', c.listReports);
router.post('/generate', c.generateReport);
router.get('/:id/export', c.exportReport);
module.exports = router;
