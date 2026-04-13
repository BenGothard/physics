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
  let quizId = null;

  if (challenge.type === 'Quick Quiz') {
    const courses = ['mechanics', 'electromagnetism', 'waves-quantum'];
    const course = courses[Math.floor(random() * courses.length)];
    quizId = `${course}-kinematics`;
    description = `Complete a quick quiz on ${course}`;
  } else if (challenge.type === 'Speed Run') {
    description = 'Complete a quiz in under 2 minutes';
  } else if (challenge.type === 'Experiment') {
    const sims = ['projectile', 'spring', 'orbits', 'collisions', 'waves'];
    const sim = sims[Math.floor(random() * sims.length)];
    description = `Spend 10+ minutes in the ${sim} simulation`;
  } else if (challenge.type === 'Reading') {
    description = 'Read one chapter from the Feynman Lectures';
  } else {
    description = 'Solve a multi-step physics problem';
  }

  return { ...challenge, description, quizId };
}
