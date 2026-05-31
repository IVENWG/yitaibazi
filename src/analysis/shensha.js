'use strict';

const { branchIndex, jiaziIndex } = require('../core/utils');

const POSITIONS = ['year', 'month', 'day', 'hour'];
const POS_LABEL = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' };

const GROUP_RULES = {
  驿马: [
    { group: ['申', '子', '辰'], target: '寅' },
    { group: ['寅', '午', '戌'], target: '申' },
    { group: ['巳', '酉', '丑'], target: '亥' },
    { group: ['亥', '卯', '未'], target: '巳' },
  ],
  华盖: [
    { group: ['申', '子', '辰'], target: '辰' },
    { group: ['寅', '午', '戌'], target: '戌' },
    { group: ['巳', '酉', '丑'], target: '丑' },
    { group: ['亥', '卯', '未'], target: '未' },
  ],
  将星: [
    { group: ['申', '子', '辰'], target: '子' },
    { group: ['寅', '午', '戌'], target: '午' },
    { group: ['巳', '酉', '丑'], target: '酉' },
    { group: ['亥', '卯', '未'], target: '卯' },
  ],
  劫煞: [
    { group: ['申', '子', '辰'], target: '巳' },
    { group: ['寅', '午', '戌'], target: '亥' },
    { group: ['巳', '酉', '丑'], target: '寅' },
    { group: ['亥', '卯', '未'], target: '申' },
  ],
  灾煞: [
    { group: ['申', '子', '辰'], target: '午' },
    { group: ['寅', '午', '戌'], target: '子' },
    { group: ['巳', '酉', '丑'], target: '卯' },
    { group: ['亥', '卯', '未'], target: '酉' },
  ],
  咸池: [
    { group: ['申', '子', '辰'], target: '酉' },
    { group: ['寅', '午', '戌'], target: '卯' },
    { group: ['巳', '酉', '丑'], target: '午' },
    { group: ['亥', '卯', '未'], target: '子' },
  ],
};

const STEM_BRANCH_RULES = {
  天乙: {
    甲: ['丑', '未'], 戊: ['丑', '未'],
    乙: ['子', '申'], 己: ['子', '申'],
    丙: ['亥', '酉'], 丁: ['亥', '酉'],
    壬: ['卯', '巳'], 癸: ['卯', '巳'],
    庚: ['寅', '午'], 辛: ['寅', '午'],
  },
  文昌: {
    甲: ['巳'], 乙: ['午'], 丙: ['申'], 丁: ['酉'], 戊: ['申'],
    己: ['酉'], 庚: ['亥'], 辛: ['子'], 壬: ['寅'], 癸: ['卯'],
  },
  太极: {
    甲: ['子', '午'], 乙: ['子', '午'],
    丙: ['卯', '酉'], 丁: ['卯', '酉'],
    戊: ['辰', '戌', '丑', '未'], 己: ['辰', '戌', '丑', '未'],
    庚: ['寅', '亥'], 辛: ['寅', '亥'],
    壬: ['巳', '申'], 癸: ['巳', '申'],
  },
  金舆: {
    甲: ['辰'], 乙: ['巳'], 丙: ['未'], 戊: ['未'], 丁: ['申'], 己: ['申'],
    庚: ['戌'], 辛: ['亥'], 壬: ['丑'], 癸: ['寅'],
  },
  禄神: {
    甲: ['寅'], 乙: ['卯'], 丙: ['巳'], 戊: ['巳'], 丁: ['午'], 己: ['午'],
    庚: ['申'], 辛: ['酉'], 壬: ['亥'], 癸: ['子'],
  },
  羊刃: {
    甲: ['卯'], 乙: ['寅'], 丙: ['午'], 戊: ['午'], 丁: ['巳'], 己: ['巳'],
    庚: ['酉'], 辛: ['申'], 壬: ['子'], 癸: ['亥'],
  },
  国印: {
    甲: ['戌'], 乙: ['亥'], 丙: ['丑'], 丁: ['寅'], 戊: ['丑'], 己: ['寅'],
    庚: ['辰'], 辛: ['巳'], 壬: ['未'], 癸: ['申'],
  },
};

const MONTH_DEITY = {
  天德: { 寅: '丁', 卯: '申', 辰: '壬', 巳: '辛', 午: '亥', 未: '甲', 申: '癸', 酉: '寅', 戌: '丙', 亥: '乙', 子: '巳', 丑: '庚' },
  月德: { 寅: '丙', 午: '丙', 戌: '丙', 申: '壬', 子: '壬', 辰: '壬', 亥: '甲', 卯: '甲', 未: '甲', 巳: '庚', 酉: '庚', 丑: '庚' },
  天医: { 寅: '丑', 卯: '寅', 辰: '卯', 巳: '辰', 午: '巳', 未: '午', 申: '未', 酉: '申', 戌: '酉', 亥: '戌', 子: '亥', 丑: '子' },
};

