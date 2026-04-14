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
    icon: '⚙️',
    color: 'var(--mechanics-color)',
    modifier: 'mechanics',
    totalLessons: 21,
  },
  {
    id: 'electromagnetism',
    title: 'Electromagnetism',
    subtitle: 'Fields, Circuits & Waves',
    icon: '⚡',
    color: 'var(--em-color)',
    modifier: 'em',
    totalLessons: 20,
  },
  {
    id: 'waves-quantum',
    title: 'Waves & Quantum',
    subtitle: 'Oscillations to Uncertainty',
    icon: '🌊',
    color: 'var(--waves-color)',
    modifier: 'waves',
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

  /* Build realm cards — each is a full <a> so the whole card is clickable */
  const courseCardsHTML = COURSES.map((course) => {
    const completed = getCourseProgress(course.id);
    const pctDone = course.totalLessons > 0
      ? Math.round((completed / course.totalLessons) * 100)
      : 0;
    const started = completed > 0;

    return `
      <a href="#/courses/${course.id}" class="realm-card realm-card--${course.modifier}">
        <div class="realm-card__icon">${course.icon}</div>
        <div class="realm-card__name">${course.title}</div>
        <div class="realm-card__description">${course.subtitle}</div>
        <div class="realm-card__progress">
          <div class="realm-card__progress-header">
            <span>${completed} / ${course.totalLessons} lessons</span>
            <span>${pctDone}%</span>
          </div>
          <div class="progress-bar progress-bar--sm">
            <div class="progress-bar__fill" style="width: ${pctDone}%;"></div>
          </div>
        </div>
        <div class="realm-card__cta">
          <span class="btn btn--primary btn--sm" aria-hidden="true">
            ${started ? 'Continue →' : 'Start →'}
          </span>
        </div>
      </a>`;
  }).join('');

  /* Streak flame intensity */
  const flameClass = streak >= 15 ? 'streak--inferno'
    : streak >= 7 ? 'streak--large'
    : streak >= 4 ? 'streak--medium'
    : 'streak--small';

  /* Next streak milestone */
  const nextMilestone = streak < 7 ? 7 : streak < 14 ? 14 : streak < 30 ? 30 : 100;

  container.innerHTML = `
    <div class="dashboard dashboard--grid animate-fade-in">

      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-avatar">
          <div class="hero-avatar__image">⚛</div>
          <div class="hero-avatar__level">${level}</div>
        </div>
        <div class="hero-info">
          <div class="hero-info__greeting">Welcome back</div>
          <h1 class="hero-info__name">${playerName}</h1>
          <div class="hero-info__title"><span>✦</span> ${title}</div>
          <div class="hero-xp">
            <div class="hero-xp__header">
              <span class="hero-xp__label">Level ${level}</span>
              <span class="hero-xp__value">${formatNumber(xp)} XP &bull; ${pct}% to next</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar__fill progress-bar__fill--gold" style="width: ${pct}%;"></div>
            </div>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <div class="hero-stat__value">${streak}</div>
              <div class="hero-stat__label">Day Streak</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat__value">${stats.quizzes}</div>
              <div class="hero-stat__label">Quizzes</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat__value">${stats.bosses}</div>
              <div class="hero-stat__label">Bosses</div>
            </div>
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
      <div class="streak-card">
        <div class="streak-flame ${flameClass}">🔥</div>
        <div class="streak-info">
          <div class="streak-info__count">${streak}</div>
          <div class="streak-info__label">Day Streak</div>
          <div class="streak-info__sub">Best: ${longestStreak} days</div>
          ${streak > 0 ? `<div class="streak-info__next">Next milestone: ${nextMilestone} days</div>` : ''}
        </div>
      </div>

      <!-- Daily Challenge Card -->
      <div class="daily-challenge-card">
        <span class="daily-challenge-card__badge">${challenge.completed ? '✅' : '✨'}</span>
        <div class="daily-challenge-card__icon">🎯</div>
        <div class="daily-challenge-card__title">Daily Challenge</div>
        <div class="daily-challenge-card__description">${challenge.type}</div>
        <div class="daily-challenge-card__reward">⚡ +${XP_REWARDS.daily_challenge} XP</div>
        ${challenge.completed
          ? '<p class="daily-challenge-card__done">✓ Completed today!</p>'
          : '<button class="btn btn--secondary btn--sm daily-challenge-btn" type="button">Start Challenge</button>'
        }
      </div>

      <!-- Quick Resume -->
      <div class="quick-resume">
        <div class="quick-resume__eyebrow">Continue Learning</div>
        <div class="quick-resume__title">Browse Courses</div>
        <div class="quick-resume__subtitle">Pick up where you left off</div>
        <a href="#/courses" class="btn btn--success btn--sm quick-resume__btn">
          View All Courses →
        </a>
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

  attachDashboardEvents(container);
}

/* ------------------------------------------------------------------ */
/*  Events                                                             */
/* ------------------------------------------------------------------ */

function attachDashboardEvents(container) {
  /* Daily challenge button */
  const challengeBtn = container.querySelector('.daily-challenge-btn');
  if (challengeBtn) {
    challengeBtn.addEventListener('click', () => {
      soundManager.play('click');
      window.location.hash = '#/challenges';
    });
  }
}
