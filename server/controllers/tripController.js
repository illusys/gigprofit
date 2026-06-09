const prisma = require('../prisma/client');
const { validateIsoDate } = require('../middleware/validate');
const { logAudit } = require('../services/auditService');

function parseTrip(body) {
  if (!validateIsoDate(body.date)) {
    const err = new Error('Trip date must be YYYY-MM-DD.');
    err.status = 400;
    throw err;
  }
  const miles = Number(body.miles);
  const gross = Number(body.gross);
  if (!(miles > 0) || !(gross >= 0)) {
    const err = new Error('Trip miles must be positive and gross must be non-negative.');
    err.status = 400;
    throw err;
  }
  return {
    date: new Date(`${body.date}T12:00:00.000Z`),
    platform: String(body.platform || 'Other'),
    miles,
    hours: Number(body.hours || 0),
    gross,
    tolls: Number(body.tolls || 0),
    parking: Number(body.parking || 0),
    note: body.note || null,
  };
}

async function listTrips(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize || 25), 1), 100);
    const where = { userId: req.user.id };
    if (req.query.platform) where.platform = String(req.query.platform);
    if (req.query.search) where.OR = [{ platform: { contains: String(req.query.search), mode: 'insensitive' } }, { note: { contains: String(req.query.search), mode: 'insensitive' } }];
    if (req.query.startDate || req.query.endDate) where.date = {};
    if (req.query.startDate) where.date.gte = new Date(`${req.query.startDate}T00:00:00.000Z`);
    if (req.query.endDate) where.date.lte = new Date(`${req.query.endDate}T23:59:59.999Z`);
    const [items, total] = await Promise.all([
      prisma.trip.findMany({ where, orderBy: { date: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.trip.count({ where }),
    ]);
    res.json({ items, page, pageSize, total });
  } catch (e) { next(e); }
}

async function createTrip(req, res, next) {
  try {
    const trip = await prisma.trip.create({ data: { ...parseTrip(req.body), userId: req.user.id, createdBy: req.user.id, updatedBy: req.user.id } });
    await logAudit({ actorId: req.user.id, action: 'TRIP_CREATED', entityType: 'Trip', entityId: trip.id, ipAddress: req.ip });
    res.status(201).json({ trip });
  } catch (e) { next(e); }
}

async function updateTrip(req, res, next) {
  try {
    const existing = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) { const err = new Error('Trip not found.'); err.status = 404; throw err; }
    const trip = await prisma.trip.update({ where: { id: req.params.id }, data: { ...parseTrip(req.body), updatedBy: req.user.id } });
    await logAudit({ actorId: req.user.id, action: 'TRIP_UPDATED', entityType: 'Trip', entityId: trip.id, ipAddress: req.ip });
    res.json({ trip });
  } catch (e) { next(e); }
}

async function deleteTrip(req, res, next) {
  try {
    const existing = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) { const err = new Error('Trip not found.'); err.status = 404; throw err; }
    await prisma.trip.delete({ where: { id: req.params.id } });
    await logAudit({ actorId: req.user.id, action: 'TRIP_DELETED', entityType: 'Trip', entityId: req.params.id, ipAddress: req.ip });
    res.status(204).send();
  } catch (e) { next(e); }
}

module.exports = { listTrips, createTrip, updateTrip, deleteTrip, parseTrip };
