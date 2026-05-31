'use strict';

const { HEAVENLY_STEMS, EARTHLY_BRANCHES, JIAZI } = require('./constants');
const { normalizeCycle, splitJiazi, branchIndex } = require('./utils');
const { getGanzhiYear, getJieqiMonthIndex, getMonthBranchByZhongqi } = require('./calendar');
const { toTrueSolarTime } = require('./solar-time');

/**
 * 计算年柱。
 * 移植自 am.cs：num13 = (year - 1882 + 19) % 60。
 * 1884 立春后为甲子，因此公式等价。
 */
function computeYearPillar(yearForGanzhi) {
  let index = (yearForGanzhi - 1882 + 19) % 60;
  if (index === 0) index = 60;
  if (index < 0) index += 60;
  const pillar = JIAZI[index];
  return { ...splitJiazi(pillar), pillar, index };
}

/**
 * 年干起月干：
 * 甲己年丙寅月、乙庚年戊寅月、丙辛年庚寅月、丁壬年壬寅月、戊癸年甲寅月。
 * 移植自 aq.cs l_ref + am.cs 月干计算。
 */
function getFirstMonthStemBase(yearStem) {
  if (yearStem === '甲' || yearStem === '己') return 3; // 丙
  if (yearStem === '乙' || yearStem === '庚') return 5; // 戊
  if (yearStem === '丙' || yearStem === '辛') return 7; // 庚
  if (yearStem === '丁' || yearStem === '壬') return 9; // 壬
  if (yearStem === '戊' || yearStem === '癸') return 1; // 甲
  throw new Error(`无效年干：${yearStem}`);
}

function computeMonthPillar({ year, month, day, hour, minute, yearStem }) {
  const { branchIndex: monthBranchIndex, jieMonth, row } = getJieqiMonthIndex(year, month, day, hour, minute);
  const monthBranch = EARTHLY_BRANCHES[monthBranchIndex];

  const base = getFirstMonthStemBase(yearStem);
  let stemIndex = (monthBranchIndex === 1 ? 13 : monthBranchIndex);
  stemIndex = normalizeCycle(stemIndex - 3 + base, 10);
  const monthStem = HEAVENLY_STEMS[stemIndex];

  return {
    stem: monthStem,
    branch: monthBranch,
    pillar: monthStem + monthBranch,
    stemIndex,
    branchIndex: monthBranchIndex,
    jieMonth,
    row,
  };
}

/**
 * 计算日柱。
 * 移植自 aq.cs a_ref(ref year, month, day, hour)：
 * - 若 23 点且不使用“子时换日”特殊设置，则日数 +1
 * - num8 = (year-1)*365 + dayOfYear + leapCorrection
 * - dayIndex = (13 + num8) % 60
 */
function computeDayPillar(year, month, day, hour, useLateZiAsNextDay = true) {
  let d = day;
  if (hour === 23 && useLateZiAsNextDay) {
    d += 1;
  }

  const dayOfYear = getDayOfYear(year, month, d);
  const prevYear = year - 1;
  const baseDays = prevYear * 365 + dayOfYear;
  let leapCorrection = Math.floor((year - 1) / 4) - gregorianCorrection(year, month, d);

  if (isLeapYear(year) && month >= 3) {
    leapCorrection += 1;
  }

  const total = baseDays + leapCorrection;
  let index = (13 + total) % 60;
  if (index === 0) index = 60;

  const pillar = JIAZI[index];
  return { ...splitJiazi(pillar), pillar, index };
}

function getDayOfYear(year, month, day) {
  const days = [0, 31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let sum = 0;
  for (let m = 1; m < month; m++) sum += days[m];
  return sum + day;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 移植自 aq.cs a_ref(ref year, month, day) 的格里历校正函数。
 */
function gregorianCorrection(year, month, day) {
  if (year < 1582 || (year === 1582 && month < 10) || (year === 1582 && month === 10 && day <= 4)) return 0;
  if ((year === 1582 && month === 10 && day > 4) || (year === 1582 && month > 10) || (year > 1582 && year < 1701)) return 10;
  if (year >= 1701 && year < 1801) return 11;
  if (year >= 1801 && year < 1901) return 12;
  if (year >= 1901 && year < 2101) return 13;
  if (year >= 2101 && year < 2201) return 14;
  if (year >= 2201 && year < 2301) return 15;
  if (year >= 2301 && year < 2501) return 16;
  if (year >= 2501 && year < 2601) return 17;
  if (year >= 2601 && year < 2701) return 18;
  if (year >= 2701 && year < 2901) return 19;
  if (year >= 2901 && year < 3001) return 20;
  if (year >= 3001 && year < 3101) return 21;
  if (year >= 3101 && year < 3301) return 22;
  if (year >= 3301 && year < 3401) return 23;
  // 足够覆盖原软件数据库范围；更远年份暂不支持精确校正。
  return 23;
}

/**
 * 日干起时干：
 * 甲己日起甲子时、乙庚日起丙子时、丙辛日起戊子时、丁壬日起庚子时、戊癸日起壬子时。
 * 移植自 aq.cs k_ref + h_ref。
 */
function getHourStemBase(dayStem) {
  if (dayStem === '甲' || dayStem === '己') return 1;
  if (dayStem === '乙' || dayStem === '庚') return 3;
  if (dayStem === '丙' || dayStem === '辛') return 5;
  if (dayStem === '丁' || dayStem === '壬') return 7;
  if (dayStem === '戊' || dayStem === '癸') return 9;
  throw new Error(`无效日干：${dayStem}`);
}

function computeHourPillar(hour, dayStem, useLateZiAsNextDay = true) {
  let hourBranch;
  if (hour === 23) hourBranch = '子';
  else hourBranch = EARTHLY_BRANCHES[Math.floor((hour + 1) / 2 + 1)];

  let dayStemIndexForHour = HEAVENLY_STEMS.indexOf(dayStem);
  // 原程序 dp 为 true 时，23点不换日；这里 useLateZiAsNextDay=false 表示不换日，则时干按下一日推。
  if (hour === 23 && !useLateZiAsNextDay) {
    dayStemIndexForHour += 1;
    if (dayStemIndexForHour === 11) dayStemIndexForHour = 1;
  }

  const base = getHourStemBase(HEAVENLY_STEMS[dayStemIndexForHour]);
  const bIndex = branchIndex(hourBranch);
  const stemIndex = normalizeCycle(base + bIndex - 1, 10);
  const hourStem = HEAVENLY_STEMS[stemIndex];

  return { stem: hourStem, branch: hourBranch, pillar: hourStem + hourBranch, stemIndex, branchIndex: bIndex };
}

function computeBaZi(input) {
  const trueSolar = toTrueSolarTime(input);
  const { year, month, day, hour, minute } = trueSolar;

  const ganzhiYear = getGanzhiYear(year, month, day, hour, minute);
  const yearPillar = computeYearPillar(ganzhiYear);
  const monthPillar = computeMonthPillar({ year, month, day, hour, minute, yearStem: yearPillar.stem });
  const dayPillar = computeDayPillar(year, month, day, hour, input.useLateZiAsNextDay !== false);
  const hourPillar = computeHourPillar(hour, dayPillar.stem, input.useLateZiAsNextDay !== false);
  const monthOrder = getMonthBranchByZhongqi(year, month, day, hour, minute);

  return {
    input,
    trueSolar,
    pillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
    },
    ganzhiYear,
    monthOrder,
  };
}

module.exports = {
  computeBaZi,
  computeYearPillar,
  computeMonthPillar,
  computeDayPillar,
  computeHourPillar,
  getFirstMonthStemBase,
  getHourStemBase,
};
