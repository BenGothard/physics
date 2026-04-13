/**
 * streak.js — Streak tracking with freezes and milestones
 */
import store from './store.js';
import { dateToKey } from './utils.js';

export function updateStreakOnActivity() {
  const today = dateToKey(new Date());
  const lastActive = store.get('streak.lastActiveDate');

  if (lastActive === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = dateToKey(yesterday);

  let current = store.get('streak.current') || 0;

  if (lastActive === yesterdayKey) {
    current += 1;
  } else if (lastActive) {
    current = 1;
  } else {
    current = 1;
  }

  store.set('streak.current', current);
  store.set('streak.lastActiveDate', today);

  const longest = store.get('streak.longest') || 0;
  if (current > longest) {
    store.set('streak.longest', current);
  }

  store.emit('streak-updated', { current, longest });
}
