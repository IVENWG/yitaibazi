'use strict';

const { STEM_ELEMENTS, BRANCH_ELEMENTS, HIDDEN_STEMS } = require('../core/constants');
const { branchIndex } = require('../core/utils');
const { ELEMENTS, elementRelation, tenGod } = require('./wuxing');

const STEM_WEIGHT = 10;
const BRANCH_MAIN_WEIGHT = 8;
const HIDDEN_WEIGHTS = [3, 6, 2];

const SEASON_MULTIPLIERS = {
  寅: { 木: 1.4, 火: 1.2, 土: 0.9, 金: 0.7, 水: 0.9 },
  卯: { 木: 1.5, 火: 1.2, 土: 0.8, 金: 0.7, 水: 0.8 },
  辰: { 木: 1.2, 火: 1.0, 土: 1.2, 金: 0.8, 水: 0.8 },
  巳: { 木: 0.9, 火: 1.5, 土: 1.2, 金: 0.8, 水: 0.7 },
  午: { 木: 0.8, 火: 1.6, 土: 1.2, 金: 0.7, 水: 0.7 },
  未: { 木: 0.8, 火: 1.2, 土: 1.4, 金: 0.8, 水: 0.7 },
  申: { 木: 0.7, 火: 0.8, 土: 1.0, 金: 1.5, 水: 1.1 },
  酉: { 木: 0.7, 火: 0.7, 土: 0.9, 金: 1.6, 水: 1.1 },
  戌: { 木: 0.7, 火: 0.9, 土: 1.4, 金: 1.2, 水: 0.8 },
  亥: { 木: 1.1, 火: 0.7, 土: 0.8, 金: 0.9, 水: 1.5 },
  子: { 木: 0.9, 火: 0.7, 土: 0.8, 金: 0.9, 水: 1.6 },
  丑: { 木: 0.8, 火: 0.7, 土: 1.3, 金: 1.0, 水: 1.2 },
};

const SUPPORTING = {
  木: ['木', '水'],
  火: ['火', '木'],
  土: ['土', '火'],
  金: ['金', '土'],
  水: ['水', '金'],
};

const DRAINING = {
  木: ['火', '土', '金'],
  火: ['土', '金', '水'],
  土: ['金', '水', '木'],
  金: ['水', '木', '火'],
  水: ['木', '火', '土'],
};

const USEFUL_FOR_STRONG = {
  木: ['金', '土', '火'],
  火: ['水', '金', '土'],
  土: ['木', '水', '金'],
  金: ['火', '木', '水'],
  水: ['土', '火', '木'],
};

const USEFUL_FOR_WEAK = {
  木: ['水', '木'],
  火: ['木', '火'],
  土: ['火', '土'],
  金: ['土', '金'],
  水: ['金', '水'],
};

function zeroScores() {
  return Object.fromEntries(ELEMENTS.map(element => [element, 0]));
}

