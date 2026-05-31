'use strict';

const { HEAVENLY_STEMS, EARTHLY_BRANCHES, JIAZI } = require('./constants');

function stemIndex(stem) {
  return HEAVENLY_STEMS.indexOf(stem);
}

function branchIndex(branch) {
  return EARTHLY_BRANCHES.indexOf(branch);
}

function jiaziIndex(jiazi) {
  return JIAZI.indexOf(jiazi);
}

function splitJiazi(jiazi) {
  if (!jiazi || jiazi.length < 2) return { stem: '', branch: '' };
  return { stem: jiazi[0], branch: jiazi[1] };
}

function makeJiazi(stemIndexValue, branchIndexValue) {
  const s = normalizeCycle(stemIndexValue, 10);
  const b = normalizeCycle(branchIndexValue, 12);
  return HEAVENLY_STEMS[s] + EARTHLY_BRANCHES[b];
}

function normalizeCycle(value, cycle) {
  let n = value % cycle;
  if (n <= 0) n += cycle;
  return n;
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function solarMonthDays(year, month) {
  if (month === 2 && isLeapYear(year)) return 29;
  const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month];
}

/**
 * 原 VB Strings.Mid: 1-based 起始，长度可选
 */
function mid(str, start, length) {
  const s = String(str);
  const idx = Math.max(0, start - 1);
  return length == null ? s.slice(idx) : s.slice(idx, idx + length);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function dateKey(month, day) {
  return `${month}月${pad2(day)}日`;
}

function addSeconds(date, seconds) {
  return new Date(date.getTime() + seconds * 1000);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * 解析原程序中的时间偏移字符串：
 * - shicha: "-0:14:10"，单位秒
 * - PingToZhen: "-3:9"，单位分钟
 */
function parseSignedTime(str, unit = 'seconds') {
  if (!str) return 0;
  const text = String(str).trim();
  const sign = text.startsWith('-') ? -1 : 1;
  const body = text.replace(/^[+-]/, '');
  const parts = body.split(':').map(Number);

  if (unit === 'seconds') {
    const [h = 0, m = 0, s = 0] = parts;
    return sign * (h * 3600 + m * 60 + s);
  }

  if (unit === 'minutes') {
    const [m = 0, s = 0] = parts;
    return sign * (m + s / 60);
  }

  throw new Error(`Unknown time unit: ${unit}`);
}

module.exports = {
  stemIndex,
  branchIndex,
  jiaziIndex,
  splitJiazi,
  makeJiazi,
  normalizeCycle,
  isLeapYear,
  solarMonthDays,
  mid,
  pad2,
  dateKey,
  addSeconds,
  addMinutes,
  parseSignedTime,
};
