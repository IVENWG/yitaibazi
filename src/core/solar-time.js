'use strict';

const cities = require('../data/cities-index.json');
const equationOfTime = require('../data/equation-of-time.json');
const { dateKey, addSeconds, addMinutes, parseSignedTime } = require('./utils');

/**
 * 真太阳时转换
 * 移植自 cleaned_source/ap.cs
 *
 * 原流程：
 * 1. 根据地区查询 JingWeiShich 表，取 shicha（经度时差）
 * 2. 先按 shicha 修正出生时间
 * 3. 再按修正后日期查询 PingToZhen 表，取 shijian（平太阳时转真太阳时差）
 * 4. 秒 >= 30 时进位 1 分钟
 */
function toTrueSolarTime({ year, month, day, hour, minute = 0, city, useTrueSolarTime = true }) {
  const inputDate = new Date(year, month - 1, day, hour, minute, 0);

  if (!useTrueSolarTime) {
    return {
      year,
      month,
      day,
      hour,
      minute,
      originalDate: inputDate,
      trueSolarDate: inputDate,
      cityInfo: null,
      longitudeCorrectionSeconds: 0,
      equationCorrectionMinutes: 0,
    };
  }

  const cityInfo = findCity(city);
  if (!cityInfo) {
    throw new Error(`未找到地区数据：${city}。请使用数据库中存在的地区名，例如「北京市区」。`);
  }

  const longitudeCorrectionSeconds = parseSignedTime(cityInfo.timeDiff, 'seconds');
  const longitudeAdjusted = addSeconds(inputDate, longitudeCorrectionSeconds);

  const key = dateKey(longitudeAdjusted.getMonth() + 1, longitudeAdjusted.getDate());
  const eotValue = equationOfTime[key];
  if (!eotValue) {
    throw new Error(`未找到平太阳时差数据：${key}`);
  }

  const equationCorrectionMinutes = parseSignedTime(eotValue, 'minutes');
  let trueSolarDate = addMinutes(longitudeAdjusted, equationCorrectionMinutes);

  // 原程序：秒数 >= 30 则进位 1 分钟
  if (trueSolarDate.getSeconds() >= 30) {
    trueSolarDate = addMinutes(trueSolarDate, 1);
  }
  trueSolarDate.setSeconds(0, 0);

  return {
    year: trueSolarDate.getFullYear(),
    month: trueSolarDate.getMonth() + 1,
    day: trueSolarDate.getDate(),
    hour: trueSolarDate.getHours(),
    minute: trueSolarDate.getMinutes(),
    originalDate: inputDate,
    trueSolarDate,
    cityInfo,
    longitudeCorrectionSeconds,
    equationCorrectionMinutes,
  };
}

function findCity(city) {
  if (!city) return cities['北京市区'];
  if (cities[city]) return cities[city];

  // 宽松匹配：支持输入「北京」匹配「北京市区」
  const found = Object.entries(cities).find(([name]) => name.includes(city) || city.includes(name));
  if (found) return found[1];
  return null;
}

module.exports = {
  toTrueSolarTime,
  findCity,
};
