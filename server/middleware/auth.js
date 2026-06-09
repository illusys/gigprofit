const prisma = require('../prisma/client');
const { verifyAccessToken } = require('../services/tokenService');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      const err = new Error('Authentication required.');
      err.status = 401;
      throw err;
    }
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub }, include: { profile: true } });
    if (!user || user.status !== 'ACTIVE') {
      const err = new Error('User is not active.');
      err.status = 401;
      throw err;
    }
    req.user = user;
    next();
  } catch (error) {
    error.status = error.status || 401;
    next(error);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const err = new Error('Insufficient permissions.');
      err.status = 403;
      return next(err);
    }
    return next();
  };
}

function requireAdmin(req, res, next) {
  return requireRole('SUPER_ADMIN', 'ADMIN')(req, res, next);
}

function requireSuperAdmin(req, res, next) {
  return requireRole('SUPER_ADMIN')(req, res, next);
}

module.exports = { authenticate, requireRole, requireAdmin, requireSuperAdmin };
