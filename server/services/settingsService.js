const prisma = require('../prisma/client');

const DEFAULT_TAX_SETTINGS = {
  mileageRate: 0.67,
  selfEmploymentTaxRate: 0.153,
  incomeTaxRate: 0.22,
  seTaxMultiplier: 0.9235,
};

async function getTaxDefaults() {
  const setting = await prisma.systemSetting.findUnique({ where: { key: 'taxDefaults' } });
  return { ...DEFAULT_TAX_SETTINGS, ...(setting?.value || {}) };
}

async function upsertSetting(key, value, updatedBy) {
  return prisma.systemSetting.upsert({
    where: { key },
    update: { value, updatedBy },
    create: { key, value, updatedBy },
  });
}

module.exports = { DEFAULT_TAX_SETTINGS, getTaxDefaults, upsertSetting };
