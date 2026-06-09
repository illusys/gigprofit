const prisma = require('../prisma/client');
const { hashPassword, verifyPassword } = require('./passwordService');
const { validatePasswordStrength, normalizeEmail, isValidEmail } = require('./validationService');
const { signAccessToken, signRefreshToken, hashToken, verifyRefreshToken, randomToken } = require('./tokenService');
const { logAudit } = require('./auditService');
const { sendEmailVerification, sendPasswordReset } = require('./notificationService');

function assertEmail(email) {
  if (!isValidEmail(email)) {
    const err = new Error('Valid email is required.');
    err.status = 400;
    throw err;
  }
}

async function register(payload, context = {}) {
  const email = normalizeEmail(payload.email);
  assertEmail(email);
  if (payload.password !== payload.confirmPassword) {
    const err = new Error('Passwords do not match.');
    err.status = 400;
    throw err;
  }
  const strength = validatePasswordStrength(payload.password);
  if (!strength.valid) {
    const err = new Error(strength.errors.join(' '));
    err.status = 400;
    throw err;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email is already registered.');
    err.status = 409;
    throw err;
  }
  const user = await prisma.user.create({
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone || null,
      email,
      passwordHash: await hashPassword(payload.password),
      status: 'PENDING_VERIFICATION',
      role: 'USER',
      profile: { create: { vehicleSettings: {}, preferences: {}, notificationSettings: {}, taxSettings: {} } },
    },
  });
  const token = randomToken();
  await prisma.emailVerificationToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
  await sendEmailVerification(user, token);
  await logAudit({ actorId: user.id, action: 'USER_CREATED', entityType: 'User', entityId: user.id, ipAddress: context.ipAddress });
  return sanitizeUser(user);
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

async function issueSession(user, context = {}) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: hashToken(refreshToken), userAgent: context.userAgent, ipAddress: context.ipAddress, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
  return { accessToken, refreshToken, user: sanitizeUser(user) };
}

async function login(emailRaw, password, context = {}) {
  const email = normalizeEmail(emailRaw);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status === 'DELETED' || !(await verifyPassword(password, user.passwordHash))) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }
  if (user.status === 'SUSPENDED') {
    const err = new Error('Account is suspended.');
    err.status = 403;
    throw err;
  }
  const updated = await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date(), status: user.status === 'PENDING_VERIFICATION' ? 'ACTIVE' : user.status } });
  await logAudit({ actorId: updated.id, action: 'USER_LOGIN', entityType: 'User', entityId: updated.id, ipAddress: context.ipAddress });
  return issueSession(updated, context);
}

async function refresh(refreshToken, context = {}) {
  const decoded = verifyRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(refreshToken) }, include: { user: true } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.user.status !== 'ACTIVE') {
    const err = new Error('Invalid refresh token.');
    err.status = 401;
    throw err;
  }
  if (decoded.sub !== stored.userId) throw new Error('Token subject mismatch.');
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  return issueSession(stored.user, context);
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
}

async function logoutAll(userId) {
  await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}

async function requestPasswordReset(emailRaw, context = {}) {
  const email = normalizeEmail(emailRaw);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: true };
  const token = randomToken();
  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
  await sendPasswordReset(user, token);
  await logAudit({ actorId: user.id, action: 'PASSWORD_RESET_REQUESTED', entityType: 'User', entityId: user.id, ipAddress: context.ipAddress });
  return { ok: true };
}

async function resetPassword(token, password, context = {}) {
  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    const err = new Error(strength.errors.join(' '));
    err.status = 400;
    throw err;
  }
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    const err = new Error('Invalid or expired reset token.');
    err.status = 400;
    throw err;
  }
  await prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await hashPassword(password), status: 'ACTIVE' } });
  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  await logoutAll(record.userId);
  await logAudit({ actorId: record.userId, action: 'PASSWORD_RESET', entityType: 'User', entityId: record.userId, ipAddress: context.ipAddress });
  return { ok: true };
}

async function changePassword(user, currentPassword, nextPassword, context = {}) {
  const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!(await verifyPassword(currentPassword, fullUser.passwordHash))) {
    const err = new Error('Current password is incorrect.');
    err.status = 400;
    throw err;
  }
  const strength = validatePasswordStrength(nextPassword);
  if (!strength.valid) {
    const err = new Error(strength.errors.join(' '));
    err.status = 400;
    throw err;
  }
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(nextPassword) } });
  await logAudit({ actorId: user.id, action: 'PASSWORD_CHANGE', entityType: 'User', entityId: user.id, ipAddress: context.ipAddress });
  return { ok: true };
}

module.exports = { register, login, refresh, logout, logoutAll, requestPasswordReset, resetPassword, changePassword, sanitizeUser, normalizeEmail, assertEmail };
