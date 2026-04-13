/**
 * dashboard.js — Hub world dashboard for PhysicsQuest
 *
 * Renders the main landing page: hero section with player stats,
 * course realm cards, streak display, daily challenge, and stats.
 */

import store from '../store.js';
import { getLevelProgress, getLevelTitle, XP_REWARDS } from '../xp.js';
import { formatNumber, formatTime, dateToKey } from '../utils.js';
import soundManager from '../sound.js';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const COURSES = [
  {
    id: 'mechanics',
    title: 'Classical Mechanics',
    subtitle: 'Forces, Motion & Energy',
    icon: '\u2699\ufe0f',
    color: 'var(--mechanics-color)',
    totalLessons: 21,
  },
  {
    id: 'electromagnetism',
    title: 'Electromagnetism',
    subtitle: 'Fields, Circuits & Waves',
    icon: '\u26a1',
    color: 'var(--em-color)',
    totalLessons: 20,
  },
  {
    id: 'waves-quantum',
    title: 'Waves & Quantum',
    subtitle: 'Oscillations to Uncertainty',
    icon: '\ud83c\udf0a',
    color: 'var(--waves-color)',
    totalLessons: 15,
  },
];

const CHALLENGE_TYPES = ['Quick Quiz', 'Speed Run', 'Experiment', 'Reading', 'Calculation'];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getCourseProgress(courseId) {
  const lectures = store.get(`courses.${courseId}.lectures`) || {};
  return Object.values(lectures).filter((l) => l.watched).length;
}

function getDailyChallenge() {
  const today = dateToKey(new Date());
  const dayOfYear = Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  const type = CHALLENGE_TYPES[dayOfYear % CHALLENGE_TYPES.length];
  const completed = store.get(`dailyChallenges.${today}`)?.completed || false;
  return { type, completed, date: today };
}

/* ------------------------------------------------------------------ */
/*  Render                                                             */
/* ------------------------------------------------------------------ */

/**
 * Render the dashboard hub world.
 * @param {Object} params  Route params (unused for dashboard)
 * @param {HTMLElement} container  The #content element
 */