function addScore(scores, element, value) {
  if (!element) return;
  scores[element] += value;
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function rawElementScores(pillars) {
  const scores = zeroScores();
  const details = [];

  for (const [position, pillar] of Object.entries(pillars)) {
    const stemElement = STEM_ELEMENTS[pillar.stem];
    const branchElement = BRANCH_ELEMENTS[pillar.branch];
    addScore(scores, stemElement, STEM_WEIGHT);
    addScore(scores, branchElement, BRANCH_MAIN_WEIGHT);

    const hidden = (HIDDEN_STEMS[branchIndex(pillar.branch)] || [])
      .filter(stem => stem && stem.trim())
      .map((stem, index) => {
        const element = STEM_ELEMENTS[stem];
        const weight = HIDDEN_WEIGHTS[index] || 1;
        addScore(scores, element, weight);
        return { stem, element, weight };
      });

    details.push({
      position,
      pillar: pillar.pillar,
      stem: { value: pillar.stem, element: stemElement, weight: STEM_WEIGHT },
      branch: { value: pillar.branch, element: branchElement, weight: BRANCH_MAIN_WEIGHT },
      hiddenStems: hidden,
    });
  }

  return { scores, details };
}

function seasonalizeScores(scores, monthBranch) {
  const multipliers = SEASON_MULTIPLIERS[monthBranch] || Object.fromEntries(ELEMENTS.map(e => [e, 1]));
  return Object.fromEntries(ELEMENTS.map(element => [element, round(scores[element] * multipliers[element])]));
}

function strengthLevel(score) {
  if (score > 20) return '太旺';
  if (score > 5) return '偏旺';
  if (score >= -5) return '中和';
  if (score >= -20) return '偏弱';
  return '太弱';
}

function supportText(dayElement, scores) {
  const same = SUPPORTING[dayElement][0];
  const resource = SUPPORTING[dayElement][1];
  const opposing = DRAINING[dayElement];
  const supportingScore = round(scores[same] + scores[resource]);
  const drainingScore = round(opposing.reduce((sum, element) => sum + scores[element], 0));
  const score = round(supportingScore - drainingScore);
  return { same, resource, opposing, supportingScore, drainingScore, difference: score, score };
}

function classifyPattern(pillars, tenGods, level) {
  const monthHidden = tenGods.month.hiddenStems;
  const mainTenGod = monthHidden[0]?.tenGod || tenGods.month.stem;
  const dayStem = pillars.day.stem;
  const monthBranch = pillars.month.branch;

  if ((dayStem === '甲' && monthBranch === '寅') || (dayStem === '乙' && monthBranch === '卯') ||
      (dayStem === '丙' && monthBranch === '巳') || (dayStem === '丁' && monthBranch === '午') ||
      (dayStem === '戊' && monthBranch === '巳') || (dayStem === '己' && monthBranch === '午') ||
      (dayStem === '庚' && monthBranch === '申') || (dayStem === '辛' && monthBranch === '酉') ||
      (dayStem === '壬' && monthBranch === '亥') || (dayStem === '癸' && monthBranch === '子')) {
    return '建禄格';
  }

  if ((dayStem === '甲' && monthBranch === '卯') || (dayStem === '乙' && monthBranch === '寅') ||
      (dayStem === '丙' && monthBranch === '午') || (dayStem === '丁' && monthBranch === '巳') ||
      (dayStem === '戊' && monthBranch === '午') || (dayStem === '己' && monthBranch === '巳') ||
      (dayStem === '庚' && monthBranch === '酉') || (dayStem === '辛' && monthBranch === '申') ||
      (dayStem === '壬' && monthBranch === '子') || (dayStem === '癸' && monthBranch === '亥')) {
    return '月刃格';
  }

  if (['太旺', '太弱'].includes(level)) return `${level}格局待详断`;
  return mainTenGod && mainTenGod !== '比肩' ? `${mainTenGod}格` : '普通格局';
}

function pickUsefulGods(dayElement, level) {
  if (level === '中和') {
    const useful = USEFUL_FOR_STRONG[dayElement].slice(0, 2);
    return { useful, favorable: useful, unfavorable: [], reason: '日主中和，喜用需结合调候与格局细断；此处先取能流通命局者。' };
  }

  if (level === '太旺' || level === '偏旺') {
    const useful = USEFUL_FOR_STRONG[dayElement];
    return {
      useful,
      favorable: useful,
      unfavorable: USEFUL_FOR_WEAK[dayElement],
      reason: '日主偏旺，宜取克、泄、耗之五行平衡命局。',
    };
  }

  const useful = USEFUL_FOR_WEAK[dayElement];
  return {
    useful,
    favorable: useful,
    unfavorable: USEFUL_FOR_STRONG[dayElement],
    reason: '日主偏弱，宜取生扶日主之印比为喜用。',
  };
}

function analyzeStrength(pillars, tenGods) {
  const dayElement = STEM_ELEMENTS[pillars.day.stem];
  const raw = rawElementScores(pillars);
  const scores = seasonalizeScores(raw.scores, pillars.month.branch);
  const support = supportText(dayElement, scores);
  const level = strengthLevel(support.score);
  const gods = pickUsefulGods(dayElement, level);
  const pattern = classifyPattern(pillars, tenGods, level);

  return {
    dayMaster: { stem: pillars.day.stem, element: dayElement },
    scores,
    rawScores: Object.fromEntries(ELEMENTS.map(element => [element, round(raw.scores[element])])),
    scoreDetails: raw.details,
    sameParty: SUPPORTING[dayElement],
    differentParty: DRAINING[dayElement],
    samePartyScore: support.supportingScore,
    differentPartyScore: support.drainingScore,
    difference: support.difference,
    score: support.score,
    level,
    pattern,
    usefulGods: gods.useful,
    favorable: gods.favorable,
    unfavorable: gods.unfavorable,
    advice: gods.reason,
  };
}

module.exports = {
  analyzeStrength,
  strengthLevel,
  rawElementScores,
  seasonalizeScores,
};
