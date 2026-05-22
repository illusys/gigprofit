export const IRS_RATE = 0.67; // 2025 IRS standard mileage rate

export const PLATFORMS = [
  'Uber',
  'Lyft',
  'DoorDash',
  'Amazon Flex',
  'Instacart',
  'Grubhub',
  'Uber Eats',
  'Shipt',
  'Other',
];

export const defaultVehicle = {
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

export function tripCost(trip, vehicle) {
  const v = vehicle || defaultVehicle;
  const fuel = (trip.miles / v.mpg) * v.fuelPrice;
  const dep = trip.miles * v.deprecPerMile;
  const maint = trip.miles * v.maintenancePerMile;
  const tire = trip.miles * v.tirePerMile;
  const oil = (trip.miles / v.oilChangeInterval) * v.oilChangeCost;
  const ins = (v.insuranceMonthly / 3500) * trip.miles;
  const loan = (v.loanMonthly / 3500) * trip.miles;
  return { fuel, dep, maint, tire, oil, ins, loan };
}

export function totalCost(c) {
  return c.fuel + c.dep + c.maint + c.tire + c.oil + c.ins + c.loan;
}

export function computeStats(trips, vehicle, period) {
  const now = new Date();
  const filtered = trips.filter((t) => {
    const d = new Date(t.date + 'T12:00:00');
    const diff = (now - d) / 86400000;
    if (period === 'day') return diff < 1;
    if (period === 'week') return diff < 7;
    if (period === 'month') return diff < 30;
    return diff < 365;
  });

  let gross = 0, cost = 0, miles = 0, hours = 0;
  const byPlatform = {};
  const byDay = {};

  filtered.forEach((t) => {
    const c = tripCost(t, vehicle);
    const tc = totalCost(c);
    gross += t.gross;
    cost += tc;
    miles += t.miles;
    hours += t.hours;

    if (!byPlatform[t.platform]) {
      byPlatform[t.platform] = { gross: 0, cost: 0, trips: 0, miles: 0, hours: 0 };
    }
    byPlatform[t.platform].gross += t.gross;
    byPlatform[t.platform].cost += tc;
    byPlatform[t.platform].trips++;
    byPlatform[t.platform].miles += t.miles;
    byPlatform[t.platform].hours += t.hours;

    const dayKey = t.date;
    if (!byDay[dayKey]) byDay[dayKey] = { gross: 0, cost: 0, net: 0 };
    byDay[dayKey].gross += t.gross;
    byDay[dayKey].cost += tc;
    byDay[dayKey].net += t.gross - tc;
  });

  const net = gross - cost;
  const cpm = miles > 0 ? cost / miles : 0;
  const epm = miles > 0 ? gross / miles : 0;
  const hourlyRate = hours > 0 ? net / hours : 0;

  // Expense breakdown
  let expFuel = 0, expDep = 0, expMaint = 0, expTire = 0, expOil = 0, expIns = 0, expLoan = 0;
  filtered.forEach((t) => {
    const c = tripCost(t, vehicle);
    expFuel += c.fuel;
    expDep += c.dep;
    expMaint += c.maint;
    expTire += c.tire;
    expOil += c.oil;
    expIns += c.ins;
    expLoan += c.loan;
  });

  const seTax = Math.max(net, 0) * 0.9235 * 0.153;
  const incomeTax = Math.max(net - seTax, 0) * 0.22;
  const taxEst = seTax + incomeTax;
  const mileageDeduction = miles * IRS_RATE;
  const afterTax = net - taxEst;

  return {
    gross, cost, net, miles, hours, cpm, epm, hourlyRate,
    byPlatform, byDay,
    taxEst, mileageDeduction, afterTax,
    totalTrips: filtered.length,
    expenses: { fuel: expFuel, dep: expDep, maint: expMaint, tire: expTire, oil: expOil, ins: expIns, loan: expLoan },
  };
}

export function fmt(n, dec = 2) {
  if (typeof n !== 'number') return '$0.00';
  const abs = Math.abs(n).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (n < 0 ? '-$' : '$') + abs;
}

export function fmtMi(n) {
  return (+(n || 0)).toFixed(1) + ' mi';
}

export function profitColor(n) {
  if (n > 0) return '#00e5a0';
  if (n < 0) return '#ff4d6a';
  return '#8892a4';
}

export function seedTrips() {
  const today = new Date();
  const trips = [];
  const platforms = ['Uber', 'DoorDash', 'Lyft', 'Amazon Flex', 'Instacart'];
  let id = 1000;
  for (let d = 13; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const count = 2 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const miles = 3 + Math.random() * 18;
      const hrs = 0.2 + miles / 28 + Math.random() * 0.4;
      const gross = miles * 1.1 + hrs * 7 + Math.random() * 6;
      trips.push({
        id: String(id++),
        date: dateStr,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        miles: +miles.toFixed(1),
        hours: +hrs.toFixed(2),
        gross: +gross.toFixed(2),
        note: '',
      });
    }
  }
  return trips;
}
