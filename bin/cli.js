#!/usr/bin/env node
'use strict';

const { compute } = require('../src');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function printHelp() {
  console.log(`已泰八字 CLI

用法：
  yitai-bazi --year 1990 --month 8 --day 15 --hour 14 --minute 30 --city 北京市区

参数：
  --year     公历年
  --month    公历月
  --day      公历日
  --hour     小时（0-23）
  --minute   分钟（默认 0）
  --city     地区名（默认 北京市区；可用数据库中的地区名，如 北京市区、上海市区）
  --no-true-solar-time  不换算真太阳时
  --help     显示帮助
`);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.year || !args.month || !args.day || args.hour == null) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  const input = {
    year: Number(args.year),
    month: Number(args.month),
    day: Number(args.day),
    hour: Number(args.hour),
    minute: Number(args.minute || 0),
    city: args.city || '北京市区',
    useTrueSolarTime: !args['no-true-solar-time'],
  };

  const result = compute(input);
  const p = result.pillars;

  console.log('已泰八字排盘');
  console.log('='.repeat(40));
  console.log(`输入时间：${input.year}-${input.month}-${input.day} ${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`);
  console.log(`地区：${input.city}`);

  if (result.trueSolar.cityInfo) {
    const t = result.trueSolar;
    console.log(`真太阳时：${t.year}-${t.month}-${t.day} ${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`);
    console.log(`经度时差：${t.cityInfo.timeDiff}，平真时差：${t.equationCorrectionMinutes.toFixed(2)} 分钟`);
  }

  console.log('-'.repeat(40));
  console.log(`年柱：${p.year.pillar}`);
  console.log(`月柱：${p.month.pillar}`);
  console.log(`日柱：${p.day.pillar}`);
  console.log(`时柱：${p.hour.pillar}`);
  console.log('-'.repeat(40));
  console.log(`四柱：${p.year.pillar} ${p.month.pillar} ${p.day.pillar} ${p.hour.pillar}`);
  console.log(`日主：${p.day.stem}`);

  console.log('\n五行统计：');
  for (const [el, count] of Object.entries(result.wuxing.counts)) {
    console.log(`  ${el}: ${count}`);
  }
  console.log(`最旺：${result.wuxing.strongest}，最弱：${result.wuxing.weakest}`);

  console.log('\n十神：');
  for (const [pos, item] of Object.entries(result.tenGods)) {
    const posName = { year: '年', month: '月', day: '日', hour: '时' }[pos];
    console.log(`  ${posName}干：${item.stem}`);
  }

  const info = result.monthOrder.jieqiInfo;
  console.log('\n节气：');
  console.log(`  当月节：${info.jieqiName}（${info.jieqiDay}日 ${info.jieqiHour}:${String(info.jieqiMinute).padStart(2, '0')}）`);
  console.log(`  当月中气：${info.zhongqiName}（${info.zhongqiDay}日 ${info.zhongqiHour}:${String(info.zhongqiMinute).padStart(2, '0')}）`);
}

try {
  main();
} catch (err) {
  console.error(`错误：${err.message}`);
  process.exit(1);
}
