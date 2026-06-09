const { PrismaClient } = require('@prisma/client');

const prisma = global.__gigprofitPrisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__gigprofitPrisma = prisma;

module.exports = prisma;
