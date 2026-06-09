const express = require('express');
const c = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

const router = express.Router();
router.post('/register', requireFields(['firstName', 'lastName', 'email', 'password', 'confirmPassword']), c.register);
router.post('/login', requireFields(['email', 'password']), c.login);
router.post('/refresh', requireFields(['refreshToken']), c.refresh);
router.post('/logout', c.logout);
router.post('/forgot-password', requireFields(['email']), c.forgotPassword);
router.post('/reset-password', requireFields(['token', 'password']), c.resetPassword);
router.get('/me', authenticate, c.me);
router.post('/change-password', authenticate, requireFields(['currentPassword', 'nextPassword']), c.changePassword);
router.post('/logout-all', authenticate, c.logoutAll);
module.exports = router;
