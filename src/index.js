'use strict';

const { computeBaZi } = require('./core/pillars');
const { toTrueSolarTime, findCity } = require('./core/solar-time');
const { computeLunarDate } = require('./core/lunar');
const { computeLuck } = require('./core/luck');
const { fourBranchStrengths } = require('./core/changsheng');
const { nayin } = require('./core/nayin');
const { analyzeWuxing, analyzeTenGods, tenGod, tenGodShort } = require('./analysis/wuxing');
const { analyzeChenggu } = require('./analysis/chenggu');
const { formatChartReport } = require('./report/chart-report');
const constants = require('./core/constants');

function compute(input) {
  const bazi = computeBaZi(input);
  const wuxing = analyzeWuxing(bazi.pillars);
  const tenGods = analyzeTenGods(bazi.pillars);

  return {
    ...bazi,
    wuxing,
    tenGods,
  };
}

function computeFullChart(input) {
  const base = compute(input);
  const { trueSolar, pillars } = base;
  const lunar = computeLunarDate(trueSolar.year, trueSolar.month, trueSolar.day);
  const luck = computeLuck({ trueSolar, pillars, sex: input.sex || '男' });
  const branchStrengths = fourBranchStrengths(pillars);
  const nayins = Object.fromEntries(Object.entries(pillars).map(([k, v]) => [k, nayin(v.pillar)]));

  return {
    ...base,
    lunar,
    luck,
    branchStrengths,
    nayins,
  };
}

module.exports = {
  compute,
  computeFullChart,
  formatChartReport,
  computeBaZi,
  toTrueSolarTime,
  findCity,
  analyzeWuxing,
  analyzeTenGods,
  tenGod,
  tenGodShort,
  analyzeChenggu,
  constants,
};
