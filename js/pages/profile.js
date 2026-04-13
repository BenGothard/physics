/**
 * profile.js — Player profile with stats and achievements
 */
import store from '../store.js';

export function renderProfile(params, container) {
  const xp = store.get('player.xp') || 0;
  const level = store.get('player.level') || 1;
  const title = store.get('player.title') || 'Curious Observer';
  const stats = store.get('stats') || {};
  const achievements = store.get('achievements') || {};

  const achievementCount = Object.keys(achievements).filter(k => achievements[k].unlocked).length;

  container.innerHTML = `
    <div class="page animate-fade-in" style="padding: 40px 20px;">
      <h1>Player Profile</h1>

      <div class="profile-card card" style="margin: 24px 0;">
        <h2 style="font-size: 2rem;">${level}</h2>
        <p style="color: var(--text-secondary); font-size: 1.2rem;">${title}</p>
        <p style="color: var(--xp-gold); margin-top: 8px;">${xp} Total XP</p>
      </div>

      <h2 style="margin-top: 32px;">Statistics</h2>
      <div class="stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;">
        <div class="stat card" style="padding: 16px; text-align: center;">
          <div style="font-size: 1.5rem; color: var(--accent-blue);">${stats.totalQuizzesTaken || 0}</div>
          <div style="color: var(--text-secondary); font-size: 0.9rem;">Quizzes Taken</div>
        </div>
        <div class="stat card" style="padding: 16px; text-align: center;">
          <div style="font-size: 1.5rem; color: var(--accent-green);">${stats.bossesDefeated || 0}</div>
          <div style="color: var(--text-secondary); font-size: 0.9rem;">Bosses Defeated</div>
        </div>
        <div class="stat card" style="padding: 16px; text-align: center;">
          <div style="font-size: 1.5rem; color: var(--accent-purple);">${stats.totalCorrectAnswers || 0}</div>
          <div style="color: var(--text-secondary); font-size: 0.9rem;">Correct Answers</div>
        </div>
        <div class="stat card" style="padding: 16px; text-align: center;">
          <div style="font-size: 1.5rem; color: var(--accent-cyan);">${achievementCount}</div>
          <div style="color: var(--text-secondary); font-size: 0.9rem;">Achievements</div>
        </div>
      </div>

      <h2 style="margin-top: 32px;">Achievements</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; margin: 16px 0;">
        ${Object.entries(achievements).map(([id, ach]) => `
          <div style="padding: 8px; text-align: center; background: var(--bg-card); border-radius: 8px;">
            ${ach.unlocked ? '🏆' : '🔒'}
            <p style="font-size: 0.8rem; color: var(--text-secondary);">${id}</p>
          </div>
        `).join('')}
      </div>
    </div>`;
}
