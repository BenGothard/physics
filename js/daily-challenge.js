/**
 * daily-challenge.js — Deterministic daily challenge generator
 */
import { dateToKey, seededRandom } from './utils.js';

const CHALLENGE_TYPES = ['Quick Quiz', 'Speed Run', 'Experiment', 'Reading', 'Calculation'];

export function getDailyChallenge() {
  const today = dateToKey(new Date());
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const typeIndex = dayOfYear % CHALLENGE_TYPES.length;
  const type = CHALLENGE_TYPES[typeIndex];

  return { type, date: today, dayOfYear };
}

export function generateDailyChallenge() {
  const challenge = getDailyChallenge();
  const seed = challenge.dayOfYear;
  const random = seededRandom(seed);

  let description = '';
  // Only link to quizzes that actually exist
  let quizId = 'mech-kinematics';

  if (challenge.type === 'Quick Quiz') {
    description = 'Complete the kinematics quiz';
  } else if (challenge.type === 'Speed Run') {
    description = 'Complete the kinematics quiz in under 2 minutes';
  } else if (challenge.type === 'Experiment') {
    const sims = ['projectile', 'spring', 'pendulum'];
    const sim = sims[Math.floor(random() * sims.length)];
    description = `Spend 10+ minutes in the ${sim} simulation`;
    quizId = null;
  } else if (challenge.type === 'Reading') {
    description = 'Read one chapter from the Feynman Lectures';
    quizId = null;
  } else {
    description = 'Solve a multi-step physics problem';
  }

  return { ...challenge, description, quizId };
}
