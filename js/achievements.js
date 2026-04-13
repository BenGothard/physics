/**
 * achievements.js — Achievement checking and unlocking engine
 */
import store from './store.js';

export function checkAchievements() {
  const achievements = [
    {
      id: 'first-steps',
      check: () => {
        const watched = Object.values(store.get('courses.mechanics.lectures') || {})
          .concat(Object.values(store.get('courses.electromagnetism.lectures') || {}))
          .concat(Object.values(store.get('courses.waves-quantum.lectures') || {}))
          .some(l => l && l.watched);
        return watched;
      }
    },
    {
      id: 'newtons-apprentice',
      check: () => Object.values(store.get('courses.mechanics.lectures') || {}).some(l => l && l.watched)
    },
    {
      id: 'coulombs-student',
      check: () => Object.values(store.get('courses.electromagnetism.lectures') || {}).some(l => l && l.watched)
    },
    {
      id: 'wave-beginner',
      check: () => Object.values(store.get('courses.waves-quantum.lectures') || {}).some(l => l && l.watched)
    },
  ];

  const unlockedAchievements = store.get('achievements') || {};

  achievements.forEach(ach => {
    if (!unlockedAchievements[ach.id] && ach.check()) {
      store.set(`achievements.${ach.id}`, { unlocked: true, unlockedAt: new Date().toISOString() });
      store.emit('achievement-unlocked', { id: ach.id });
    }
  });
}