export function renderDashboard(params, container) {
  const xp = store.get('player.xp') || 0;
  const progress = getLevelProgress(xp);
  const level = progress.level;
  const title = getLevelTitle(level);
  const pct = Math.round(progress.progress * 100);
  const streak = store.get('streak.current') || 0;
  const longestStreak = store.get('streak.longest') || 0;
  const playerName = store.get('player.name') || 'Physicist';

  const stats = {
    totalXP: xp,
    quizzes: store.get('stats.totalQuizzesTaken') || 0,
    bosses: store.get('stats.bossesDefeated') || 0,
    studyTime: store.get('player.totalStudyTimeMs') || 0,
  };

  const challenge = getDailyChallenge();

  // Build course cards
  const courseCardsHTML = COURSES.map((course) => {
    const completed = getCourseProgress(course.id);
    const pctDone = course.totalLessons > 0
      ? Math.round((completed / course.totalLessons) * 100)
      : 0;
    const started = completed > 0;

    return `
      <div class="course-realm-card" data-course="${course.id}" style="--course-color: ${course.color};">
        <div class="course-realm-card__icon">${course.icon}</div>
        <div class="course-realm-card__info">
          <h3 class="course-realm-card__title">${course.title}</h3>
          <p class="course-realm-card__subtitle">${course.subtitle}</p>
          <div class="progress-bar" style="margin-top: 12px;">
            <div class="progress-bar__fill" style="width: ${pctDone}%; background: ${course.color};"></div>
          </div>
          <p class="course-realm-card__progress">${completed} / ${course.totalLessons} lessons \u2022 ${pctDone}%</p>
        </div>
        <button class="btn btn--primary btn--sm course-realm-card__btn">${started ? 'Continue' : 'Start'}</button>
      </div>`;
  }).join('');

  // Streak flame size
  const flameClass = streak >= 15 ? 'streak--inferno' : streak >= 7 ? 'streak--large' : streak >= 4 ? 'streak--medium' : 'streak--small';

  container.innerHTML = `
    <div class="dashboard dashboard--grid animate-fade-in">

      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-section__avatar">
          <div class="hero-section__level-badge">${level}</div>
        </div>
        <div class="hero-section__info">
          <h1 class="hero-section__greeting">Welcome back, ${playerName}</h1>
          <p class="hero-section__title">${title}</p>
          <div class="hero-section__xp-bar">
            <div class="progress-bar progress-bar--lg">
              <div class="progress-bar__fill progress-bar__fill--xp" style="width: ${pct}%;"></div>
            </div>
            <p class="hero-section__xp-text">Level ${level} \u2022 ${formatNumber(xp)} XP \u2022 ${pct}% to next level</p>
          </div>
        </div>
      </div>

      <!-- Course Realms -->
      <div class="course-realms">
        <h2 class="section-title">Choose Your Realm</h2>
        <div class="course-realms__grid">
          ${courseCardsHTML}
        </div>
      </div>

      <!-- Streak Card -->
      <div class="streak-card card">
        <div class="streak-card__flame ${flameClass}">\ud83d\udd25</div>
        <div class="streak-card__info">
          <h3 class="streak-card__count">${streak} Day Streak</h3>
          <p class="streak-card__longest">Longest: ${longestStreak} days</p>
          ${streak >= 5 ? `<p class="streak-card__next">Next milestone: ${streak < 7 ? '7' : streak < 14 ? '14' : streak < 30 ? '30' : '100'} days</p>` : ''}
        </div>
      </div>

      <!-- Daily Challenge Card -->
      <div class="daily-challenge-card card">
        <div class="daily-challenge-card__header">
          <span class="daily-challenge-card__badge">${challenge.completed ? '\u2705' : '\u2728'}</span>
          <h3>Daily Challenge</h3>
        </div>
        <p class="daily-challenge-card__type">${challenge.type}</p>
        <p class="daily-challenge-card__reward">+${XP_REWARDS.daily_challenge} XP</p>
        ${challenge.completed
          ? '<p class="daily-challenge-card__done">Completed today!</p>'
          : '<button class="btn btn--secondary btn--sm daily-challenge-btn">Start Challenge</button>'
        }
      </div>

      <!-- Quick Resume -->
      <div class="quick-resume card">
        <h3>Quick Resume</h3>
        <p class="quick-resume__text">Pick up where you left off</p>
        <a href="#/courses" class="btn btn--ghost btn--sm">Browse Courses</a>
      </div>

      <!-- Stats Overview -->
      <div class="stats-overview">
        <h2 class="section-title">Your Stats</h2>
        <div class="stats-overview__grid">
          <div class="stat-card">
            <div class="stat-card__value">${formatNumber(stats.totalXP)}</div>
            <div class="stat-card__label">Total XP</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__value">${stats.quizzes}</div>
            <div class="stat-card__label">Quizzes Taken</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__value">${stats.bosses}</div>
            <div class="stat-card__label">Bosses Defeated</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__value">${formatTime(stats.studyTime)}</div>
            <div class="stat-card__label">Study Time</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  attachDashboardEvents(container);
}

/* ------------------------------------------------------------------ */
/*  Events                                                             */
/* ------------------------------------------------------------------ */

function attachDashboardEvents(container) {
  // Course cards: navigate to course
  container.querySelectorAll('.course-realm-card').forEach((card) => {
    card.addEventListener('click', () => {
      const courseId = card.dataset.course;
      soundManager.play('click');
      window.location.hash = `#/courses/${courseId}`;
    });
  });

  // Daily challenge button
  const challengeBtn = container.querySelector('.daily-challenge-btn');
  if (challengeBtn) {
    challengeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.play('click');
      window.location.hash = '#/challenges';
    });
  }
}
