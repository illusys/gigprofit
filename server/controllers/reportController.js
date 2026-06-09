const prisma = require('../prisma/client');
const { computeStats, getPeriodDateRange, defaultVehicle } = require('../services/profitService');
const { getTaxDefaults } = require('../services/settingsService');
const { logAudit } = require('../services/auditService');

function reportType(input) {
  const type = String(input || 'WEEKLY').toUpperCase();
  return ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(type) ? type : 'WEEKLY';
}

async function generateReportForUser(userId, type) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  const { start, end } = getPeriodDateRange(type);
  const trips = await prisma.trip.findMany({ where: { userId, date: { gte: start, lte: end } } });
  const taxDefaults = await getTaxDefaults();
  const data = computeStats(trips, { ...defaultVehicle, ...(user?.profile?.vehicleSettings || {}) }, type, { ...taxDefaults, ...(user?.profile?.taxSettings || {}) });
  return prisma.report.create({ data: { userId, reportType: type, jsonData: data } });
}

async function listReports(req, res, next) {
  try {
    const where = { userId: req.user.id };
    if (req.query.type) where.reportType = reportType(req.query.type);
    const reports = await prisma.report.findMany({ where, orderBy: { generatedDate: 'desc' }, take: 100 });
    res.json({ reports });
  } catch (e) { next(e); }
}

async function generateReport(req, res, next) {
  try {
    const type = reportType(req.body.reportType || req.query.type);
    const report = await generateReportForUser(req.user.id, type);
    await logAudit({ actorId: req.user.id, action: 'REPORT_GENERATED', entityType: 'Report', entityId: report.reportId, ipAddress: req.ip });
    res.status(201).json({ report });
  } catch (e) { next(e); }
}

async function exportReport(req, res, next) {
  try {
    const report = await prisma.report.findFirst({ where: { reportId: req.params.id, userId: req.user.id } });
    if (!report) { const err = new Error('Report not found.'); err.status = 404; throw err; }
    const format = String(req.query.format || 'json').toLowerCase();
    await logAudit({ actorId: req.user.id, action: 'REPORT_EXPORTED', entityType: 'Report', entityId: report.reportId, ipAddress: req.ip, metadata: { format } });
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="gigprofit-${report.reportType.toLowerCase()}-${report.reportId}.csv"`);
      return res.send(`metric,value\ngross,${report.jsonData.gross}\ncost,${report.jsonData.cost}\nnet,${report.jsonData.net}\ntrips,${report.jsonData.totalTrips}\n`);
    }
    if (format === 'xlsx' || format === 'pdf') {
      res.setHeader('Content-Type', 'application/json');
      return res.json({ report, message: `${format.toUpperCase()} export is queued; JSON payload returned by this scaffold.` });
    }
    return res.json({ report });
  } catch (e) { next(e); }
}

module.exports = { listReports, generateReport, exportReport, generateReportForUser, reportType };
