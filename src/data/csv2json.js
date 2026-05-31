#!/usr/bin/env node
/**
 * 将 MDB 导出的 CSV 文件转换为 JSON 格式
 * 用法: node csv2json.js
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname);

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  // 简易 CSV 解析 - 处理引号内的逗号和换行
  const records = [];
  let current = '';
  let inQuotes = false;
  const allFields = [];

  // 合并引号内的换行
  for (const ch of text) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === '\n' && !inQuotes) {
      allFields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) allFields.push(current);

  const headerLine = allFields[0];
  const headers = splitCSVLine(headerLine);

  for (let i = 1; i < allFields.length; i++) {
    const line = allFields[i].trim();
    if (!line) continue;
    const values = splitCSVLine(line);
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      let val = (values[j] || '').trim();
      // 去掉引号
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      // 尝试转数字
      if (/^-?\d+$/.test(val)) val = parseInt(val, 10);
      else if (/^-?\d+\.\d+$/.test(val)) val = parseFloat(val);
      obj[headers[j]] = val;
    }
    records.push(obj);
  }
  return records;
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// 转换各表
const tables = ['calendar', 'Chenggu', 'JingWeiShich', 'PingToZhen', 'textbook'];

for (const table of tables) {
  const csvPath = path.join(DATA_DIR, `${table}.csv`);
  const jsonPath = path.join(DATA_DIR, `${table}.json`);

  if (!fs.existsSync(csvPath)) {
    console.log(`Skip ${table}: CSV not found`);
    continue;
  }

  const csv = fs.readFileSync(csvPath, 'utf-8');
  const data = parseCSV(csv);
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`${table}: ${data.length} records -> ${jsonPath}`);
}

// 构建城市查找索引
const cities = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'JingWeiShich.json'), 'utf-8'));
const cityMap = {};
for (const c of cities) {
  if (c.diqu) cityMap[c.diqu] = { longitude: c.jingdu, timeDiff: c.shicha, latitude: c.weidu };
}
fs.writeFileSync(path.join(DATA_DIR, 'cities-index.json'), JSON.stringify(cityMap, null, 2), 'utf-8');
console.log(`cities-index.json: ${Object.keys(cityMap).length} cities`);

// 构建真太阳时查找索引 (key: "M月DD日")
const eot = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'PingToZhen.json'), 'utf-8'));
const eotMap = {};
for (const r of eot) {
  if (r.riqi) eotMap[r.riqi] = r.shijian;
}
fs.writeFileSync(path.join(DATA_DIR, 'equation-of-time.json'), JSON.stringify(eotMap, null, 2), 'utf-8');
console.log(`equation-of-time.json: ${Object.keys(eotMap).length} entries`);

console.log('\nDone!');
