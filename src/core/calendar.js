'use strict';

const calendarRows = require('../data/calendar.json');
const { JIEQI_NAMES, ZHONGQI_NAMES } = require('./constants');

const calendarIndex = new Map();
for (const row of calendarRows) {
  calendarIndex.set(`${row.Nian}-${row.JieqiMonth}`, row);
}

function getCalendarRow(year, month) {
  const row = calendarIndex.get(`${year}-${month}`);
  if (!row) {
    throw new Error(`节气数据库缺少记录：${year}-${month}`);
  }
  return row;
}

function compareDateTimeParts(a, b) {
  // a/b: {day, hour, minute}
  if (a.day !== b.day) return a.day - b.day;
  if (a.hour !== b.hour) return a.hour - b.hour;
  return a.minute - b.minute;
}

/**
 * 判断指定年月日时分处在节气前还是后，并返回月令地支。
 * 移植自 am.cs a(ref short year, month, day, hour, minute) 的月支部分。
 *
 * 原程序按每月中气(Zhongqi)判定 t（月令地支）：
 * 1月大寒后为寅，否则丑；2月雨水后为卯，否则寅；...；12月冬至后为丑，否则子。
 */
function getMonthBranchByZhongqi(year, month, day, hour, minute) {
  const row = getCalendarRow(year, month);
  const cmp = compareDateTimeParts(
    { day, hour, minute },
    { day: row.ZhongqiDay, hour: row.ZhongqiHour, minute: row.ZhongqiMinute }
  );

  const afterOrAt = cmp >= 0;
  const branchesAfter = [' ', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  const branchesBefore = [' ', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子'];

  return {
    branch: afterOrAt ? branchesAfter[month] : branchesBefore[month],
    jieqiInfo: {
      jieqiName: JIEQI_NAMES[month],
      jieqiDay: row.JieqiDay,
      jieqiHour: row.JieqiHour,
      jieqiMinute: row.JieqiMinute,
      zhongqiName: ZHONGQI_NAMES[month],
      zhongqiDay: row.ZhongqiDay,
      zhongqiHour: row.ZhongqiHour,
      zhongqiMinute: row.ZhongqiMinute,
    },
    row,
  };
}

/**
 * 根据立春（2月节气）判断八字年柱所属年份。
 * 移植自 am.cs：
 * 若在当年立春之后，以当年为干支年；否则以前一年为干支年。
 */
function getGanzhiYear(year, month, day, hour, minute) {
  const feb = getCalendarRow(year, 2);
  const atOrAfterLichun =
    month > 2 ||
    (month === 2 && compareDateTimeParts(
      { day, hour, minute },
      { day: feb.JieqiDay, hour: feb.JieqiHour, minute: feb.JieqiMinute }
    ) >= 0);

  return atOrAfterLichun ? year : year - 1;
}

/**
 * 计算月柱用的节气月序。
 * 原程序：若出生时间早于当月节，则 num14 = month - 1，否则 num14 = month；
 * 再 num15 = num14 + 1；月支 = gd[num15]
 */
function getJieqiMonthIndex(year, month, day, hour, minute) {
  const row = getCalendarRow(year, month);
  const beforeJie = compareDateTimeParts(
    { day, hour, minute },
    { day: row.JieqiDay, hour: row.JieqiHour, minute: row.JieqiMinute }
  ) < 0;

  let jieMonth = beforeJie ? month - 1 : month;
  if (jieMonth === 0) jieMonth = 12;

  let branchIndex = jieMonth + 1;
  if (branchIndex > 12) branchIndex -= 12;

  return { jieMonth, branchIndex, row };
}

module.exports = {
  getCalendarRow,
  getMonthBranchByZhongqi,
  getGanzhiYear,
  getJieqiMonthIndex,
};
