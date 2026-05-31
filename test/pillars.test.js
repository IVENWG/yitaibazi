const test = require('node:test');
const assert = require('node:assert/strict');
const { compute } = require('../src');

test('computes a basic BaZi chart', () => {
  const result = compute({
    year: 1990,
    month: 8,
    day: 15,
    hour: 14,
    minute: 30,
    city: '北京市区',
  });

  assert.equal(result.pillars.year.pillar, '庚午');
  assert.equal(result.pillars.month.pillar, '甲申');
  assert.equal(result.pillars.day.pillar, '壬子');
  assert.equal(result.pillars.hour.pillar, '丁未');
  assert.equal(result.trueSolar.hour, 14);
  assert.equal(result.trueSolar.minute, 12);
});

test('supports disabling true solar time', () => {
  const result = compute({
    year: 1990,
    month: 8,
    day: 15,
    hour: 14,
    minute: 30,
    city: '北京市区',
    useTrueSolarTime: false,
  });

  assert.equal(result.trueSolar.hour, 14);
  assert.equal(result.trueSolar.minute, 30);
  assert.equal(result.pillars.year.pillar, '庚午');
});
