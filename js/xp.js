/**
 * xp.js — XP and leveling engine for PhysicsQuest
 *
 * Handles XP rewards, level calculations, physics-themed titles,
 * and awarding XP through the store.
 */

import store from './store.js';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** XP values awarded for each action type. */
export const XP_REWARDS = Object.freeze({
  lecture: 100,
  reading: 100,
  quiz_base: 50,
  quiz_correct: 15,
  quiz_perfect: 75,
  simulation: 40,
  daily_challenge: 60,
  boss_battle: 200,
  boss_perfect: 300,
  daily_login: 10,
  streak_7: 150,
  streak_30: 500,
});

/** Physics-themed title tiers. */
export const LEVEL_TITLES = Object.freeze([
  { min: 1, max: 5, title: 'Curious Observer' },
  { min: 6, max: 10, title: 'Apprentice Experimenter' },
  { min: 11, max: 20, title: 'Lab Technician' },
  { min: 21, max: 30, title: 'Research Associate' },
  { min: 31, max: 40, title: 'Theoretical Thinker' },
  { min: 41, max: 50, title: 'Quantum Explorer' },
  { min: 51, max: 60, title: 'Field Master' },
  { min: 61, max: 70, title: 'Principal Investigator' },
  { min: 71, max: 80, title: 'Distinguished Physicist' },
  { min: 81, max: 90, title: 'Nobel Candidate' },
  { min: 91, max: 99, title: 'Physics Grandmaster' },
  { min: 100, max: 100, title: 'Feynman Level' },
]);

/* ------------------------------------------------------------------ */
/*  Level / XP maths                                                   */
/* ------------------------------------------------------------------ */

/**
 * Total XP required to reach a given level.
 * XP for level N = sum of thresholds from 1..N where each threshold = 100 * n^1.5
 *
 * Level 1 requires 0 XP (starting level).
 * @param {number} level
 * @returns {number}
 */
export function xpForLevel(level) {
  if (level <= 1) return 0;
  let total = 0;
  for (let n = 1; n < level; n++) {
    total += Math.floor(100 * Math.pow(n, 1.5));
  }
  return total;
}

/**
 * Calculate the player's level from their total XP.
 * @param {number} totalXP
 * @returns {number}
 */
export function calculateLevel(totalXP) {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
}

/**
 * XP remaining until the next level.
 * @param {number} currentXP
 * @returns {number}
 */
export function xpToNextLevel(currentXP) {
  const level = calculateLevel(currentXP);
  const nextThreshold = xpForLevel(level + 1);
  return nextThreshold - currentXP;
}

/**
 * Detailed level-progress breakdown.
 * @param {number} currentXP
 * @returns {{ level: number, currentLevelXP: number, nextLevelXP: number, progress: number }}
 */
export function getLevelProgress(currentXP) {
  const level = calculateLevel(currentXP);
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const span = nextLevelXP - currentLevelXP;
  const progress = span > 0 ? (currentXP - currentLevelXP) / span : 1;

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    progress: Math.min(Math.max(progress, 0), 1),
  };
}

/**
 * Return the physics-themed title for a given level.
 * @param {number} level
 * @returns {string}
 */
export function getLevelTitle(level) {
  for (const tier of LEVEL_TITLES) {
    if (level >= tier.min && level <= tier.max) {
      return tier.title;
    }
  }
  // Beyond level 100
  return 'Feynman Level';
}

/* ------------------------------------------------------------------ */
/*  Award XP                                                           */
/* ------------------------------------------------------------------ */

/**
 * Award XP for an action, persist to store, and emit events.
 *
 * @param {string} action   Key from XP_REWARDS (e.g. "lecture", "quiz_correct")
 * @param {Object} [details={}]  Extra context:
 *   - `correctAnswers` {number} — for quiz_correct, multiply per answer
 *   - `multiplier` {number} — optional XP multiplier (default 1)
 * @returns {{ xpGained: number, newTotal: number, leveledUp: boolean, newLevel: number, newTitle: string }}
 */
export function awardXP(action, details = {}) {
  const baseXP = XP_REWARDS[action];
  if (baseXP === undefined) {
    console.warn(`xp.js: unknown action "${action}"`);
    return { xpGained: 0, newTotal: store.get('player.xp'), leveledUp: false, newLevel: store.get('player.level'), newTitle: store.get('player.title') };
  }

  let xpGained = baseXP;

  // For quiz_correct, multiply by number of correct answers
  if (action === 'quiz_correct' && typeof details.correctAnswers === 'number') {
    xpGained = baseXP * details.correctAnswers;
  }

  // Optional multiplier (streak bonus, etc.)
  if (typeof details.multiplier === 'number') {
    xpGained = Math.round(xpGained * details.multiplier);
  }

  // Current state
  const previousXP = store.get('player.xp') || 0;
  const previousLevel = store.get('player.level') || 1;

  // Update XP
  const newTotal = previousXP + xpGained;
  store.set('player.xp', newTotal);

  // Recalculate level
  const newLevel = calculateLevel(newTotal);
  const newTitle = getLevelTitle(newLevel);
  const leveledUp = newLevel > previousLevel;

  // Persist level and title
  if (leveledUp) {
    store.set('player.level', newLevel);
    store.set('player.title', newTitle);
  }

  // Emit events
  store.emit('xp-gained', {
    action,
    xpGained,
    newTotal,
    previousXP,
  });

  if (leveledUp) {
    store.emit('level-up', {
      previousLevel,
      newLevel,
      newTitle,
    });
  }

  return {
    xpGained,
    newTotal,
    leveledUp,
    newLevel,
    newTitle,
  };
}
