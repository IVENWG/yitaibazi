'use strict';

const { HEAVENLY_STEMS } = require('./constants');

const CHANG_SHENG = ['长', '沐', '冠', '临', '帝', '衰', '病', '死', '墓', '绝', '胎', '养'];

const START_BRANCH = {
  甲: '亥', 丙: '寅', 戊: '寅', 庚: '巳', 壬: '申',
  乙: '午', 丁: '酉', 己: '酉', 辛: '子', 癸: '卯',
};

const BRANCH_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 十二长生，复刻 ah.j_ref(dayStem, branch) 的输出简写。
 */
function changsheng(dayStem, branch) {
  const start = START_BRANCH[dayStem];
  if (!start) return '';

  const startIndex = BRANCH_ORDER.indexOf(start);
  const targetIndex = BRANCH_ORDER.indexOf(branch);
  if (targetIndex < 0) return '';

  const stemIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const isYang = stemIndex % 2 === 1;
  const offset = isYang
    ? (targetIndex - startIndex + 12) % 12
    : (startIndex - targetIndex + 12) % 12;

  return CHANG_SHENG[offset];
}

function fourBranchStrengths(pillars) {
  const dayStem = pillars.day.stem;
  return {
    year: changsheng(dayStem, pillars.year.branch),
    month: changsheng(dayStem, pillars.month.branch),
    day: changsheng(dayStem, pillars.day.branch),
    hour: changsheng(dayStem, pillars.hour.branch),
  };
}

module.exports = {
  changsheng,
  fourBranchStrengths,
};
