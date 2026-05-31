'use strict';

const { computeBaZi } = require('./core/pillars');
const { toTrueSolarTime, findCity } = require('./core/solar-time');
const { analyzeWuxing, analyzeTenGods, tenGod } = require('./analysis/wuxing');
const { analyzeChenggu } = require('./analysis/chenggu');
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

module.exports = {
  compute,
  computeBaZi,
  toTrueSolarTime,
  findCity,
  analyzeWuxing,
  analyzeTenGods,
  tenGod,
  analyzeChenggu,
  constants,
};
