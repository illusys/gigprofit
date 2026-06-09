const prisma = require('../prisma/client');

async function logAudit({ actorId, action, entityType, entityId, ipAddress, metadata }) {
  return prisma.auditLog.create({
    data: {
      actorId: actorId || null,
      action,
      entityType,
      entityId: entityId || null,
      ipAddress: ipAddress || null,
      metadata: metadata || {},
    },
  });
}

module.exports = { logAudit };
