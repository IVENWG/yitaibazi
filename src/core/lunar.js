'use strict';

const calendarRows = require('../data/calendar.json');
const { CHINESE_NUMBERS, LUNAR_DAYS } = require('./constants');

const calendarIndex = new Map(calendarRows.map(row => [`${row.Nian}-${row.JieqiMonth}`, row]));

function getRow(year, month) {
  const row = calendarIndex.get(`${year}-${month}`);
  if (!row) throw new Error(`农历数据库缺少记录：${year}-${month}`);
  return row;
}

/**
 * 近似复刻原程序 am.cs 中对 calendar 表的农历月日换算。
 * calendar 表每个公历月提供：
 * - Lmonth: 当月节气附近对应农历月
 * - JieqiNDay: 节气日对应的农历日序
 * - Ldays: 当前农历月天数
 * - LdaysA: 前/后闰月或相邻月天数辅助值
 * - LeapFlag: 是否闰月标记
 *
 * 该函数以“节气日对应农历日”为锚点，在当月内前后推算。
 */
function computeLunarDate(year, month, day) {
  const row = getRow(year, month);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prev = getRow(prevYear, prevMonth);

  let lunarYear = year;
  let lunarMonth = row.Lmonth;
  let lunarDay = row.JieqiNDay + (day - row.JieqiDay);
  let leap = isTrue(row.LeapFlag);

  if (lunarDay <= 0) {
    lunarMonth -= 1;
    if (lunarMonth <= 0) {
      lunarMonth = 12;
      lunarYear -= 1;
    }
    const prevLunarDays = row.LdaysA || prev.Ldays || 30;
    lunarDay = prevLunarDays + lunarDay;
    leap = false;
  } else if (lunarDay > row.Ldays) {
    lunarDay -= row.Ldays;
    lunarMonth += 1;
    if (lunarMonth > 12) {
      lunarMonth = 1;
      lunarYear += 1;
    }
    leap = false;
  }

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    leap,
    yearText: yearToChinese(lunarYear),
    monthText: `${leap ? '闰' : ''}${CHINESE_NUMBERS[lunarMonth]}月`,
    dayText: LUNAR_DAYS[lunarDay] || `${lunarDay}日`,
  };
}

function isTrue(value) {
  return value === true || value === 1 || value === '1' || value === 'True' || value === 'Yes' || value === 'On';
}

function yearToChinese(year) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  return String(year).split('').map(d => digits[Number(d)]).join('');
}

module.exports = {
  computeLunarDate,
  yearToChinese,
};
