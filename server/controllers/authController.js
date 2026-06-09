const authService = require('../services/authService');

const context = (req) => ({ ipAddress: req.ip, userAgent: req.headers['user-agent'] });

async function register(req, res, next) { try { res.status(201).json({ user: await authService.register(req.body, context(req)) }); } catch (e) { next(e); } }
async function login(req, res, next) { try { res.json(await authService.login(req.body.email, req.body.password, context(req))); } catch (e) { next(e); } }
async function refresh(req, res, next) { try { res.json(await authService.refresh(req.body.refreshToken, context(req))); } catch (e) { next(e); } }
async function logout(req, res, next) { try { await authService.logout(req.body.refreshToken); res.status(204).send(); } catch (e) { next(e); } }
async function logoutAll(req, res, next) { try { await authService.logoutAll(req.user.id); res.status(204).send(); } catch (e) { next(e); } }
async function forgotPassword(req, res, next) { try { res.json(await authService.requestPasswordReset(req.body.email, context(req))); } catch (e) { next(e); } }
async function resetPassword(req, res, next) { try { res.json(await authService.resetPassword(req.body.token, req.body.password, context(req))); } catch (e) { next(e); } }
async function changePassword(req, res, next) { try { res.json(await authService.changePassword(req.user, req.body.currentPassword, req.body.nextPassword, context(req))); } catch (e) { next(e); } }
async function me(req, res) { res.json({ user: authService.sanitizeUser(req.user) }); }

module.exports = { register, login, refresh, logout, logoutAll, forgotPassword, resetPassword, changePassword, me };
