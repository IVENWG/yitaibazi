const test = require('node:test');
const assert = require('node:assert/strict');
const { computeFullChart, formatChartReport } = require('../src');

test('formats full chart report for screenshot sample', () => {
  const chart = computeFullChart({
    year: 2026,
    month: 5,
    day: 31,
    hour: 15,
    minute: 53,
    city: '北京怀柔区',
    sex: '男',
    name: '发',
  });
  const report = formatChartReport(chart);

  assert.equal(chart.pillars.year.pillar, '丙午');
  assert.equal(chart.pillars.month.pillar, '癸巳');
  assert.equal(chart.pillars.day.pillar, '乙巳');
  assert.equal(chart.pillars.hour.pillar, '甲申');
  assert.equal(chart.trueSolar.hour, 15);
  assert.equal(chart.trueSolar.minute, 42);
  assert.equal(chart.lunar.month, 4);
  assert.equal(chart.lunar.day, 14);
  assert.equal(chart.luck.pillars[0].pillar, '甲午');
  assert.equal(chart.luck.start.years, 1);
  assert.equal(chart.luck.start.months, 9);
  assert.equal(chart.luck.start.days, 10);
  assert.match(report, /当月节气：立夏（6日19:50）；中气：小满（21日8:38）/);
  assert.match(report, /2028戊申/);
  assert.match(report, /年柱：.*文昌/);
  assert.match(report, /日柱：.*十恶大败日/);
  assert.match(report, /时柱：.*驿马/);
});
