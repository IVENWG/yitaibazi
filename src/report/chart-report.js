'use strict';

const { HIDDEN_STEMS } = require('../core/constants');
const { branchIndex } = require('../core/utils');

const POSITIONS = ['year', 'month', 'day', 'hour'];
const POS_LABEL = { year: '年', month: '月', day: '日', hour: '时' };

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatDateTime({ year, month, day, hour, minute }) {
  return `${year}年${month}月${day}日${hour}时${minute}分`;
}

function weekday(date) {
  return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()];
}

function formatHiddenStemLine(pillars) {
  return POSITIONS.map(pos => {
    const branch = pillars[pos].branch;
    return (HIDDEN_STEMS[branchIndex(branch)] || []).filter(s => s && s.trim()).join('') || '　';
  }).join('　　　　');
}

function formatHiddenTenGodLine(chart) {
  return POSITIONS.map(pos => {
    const list = chart.tenGods[pos].hiddenStems.map(x => x.tenGodShort).join('');
    return list || '　';
  }).join('　　　　');
}

function formatLuckLine(luck, prop) {
  return luck.pillars.map(item => item[prop]).join('　　　');
}

function formatLiuNianGrid(luck) {
  const lines = ['运支旺衰： ' + luck.pillars.map(item => item.branchStrength).join('　　　')];
  for (let row = 0; row < 10; row++) {
    lines.push('　' + luck.liunian.map(col => `${col[row].year}${col[row].pillar}`).join('　'));
  }
  return lines.join('\n');
}

function formatShenshaLines(shensha) {
  if (!shensha?.lines) return [];
  return shensha.lines.map(line => `${line.label}：${line.items.length ? line.items.join('　') : '无'}`);
}

function formatChartReport(chart) {
  const input = chart.input;
  const t = chart.trueSolar;
  const p = chart.pillars;
  const lunar = chart.lunar;
  const luck = chart.luck;
  const info = chart.monthOrder.jieqiInfo;
  const gender = input.sex || '男';
  const name = input.name || '发';
  const city = input.city || '未知';
  const cityInfo = t.cityInfo;

  const lines = [];
  lines.push(`${name}（${gender}命） 出生地区：${city}${cityInfo ? `　经度：${cityInfo.longitude} 纬度：${cityInfo.latitude}` : ''}`);
  lines.push(`公历日期：${formatDateTime(input)}出生（北京时间）`);
  lines.push(`真太阳时：${formatDateTime(t)}，${weekday(t.trueSolarDate)}`);
  lines.push(`　　　${lunar.yearText}年　　　　${lunar.monthText.replace('月', '')}月　　　　${lunar.dayText}　　　　${p.hour.branch}时`);
  lines.push('');
  lines.push(`　　　　　　${chart.tenGods.year.stemShort}　　　　　${chart.tenGods.month.stemShort}　　　　　日　　　　　${chart.tenGods.hour.stemShort}`);
  lines.push(`八字：　　　${p.year.stem}　　　　　${p.month.stem}　　　　　${p.day.stem}　　　　　${p.hour.stem}`);
  lines.push(`　　　　　　${p.year.branch}　　　　　${p.month.branch}　　　　　${p.day.branch}　　　　　${p.hour.branch}`);
  lines.push(`　　　　　　${formatHiddenStemLine(p)}`);
  lines.push(`　　　　　　${formatHiddenTenGodLine(chart)}`);
  lines.push(`四支旺衰：　${chart.branchStrengths.year}　　　　　${chart.branchStrengths.month}　　　　　${chart.branchStrengths.day}　　　　　${chart.branchStrengths.hour}`);
  lines.push('');
  lines.push(`当月节气：${info.jieqiName}（${info.jieqiDay}日${info.jieqiHour}:${pad2(info.jieqiMinute)}）；中气：${info.zhongqiName}（${info.zhongqiDay}日${info.zhongqiHour}:${pad2(info.zhongqiMinute)}）`);
  lines.push('');
  lines.push(`命主从${luck.start.years}岁${luck.start.months}月${luck.start.days}天开始行大运，于每一交运年的${luck.start.handoverMonth}月${luck.start.handoverDay}日交运。`);
  lines.push('');
  lines.push('　　　　　　' + luck.pillars.map(item => item.tenGod).join('　　　'));
  lines.push('大运：　　　' + luck.pillars.map(item => item.stem).join('　　　'));
  lines.push('　　　　　　' + luck.pillars.map(item => item.branch).join('　　　'));
  lines.push('　　　　　　' + luck.pillars.map(item => item.hiddenTenGods?.join('') || '').join('　　　'));
  lines.push('　　　　　　' + luck.pillars.map((_, i) => luck.start.startAge + i * 10).join('　　　'));
  lines.push('　　　　　　' + luck.pillars.map((_, i) => luck.start.startYear + i * 10).join('　　　'));
  lines.push(formatLiuNianGrid(luck));
  lines.push('');
  lines.push(...formatShenshaLines(chart.shensha));
  lines.push('');
  lines.push(`纳音：年柱${chart.nayins.year}　月柱${chart.nayins.month}　日柱${chart.nayins.day}　时柱${chart.nayins.hour}`);
  lines.push(`五行：木${chart.wuxing.counts.木} 火${chart.wuxing.counts.火} 土${chart.wuxing.counts.土} 金${chart.wuxing.counts.金} 水${chart.wuxing.counts.水}`);

  return lines.join('\n');
}

module.exports = { formatChartReport };
