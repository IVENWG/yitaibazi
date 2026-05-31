'use strict';

const { STEM_ELEMENTS, BRANCH_ELEMENTS, HIDDEN_STEMS, HEAVENLY_STEMS, EARTHLY_BRANCHES } = require('../core/constants');
const { branchIndex } = require('../core/utils');

const ELEMENTS = ['木', '火', '土', '金', '水'];

function analyzeWuxing(pillars) {
  const counts = Object.fromEntries(ELEMENTS.map(e => [e, 0]));
  const detail = [];

  for (const [position, pillar] of Object.entries(pillars)) {
    const stemEl = STEM_ELEMENTS[pillar.stem];
    const branchEl = BRANCH_ELEMENTS[pillar.branch];
    if (stemEl) counts[stemEl] += 1;
    if (branchEl) counts[branchEl] += 1;

    const hidden = HIDDEN_STEMS[branchIndex(pillar.branch)] || [];
    const hiddenElements = hidden.filter(s => s && s.trim()).map(stem => ({ stem, element: STEM_ELEMENTS[stem] }));
    for (const h of hiddenElements) {
      if (h.element) counts[h.element] += 0.5;
    }

    detail.push({
      position,
      pillar: pillar.pillar,
      stem: { value: pillar.stem, element: stemEl },
      branch: { value: pillar.branch, element: branchEl },
      hiddenStems: hiddenElements,
    });
  }

  const strongest = ELEMENTS.slice().sort((a, b) => counts[b] - counts[a])[0];
  const weakest = ELEMENTS.slice().sort((a, b) => counts[a] - counts[b])[0];

  return { counts, detail, strongest, weakest };
}

function elementRelation(from, to) {
  if (from === to) return '比和';
  const generates = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const controls = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  if (generates[from] === to) return '我生';
  if (generates[to] === from) return '生我';
  if (controls[from] === to) return '我克';
  if (controls[to] === from) return '克我';
  return '未知';
}

function yinYangOfStem(stem) {
  const index = HEAVENLY_STEMS.indexOf(stem);
  if (index <= 0) return null;
  return index % 2 === 1 ? '阳' : '阴';
}

/**
 * 十神判定。
 * 简写沿用原软件：比、劫、食、伤、才、财、官、杀、印、枭。
 */
function tenGod(dayStem, otherStem) {
  const dayElement = STEM_ELEMENTS[dayStem];
  const otherElement = STEM_ELEMENTS[otherStem];
  const samePolarity = yinYangOfStem(dayStem) === yinYangOfStem(otherStem);
  const relation = elementRelation(dayElement, otherElement);

  if (relation === '比和') return samePolarity ? '比肩' : '劫财';
  if (relation === '我生') return samePolarity ? '食神' : '伤官';
  if (relation === '我克') return samePolarity ? '偏财' : '正财';
  if (relation === '克我') return samePolarity ? '七杀' : '正官';
  if (relation === '生我') return samePolarity ? '偏印' : '正印';
  return '未知';
}

function analyzeTenGods(pillars) {
  const dayStem = pillars.day.stem;
  const result = {};
  for (const [position, pillar] of Object.entries(pillars)) {
    result[position] = {
      stem: tenGod(dayStem, pillar.stem),
      hiddenStems: (HIDDEN_STEMS[branchIndex(pillar.branch)] || [])
        .filter(s => s && s.trim())
        .map(stem => ({ stem, tenGod: tenGod(dayStem, stem) })),
    };
  }
  return result;
}

module.exports = {
  ELEMENTS,
  analyzeWuxing,
  elementRelation,
  tenGod,
  analyzeTenGods,
};
