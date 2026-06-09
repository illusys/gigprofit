const test = require('node:test');
const assert = require('node:assert/strict');
const { tripCost, totalCost, computeStats } = require('../services/profitService');

test('profit calculations include tolls and parking in trip and aggregate totals', () => {
  const trip = { date: '2026-06-09', platform: 'Uber', miles: 10, hours: 1, gross: 30, tolls: 3, parking: 2 };
  const cost = tripCost(trip, { mpg: 25, fuelPrice: 4, deprecPerMile: 0, insuranceMonthly: 0, maintenancePerMile: 0, tirePerMile: 0, oilChangeInterval: 5000, oilChangeCost: 0, loanMonthly: 0 });
  assert.equal(cost.tolls, 3);
  assert.equal(cost.parking, 2);
  assert.equal(totalCost(cost), 6.6);
  const stats = computeStats([trip], { mpg: 25, fuelPrice: 4, deprecPerMile: 0, insuranceMonthly: 0, maintenancePerMile: 0, tirePerMile: 0, oilChangeInterval: 5000, oilChangeCost: 0, loanMonthly: 0 }, 'DAILY');
  assert.equal(stats.expenses.tolls, 3);
  assert.equal(stats.expenses.parking, 2);
  assert.equal(stats.cost, 6.6);
});
