const defaultVehicle = {
  mpg: 28,
  fuelPrice: 3.45,
  deprecPerMile: 0.08,
  insuranceMonthly: 140,
  maintenancePerMile: 0.04,
  tirePerMile: 0.012,
  oilChangeInterval: 5000,
  oilChangeCost: 65,
  loanMonthly: 0,
};

const defaultTax = {
  mileageRate: 0.67,
  selfEmploymentTaxRate: 0.153,
  incomeTaxRate: 0.22,
  seTaxMultiplier: 0.9235,
};

function tripCost(trip, vehicle = defaultVehicle) {
  const v = { ...defaultVehicle, ...(vehicle || {}) };
  const miles = Number(trip.miles || 0);
  const fuel = v.mpg > 0 ? (miles / v.mpg) * v.fuelPrice : 0;
  const dep = miles * v.deprecPerMile;
  const maint = miles * v.maintenancePerMile;
  const tire = miles * v.tirePerMile;
  const oil = v.oilChangeInterval > 0 ? (miles / v.oilChangeInterval) * v.oilChangeCost : 0;
  const ins = (v.insuranceMonthly / 3500) * miles;
  const loan = (v.loanMonthly / 3500) * miles;
  const tolls = Number(trip.tolls || 0);
  const parking = Number(trip.parking || 0);
  return { fuel, dep, maint, tire, oil, ins, loan, tolls, parking };
}

function totalCost(cost) {
  return ['fuel', 'dep', 'maint', 'tire', 'oil', 'ins', 'loan', 'tolls', 'parking'].reduce((sum, key) => sum + Number(cost[key] || 0), 0);
}

function getPeriodDateRange(reportType, anchorDate = new Date()) {
  const end = new Date(anchorDate);
  const start = new Date(anchorDate);
  if (reportType === 'DAILY') start.setDate(end.getDate() - 1);
  else if (reportType === 'WEEKLY') start.setDate(end.getDate() - 7);
  else if (reportType === 'MONTHLY') start.setDate(end.getDate() - 30);
  else start.setDate(end.getDate() - 365);
  return { start, end };
}

function computeStats(trips, vehicle, period = 'WEEKLY', taxSettings = defaultTax) {
  const gross = trips.reduce((sum, trip) => sum + Number(trip.gross || 0), 0);
  const miles = trips.reduce((sum, trip) => sum + Number(trip.miles || 0), 0);
  const hours = trips.reduce((sum, trip) => sum + Number(trip.hours || 0), 0);
  const expenses = { fuel: 0, dep: 0, maint: 0, tire: 0, oil: 0, ins: 0, loan: 0, tolls: 0, parking: 0 };
  const byPlatform = {};
  const byDay = {};

  trips.forEach((trip) => {
    const c = tripCost(trip, vehicle);
    const cost = totalCost(c);
    Object.keys(expenses).forEach((key) => { expenses[key] += c[key] || 0; });
    if (!byPlatform[trip.platform]) byPlatform[trip.platform] = { gross: 0, cost: 0, trips: 0, miles: 0, hours: 0 };
    byPlatform[trip.platform].gross += Number(trip.gross || 0);
    byPlatform[trip.platform].cost += cost;
    byPlatform[trip.platform].trips += 1;
    byPlatform[trip.platform].miles += Number(trip.miles || 0);
    byPlatform[trip.platform].hours += Number(trip.hours || 0);
    const day = new Date(trip.date).toISOString().split('T')[0];
    if (!byDay[day]) byDay[day] = { gross: 0, cost: 0, net: 0 };
    byDay[day].gross += Number(trip.gross || 0);
    byDay[day].cost += cost;
    byDay[day].net += Number(trip.gross || 0) - cost;
  });

  const cost = totalCost(expenses);
  const net = gross - cost;
  const tax = { ...defaultTax, ...(taxSettings || {}) };
  const taxEst = Math.max(net, 0) * tax.seTaxMultiplier * tax.selfEmploymentTaxRate + Math.max(net, 0) * tax.incomeTaxRate;
  return {
    period,
    gross,
    cost,
    net,
    miles,
    hours,
    cpm: miles > 0 ? cost / miles : 0,
    epm: miles > 0 ? gross / miles : 0,
    hourlyRate: hours > 0 ? net / hours : 0,
    taxEst,
    mileageDeduction: miles * tax.mileageRate,
    afterTax: net - taxEst,
    totalTrips: trips.length,
    expenses,
    byPlatform,
    byDay,
  };
}

module.exports = { defaultVehicle, defaultTax, tripCost, totalCost, getPeriodDateRange, computeStats };
