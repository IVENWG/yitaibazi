'use strict';

const chengguRows = require('../data/Chenggu.json');
const {
  CHENGGU_YEAR_WEIGHTS,
  CHENGGU_MONTH_WEIGHTS,
  CHENGGU_DAY_WEIGHTS,
  CHENGGU_HOUR_WEIGHTS,
  CHINESE_NUMBERS,
} = require('../core/constants');
const { jiaziIndex, branchIndex } = require('../core/utils');

const textByAmount = new Map(chengguRows.map(row => [row.Amount, row.Text]));

function analyzeChenggu({ yearPillar, lunarMonth, lunarDay, hourBranch }) {
  const yearIndex = typeof yearPillar === 'string' ? jiaziIndex(yearPillar) : yearPillar.index;
  const hourIndex = branchIndex(hourBranch);

  const total =
    (CHENGGU_YEAR_WEIGHTS[yearIndex] || 0) +
    (CHENGGU_MONTH_WEIGHTS[lunarMonth] || 0) +
    (CHENGGU_DAY_WEIGHTS[lunarDay] || 0) +
    (CHENGGU_HOUR_WEIGHTS[hourIndex] || 0);

  const amount = Math.round(total * 10);
  const liang = Math.floor(amount / 10);
  const qian = amount % 10;
  const label = qian === 0 ? `${CHINESE_NUMBERS[liang]}两` : `${CHINESE_NUMBERS[liang]}两${CHINESE_NUMBERS[qian]}钱`;

  return {
    total,
    amount,
    label,
    text: textByAmount.get(amount) || '',
    weights: {
      year: CHENGGU_YEAR_WEIGHTS[yearIndex] || 0,
      month: CHENGGU_MONTH_WEIGHTS[lunarMonth] || 0,
      day: CHENGGU_DAY_WEIGHTS[lunarDay] || 0,
      hour: CHENGGU_HOUR_WEIGHTS[hourIndex] || 0,
    },
  };
}

module.exports = { analyzeChenggu };
