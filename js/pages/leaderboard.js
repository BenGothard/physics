/**
 * leaderboard.js — Personal bests and achievements
 */
import store from '../store.js';

export function renderLeaderboard(params, container) {
  const xp = store.get('player.xp') || 0;
  const level = store.get('player.level') || 1;
  const stats = store.get('stats') || {};

  container.innerHTML = `
    <div class="page animate-fade-in" style="padding: 40px 20px;">
      <h1>Personal Bests</h1>

      <div style="max-width: 600px; margin: 24px auto;">
        <h2>All-Time Stats</h2>
        <div class="leaderboard-item card" style="display: flex; justify-content: space-between; padding: 16px; margin: 8px 0;">
          <span>Total XP Earned</span>
          <strong style="color: var(--xp-gold);">${xp}</strong>
        </div>
        <div class="leaderboard-item card" style="display: flex; justify-content: space-between; padding: 16px; margin: 8px 0;">
          <span>Highest Level</span>
          <strong>${level}</strong>
        </div>
        <div class="leaderboard-item card" style="display: flex; justify-content: space-between; padding: 16px; margin: 8px 0;">
          <span>Quizzes Completed</span>
          <strong>${stats.totalQuizzesTaken || 0}</strong>
        </div>
        <div class="leaderboard-item card" style="display: flex; justify-content: space-between; padding: 16px; margin: 8px 0;">
          <span>Correct Answers</span>
          <strong>${stats.totalCorrectAnswers || 0}</strong>
        </div>
        <div class="leaderboard-item card" style="display: flex; justify-content: space-between; padding: 16px; margin: 8px 0;">
          <span>Bosses Defeated</span>
          <strong>${stats.bossesDefeated || 0}</strong>
        </div>
      </div>
    </div>`;
}
