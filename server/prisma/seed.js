const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../services/passwordService');

const prisma = new PrismaClient();

async function bootstrapSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required to bootstrap the first super admin.');
    return null;
  }

  const existingSuperAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN', status: { not: 'DELETED' } } });
  if (existingSuperAdmin) return existingSuperAdmin;

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      firstName: 'Super',
      lastName: 'Admin',
      email: email.toLowerCase(),
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      profile: {
        create: {
          vehicleSettings: {},
          preferences: {},
          notificationSettings: {},
          taxSettings: {},
        },
      },
    },
  });
  await prisma.auditLog.create({ data: { actorId: user.id, action: 'SUPER_ADMIN_BOOTSTRAPPED', entityType: 'User', entityId: user.id } });
  return user;
}

async function main() {
  await bootstrapSuperAdmin();
  await prisma.systemSetting.upsert({
    where: { key: 'taxDefaults' },
    update: {},
    create: {
      key: 'taxDefaults',
      value: { mileageRate: 0.67, selfEmploymentTaxRate: 0.153, incomeTaxRate: 0.22, seTaxMultiplier: 0.9235 },
    },
  });
  await prisma.systemSetting.upsert({
    where: { key: 'aiCoaching' },
    update: {},
    create: { key: 'aiCoaching', value: { enabled: true, model: 'claude-sonnet-4-20250514', maxTokens: 300 } },
  });
}

if (require.main === module) {
  main().finally(() => prisma.$disconnect());
}

module.exports = { bootstrapSuperAdmin, main };
