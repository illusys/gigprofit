const express = require('express');
const c = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
router.use(authenticate);
router.put('/', c.updateProfile);
router.put('/settings', c.updateProfileSettings);
module.exports = router;
