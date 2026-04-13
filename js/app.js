/**
 * app.js — Main entry point for PhysicsQuest
 *
 * Sets up the router, navigation, streak tracking,
 * daily login XP, and event listeners.
 */

import { Router } from './router.js';
import store from './store.js';
import { renderNav, updateNav } from './components/nav.js';
import { renderDashboard } from './pages/dashboard.js';
import { getLevelProgress, getLevelTitle, awardXP } from './xp.js';
import { dateToKey, isToday } from './utils.js';
import soundManager from './sound.js';

/* ------------------------------------------------------------------ */
/*  Stub page renderer for pages not yet implemented                   */
/* ------------------------------------------------------------------ */

function stubPage(name) {
  return (params, container) => {
    container.innerHTML = `
      <div class="page animate-fade-in" style="text-align:center; padding: 60px 20px;">
        <h1 style="font-size: 2rem; margin-bottom: 16px;">${name}</h1>
        <p style="color: var(--text-secondary);">Coming soon...</p>
        <a href="#/" class="btn btn--primary" style="margin-top: 24px;">Back to Dashboard</a>
      </div>`;
  };
}

/* ------------------------------------------------------------------ */
/*  Streak helpers                                                     */
/* ------------------------------------------------------------------ */

function updateStreak() {
  const today = dateToKey(new Date());
  const lastActive = store.get('streak.lastActiveDate');

  if (lastActive === today) {
    // Already logged in today — nothing to do
    return;
  }

  // Calculate yesterday's key
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = dateToKey(yesterday);

  let current = store.get('streak.current') || 0;

  if (lastActive === yesterdayKey) {
    // Consecutive day — increment streak
    current += 1;
  } else if (lastActive !== today) {
    // Streak broken (or first visit ever) — reset to 1
    current = 1;
  }

  store.set('streak.current', current);
  store.set('streak.lastActiveDate', today);

  // Update longest streak
  const longest = store.get('streak.longest') || 0;
  if (current > longest) {
    store.set('streak.longest', current);
  }

  // Streak milestone XP rewards
  if (current === 7) {
    awardXP('streak_7');
  } else if (current === 30) {
    awardXP('streak_30');
  }
}

/**
 * Award daily login XP if the player hasn't received it today.
 */
function awardDailyLoginXP() {
  const today = dateToKey(new Date());
  const lastLoginReward = store.get('dailyChallenges._lastLoginXP');

  if (lastLoginReward !== today) {
    awardXP('daily_login');
    store.set('dailyChallenges._lastLoginXP', today);
  }
}

/* ------------------------------------------------------------------ */
/*  Loading screen                                                     */
/* ------------------------------------------------------------------ */

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) return;

  loadingScreen.style.transition = 'opacity 400ms ease';
  loadingScreen.style.opacity = '0';

  setTimeout(() => {
    loadingScreen.remove();
  }, 400);
}

/* ------------------------------------------------------------------ */
/*  Boot                                                               */
/* ------------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  // 1. Create nav container
  const navEl = document.createElement('nav');
  navEl.id = 'main-nav';
  app.appendChild(navEl);
  renderNav(navEl);

  // 2. Create main content container
  const main = document.createElement('main');
  main.id = 'content';
  app.appendChild(main);

  // 3. Create the router targeting #content
  const router = new Router('#content');

  // 4. Register all routes
  router
    .on('#/', renderDashboard)
    .on('#/courses', stubPage('Courses'))
    .on('#/courses/:courseId', stubPage('Course Overview'))
    .on('#/courses/:courseId/:lessonId', stubPage('Lesson'))
    .on('#/quiz/:quizId', stubPage('Quiz'))
    .on('#/profile', stubPage('Profile'))
    .on('#/skill-tree', stubPage('Skill Tree'))
    .on('#/boss/:bossId', stubPage('Boss Battle'))
    .on('#/challenges', stubPage('Challenges'))
    .on('#/sandbox', stubPage('Sandbox'))
    .on('#/leaderboard', stubPage('Leaderboard'))
    .on('#/settings', stubPage('Settings'));

  // 5. 404 handler
  router.notFound((params, container) => {
    container.innerHTML = `
      <div class="page animate-fade-in" style="text-align:center; padding: 80px 20px;">
        <h1 style="font-size: 3rem; margin-bottom: 8px; color: var(--accent-purple);">404</h1>
        <p style="font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 24px;">
          Page not found — this region of the universe hasn't been discovered yet.
        </p>
        <a href="#/" class="btn btn--primary">Back to Dashboard</a>
      </div>`;
  });

  // 6. Update streak on load
  updateStreak();

  // 7. Listen for store events to keep nav in sync
  store.on('xp-gained', () => {
    updateNav();
    soundManager.play('xpGain');
  });

  store.on('level-up', (data) => {
    updateNav();
    soundManager.play('levelUp');
  });

  // 8. Hide the loading screen
  hideLoadingScreen();

  // 9. Initialise the router (resolves current hash)
  router.init();

  // 10. Award daily login XP if first visit today
  awardDailyLoginXP();
});
