'use strict';

const { HEAVENLY_STEMS, EARTHLY_BRANCHES, JIAZI, HIDDEN_STEMS } = require('./constants');
const { normalizeCycle, stemIndex, branchIndex, splitJiazi } = require('./utils');
const { getCalendarRow } = require('./calendar');
const { tenGodShort } = require('../analysis/wuxing');
const { changsheng } = require('./changsheng');

function isYangBranch(branch) {
  return ['子', '寅', '辰', '午', '申', '戌'].includes(branch);
}

function luckDirection({ sex = '男', yearBranch }) {
  const male = sex !== '女';
  const yangYear = isYangBranch(yearBranch);
  return (male && yangYear) || (!male && !yangYear) ? 'forward' : 'backward';
}

function computeLuckPillars({ pillars, sex = '男' }) {
  const direction = luckDirection({ sex, yearBranch: pillars.year.branch });
  const monthStemIndex = stemIndex(pillars.month.stem);
  const monthBranchIndex = branchIndex(pillars.month.branch);

  return Array.from({ length: 8 }, (_, i) => {
    const step = i + 1;
    const s = direction === 'forward'
      ? normalizeCycle(monthStemIndex + step, 10)
      : normalizeCycle(monthStemIndex - step, 10);
    const b = direction === 'forward'
      ? normalizeCycle(monthBranchIndex + step, 12)
      : normalizeCycle(monthBranchIndex - step, 12);
    const pillar = HEAVENLY_STEMS[s] + EARTHLY_BRANCHES[b];
    return {
      index: i,
      pillar,
      ...splitJiazi(pillar),
      tenGod: tenGodShort(pillars.day.stem, HEAVENLY_STEMS[s]),
      hiddenTenGods: (HIDDEN_STEMS[b] || [])
        .filter(stem => stem && stem.trim())
        .map(stem => tenGodShort(pillars.day.stem, stem)),
      branchStrength: changsheng(pillars.day.stem, EARTHLY_BRANCHES[b]),
    };
  });
}

function nextMonth(year, month) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

function prevMonth(year, month) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

function dateFromParts(year, month, day, hour, minute) {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function getJieDate(year, month) {
  const row = getCalendarRow(year, month);
  return dateFromParts(year, month, row.JieqiDay, row.JieqiHour, row.JieqiMinute);
}

/**
 * 起运计算，移植 aq.cs 1401 附近思路：
 * 顺行取下一个节，逆行取上一个节；三天折一年，一天折四个月，一小时折五天。
 */
function computeLuckStart({ trueSolar, pillars, sex = '男' }) {
  const direction = luckDirection({ sex, yearBranch: pillars.year.branch });
  const birth = dateFromParts(trueSolar.year, trueSolar.month, trueSolar.day, trueSolar.hour, trueSolar.minute);

  let targetYear;
  let targetMonth;
  if (direction === 'forward') {
    const currentJie = getJieDate(trueSolar.year, trueSolar.month);
    const target = birth >= currentJie ? nextMonth(trueSolar.year, trueSolar.month) : { year: trueSolar.year, month: trueSolar.month };
    targetYear = target.year;
    targetMonth = target.month;
  } else {
    const currentJie = getJieDate(trueSolar.year, trueSolar.month);
    const target = birth >= currentJie ? { year: trueSolar.year, month: trueSolar.month } : prevMonth(trueSolar.year, trueSolar.month);
    targetYear = target.year;
    targetMonth = target.month;
  }

  const targetDate = getJieDate(targetYear, targetMonth);
  const diffMs = Math.abs(targetDate.getTime() - birth.getTime());
  const diffDays = diffMs / (24 * 60 * 60 * 1000);

  // 3天=1年，1天=4个月，1小时≈5天。按原程序取整风格：年/月取整数，天四舍五入。
  let totalMonths = diffDays * 4;
  let years = Math.floor(totalMonths / 12);
  let months = Math.floor(totalMonths % 12);
  let days = Math.floor((totalMonths - Math.floor(totalMonths)) * 30);
  if (days === 30) {
    days = 0;
    months += 1;
  }
  if (months === 12) {
    months = 0;
    years += 1;
  }

  const startYear = trueSolar.year + years + 1;
  const handoverMonth = normalizeCycle(trueSolar.month + months, 12);
  const handoverDay = normalizeCycle(trueSolar.day + days, 30);

  return {
    direction,
    targetJie: { year: targetYear, month: targetMonth, date: targetDate },
    years,
    months,
    days,
    startYear,
    startAge: startYear - trueSolar.year + 1,
    handoverMonth,
    handoverDay,
  };
}

function jiaziByYear(year) {
  let index = (year - 1882 + 19) % 60;
  if (index === 0) index = 60;
  if (index < 0) index += 60;
  return JIAZI[index];
}

function computeLiuNianGrid({ trueSolar, luckStart }) {
  const startOffset = luckStart.startYear - trueSolar.year;
  return Array.from({ length: 8 }, (_, col) => {
    const blockStartYear = trueSolar.year + startOffset + col * 10;
    return Array.from({ length: 10 }, (_, row) => {
      const year = blockStartYear + row;
      return { year, pillar: jiaziByYear(year), ...splitJiazi(jiaziByYear(year)) };
    });
  });
}

function computeLuck({ trueSolar, pillars, sex = '男' }) {
  const start = computeLuckStart({ trueSolar, pillars, sex });
  const pillarsList = computeLuckPillars({ pillars, sex });
  const liunian = computeLiuNianGrid({ trueSolar, luckStart: start });

  return {
    direction: start.direction,
    start,
    pillars: pillarsList,
    liunian,
  };
}

module.exports = {
  luckDirection,
  computeLuckPillars,
  computeLuckStart,
  computeLiuNianGrid,
  computeLuck,
  jiaziByYear,
};
