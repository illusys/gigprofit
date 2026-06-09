const prisma = require('../prisma/client');
const { hashPassword, validatePasswordStrength } = require('../services/passwordService');
const { sanitizeUser } = require('../services/authService');
const { logAudit } = require('../services/auditService');
const { upsertSetting } = require('../services/settingsService');

function assertCanManageRole(actor, role) {
  if ((role === 'ADMIN' || role === 'SUPER_ADMIN') && actor.role !== 'SUPER_ADMIN') {
    const err = new Error('Only SUPER_ADMIN can manage admin roles.');
    err.status = 403;
    throw err;
  }
}

async function metrics(req, res, next) {
  try {
    const [totalUsers, activeUsers, suspendedUsers, totalTrips, gross] = await Promise.all([
      prisma.user.count({ where: { status: { not: 'DELETED' } } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.trip.count(),
      prisma.trip.aggregate({ _sum: { gross: true } }),
    ]);
    const platformActivity = await prisma.trip.groupBy({ by: ['platform'], _count: { _all: true }, _sum: { gross: true } });
    res.json({ metrics: { totalUsers, activeUsers, suspendedUsers, totalTrips, totalRevenueTracked: gross._sum.gross || 0, totalPlatformActivity: platformActivity } });
  } catch (e) { next(e); }
}

async function listUsers(req, res, next) {
  try {
    const where = { status: { not: 'DELETED' } };
    if (req.query.role) where.role = String(req.query.role).toUpperCase();
    if (req.query.status) where.status = String(req.query.status).toUpperCase();
    if (req.query.search) where.OR = [
      { email: { contains: String(req.query.search), mode: 'insensitive' } },
      { firstName: { contains: String(req.query.search), mode: 'insensitive' } },
      { lastName: { contains: String(req.query.search), mode: 'insensitive' } },
    ];
    const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, take: 250 });
    res.json({ users: users.map(sanitizeUser) });
  } catch (e) { next(e); }
}

async function createUser(req, res, next) {
  try {
    const role = String(req.body.role || 'USER').toUpperCase();
    assertCanManageRole(req.user, role);
    const strength = validatePasswordStrength(req.body.password);
    if (!strength.valid) { const err = new Error(strength.errors.join(' ')); err.status = 400; throw err; }
    const user = await prisma.user.create({ data: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: String(req.body.email).toLowerCase(),
      phone: req.body.phone || null,
      passwordHash: await hashPassword(req.body.password),
      role,
      status: req.body.status || 'ACTIVE',
      profile: { create: { vehicleSettings: {}, preferences: {}, notificationSettings: {}, taxSettings: {} } },
    } });
    await logAudit({ actorId: req.user.id, action: 'ADMIN_USER_CREATED', entityType: 'User', entityId: user.id, ipAddress: req.ip });
    res.status(201).json({ user: sanitizeUser(user) });
  } catch (e) { next(e); }
}

async function updateUser(req, res, next) {
  try {
    const data = { firstName: req.body.firstName, lastName: req.body.lastName, phone: req.body.phone, status: req.body.status };
    if (req.body.role) { data.role = String(req.body.role).toUpperCase(); assertCanManageRole(req.user, data.role); }
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) { const err = new Error('User not found.'); err.status = 404; throw err; }
    assertCanManageRole(req.user, target.role);
    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    await logAudit({ actorId: req.user.id, action: 'ADMIN_USER_UPDATED', entityType: 'User', entityId: user.id, ipAddress: req.ip });
    res.json({ user: sanitizeUser(user) });
  } catch (e) { next(e); }
}

async function deleteUser(req, res, next) {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) { const err = new Error('User not found.'); err.status = 404; throw err; }
    assertCanManageRole(req.user, target.role);
    await prisma.user.update({ where: { id: req.params.id }, data: { status: 'DELETED' } });
    await logAudit({ actorId: req.user.id, action: 'ADMIN_USER_DELETED', entityType: 'User', entityId: req.params.id, ipAddress: req.ip });
    res.status(204).send();
  } catch (e) { next(e); }
}

async function resetUserPassword(req, res, next) {
  try {
    const strength = validatePasswordStrength(req.body.password);
    if (!strength.valid) { const err = new Error(strength.errors.join(' ')); err.status = 400; throw err; }
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    assertCanManageRole(req.user, target.role);
    await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash: await hashPassword(req.body.password) } });
    await prisma.refreshToken.updateMany({ where: { userId: req.params.id, revokedAt: null }, data: { revokedAt: new Date() } });
    await logAudit({ actorId: req.user.id, action: 'ADMIN_PASSWORD_RESET', entityType: 'User', entityId: req.params.id, ipAddress: req.ip });
    res.json({ ok: true });
  } catch (e) { next(e); }
}

async function reports(req, res, next) {
  try {
    const where = {};
    if (req.query.userId) where.userId = String(req.query.userId);
    if (req.query.type) where.reportType = String(req.query.type).toUpperCase();
    const reports = await prisma.report.findMany({ where, include: { user: true }, orderBy: { generatedDate: 'desc' }, take: 250 });
    res.json({ reports: reports.map((report) => ({ ...report, user: sanitizeUser(report.user) })) });
  } catch (e) { next(e); }
}

async function auditLogs(req, res, next) {
  try {
    const where = {};
    if (req.query.action) where.action = { contains: String(req.query.action), mode: 'insensitive' };
    if (req.query.entityType) where.entityType = String(req.query.entityType);
    const logs = await prisma.auditLog.findMany({ where, orderBy: { timestamp: 'desc' }, take: 500 });
    res.json({ logs });
  } catch (e) { next(e); }
}

async function settings(req, res, next) {
  try { res.json({ settings: await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } }) }); } catch (e) { next(e); }
}
async function updateSetting(req, res, next) {
  try { res.json({ setting: await upsertSetting(req.params.key, req.body.value, req.user.id) }); } catch (e) { next(e); }
}

module.exports = { metrics, listUsers, createUser, updateUser, deleteUser, resetUserPassword, reports, auditLogs, settings, updateSetting };
