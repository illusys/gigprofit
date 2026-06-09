const prisma = require('../prisma/client');
const { sanitizeUser } = require('../services/authService');
const { logAudit } = require('../services/auditService');

async function updateProfile(req, res, next) {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName: req.body.firstName, lastName: req.body.lastName, phone: req.body.phone },
      include: { profile: true },
    });
    await logAudit({ actorId: req.user.id, action: 'PROFILE_UPDATED', entityType: 'User', entityId: req.user.id, ipAddress: req.ip });
    res.json({ user: sanitizeUser(user) });
  } catch (e) { next(e); }
}

async function updateProfileSettings(req, res, next) {
  try {
    const profile = await prisma.userProfile.upsert({
      where: { userId: req.user.id },
      update: {
        avatarUrl: req.body.avatarUrl,
        vehicleSettings: req.body.vehicleSettings || req.user.profile?.vehicleSettings || {},
        preferences: req.body.preferences || req.user.profile?.preferences || {},
        notificationSettings: req.body.notificationSettings || req.user.profile?.notificationSettings || {},
        taxSettings: req.body.taxSettings || req.user.profile?.taxSettings || {},
      },
      create: {
        userId: req.user.id,
        avatarUrl: req.body.avatarUrl,
        vehicleSettings: req.body.vehicleSettings || {},
        preferences: req.body.preferences || {},
        notificationSettings: req.body.notificationSettings || {},
        taxSettings: req.body.taxSettings || {},
      },
    });
    await logAudit({ actorId: req.user.id, action: 'PROFILE_SETTINGS_UPDATED', entityType: 'UserProfile', entityId: profile.id, ipAddress: req.ip });
    res.json({ profile });
  } catch (e) { next(e); }
}

module.exports = { updateProfile, updateProfileSettings };