const RED_BIRD = { 子: '卯', 丑: '寅', 寅: '丑', 卯: '子', 辰: '亥', 巳: '戌', 午: '酉', 未: '申', 申: '未', 酉: '午', 戌: '巳', 亥: '辰' };
const TIAN_XI = { 子: '酉', 丑: '申', 寅: '未', 卯: '午', 辰: '巳', 巳: '辰', 午: '卯', 未: '寅', 申: '丑', 酉: '子', 戌: '亥', 亥: '戌' };

const GUCHEN = { 子: '寅', 丑: '寅', 寅: '巳', 卯: '巳', 辰: '巳', 巳: '申', 午: '申', 未: '申', 申: '亥', 酉: '亥', 戌: '亥', 亥: '寅' };
const GUASU = { 子: '戌', 丑: '戌', 寅: '丑', 卯: '丑', 辰: '丑', 巳: '辰', 午: '辰', 未: '辰', 申: '未', 酉: '未', 戌: '未', 亥: '戌' };

const BAD_DECADE_DAYS = new Set(['甲辰', '乙巳', '丙申', '丁亥', '戊戌', '己丑', '庚辰', '辛巳', '壬申', '癸亥']);
const KUI_GANG = new Set(['庚辰', '庚戌', '壬辰', '戊戌']);

function targetForGroup(refBranch, deity) {
  const rules = GROUP_RULES[deity] || [];
  return rules.find(r => r.group.includes(refBranch))?.target || '';
}

function includesTarget(value, target) {
  return target && String(value).includes(target);
}

function addIf(list, condition, name) {
  if (condition && !list.includes(name)) list.push(name);
}

function shenshaForPillar({ targetPillar, targetPos, pillars }) {
  const result = [];
  const targetStem = targetPillar.stem;
  const targetBranch = targetPillar.branch;
  const yearStem = pillars.year.stem;
  const yearBranch = pillars.year.branch;
  const monthBranch = pillars.month.branch;
  const dayStem = pillars.day.stem;
  const dayBranch = pillars.day.branch;

  for (const [name, table] of Object.entries(STEM_BRANCH_RULES)) {
    addIf(result, (table[dayStem] || []).includes(targetBranch) || (table[yearStem] || []).includes(targetBranch), name);
  }

  for (const deity of Object.keys(GROUP_RULES)) {
    addIf(result, targetForGroup(yearBranch, deity) === targetBranch || targetForGroup(dayBranch, deity) === targetBranch, deity);
  }

  for (const [name, table] of Object.entries(MONTH_DEITY)) {
    addIf(result, includesTarget(targetStem + targetBranch, table[monthBranch]), name);
  }

  addIf(result, RED_BIRD[yearBranch] === targetBranch && targetPos !== 'year', '红鸾');
  addIf(result, TIAN_XI[yearBranch] === targetBranch && targetPos !== 'year', '天喜');
  addIf(result, GUCHEN[yearBranch] === targetBranch, '孤辰');
  addIf(result, GUASU[yearBranch] === targetBranch && targetPos !== 'year', '寡宿');

  const diffFromYear = (branchIndex(targetBranch) - branchIndex(yearBranch) + 12) % 12;
  const diffFromDay = (branchIndex(targetBranch) - branchIndex(dayBranch) + 12) % 12;
  addIf(result, diffFromYear === 2 || diffFromDay === 2, '丧门');
  addIf(result, diffFromYear === 10 || diffFromDay === 10, '吊客');
  addIf(result, diffFromYear === 9 || diffFromDay === 9, '披麻');

  addIf(result, targetPos === 'day' && BAD_DECADE_DAYS.has(targetPillar.pillar), '十恶大败日');
  addIf(result, targetPos === 'day' && KUI_GANG.has(targetPillar.pillar), '魁罡');

  return result;
}

function analyzeShensha(pillars) {
  const byPillar = {};
  for (const pos of POSITIONS) {
    byPillar[pos] = shenshaForPillar({ targetPillar: pillars[pos], targetPos: pos, pillars });
  }

  return {
    byPillar,
    lines: POSITIONS.map(pos => ({ position: pos, label: POS_LABEL[pos], items: byPillar[pos] })),
    summary: Object.fromEntries(POSITIONS.map(pos => [pos, byPillar[pos].join('  ')])),
  };
}

module.exports = {
  analyzeShensha,
  shenshaForPillar,
  targetForGroup,
};
