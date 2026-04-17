/**
 * challenges.js — Daily challenges page
 */
import { generateDailyChallenge } from '../daily-challenge.js';
import { awardXP } from '../xp.js';
import store from '../store.js';
import soundManager from '../sound.js';

export function renderChallenges(params, container) {
  const challenge = generateDailyChallenge();
  const completed = store.get(`dailyChallenges.${challenge.date}`)?.completed || false;

  container.innerHTML = `
    <div class="page animate-fade-in" style="padding: 40px 20px; text-align: center;">
      <h1>Daily Challenge</h1>
      <p style="color: var(--text-secondary); margin-bottom: 32px;">Complete one challenge per day to build your streak!</p>

      <div class="card" style="padding: 32px; max-width: 400px; margin: 0 auto;">
        <h2 style="font-size: 2rem; margin-bottom: 16px;">⭐ ${challenge.type}</h2>
        <p style="color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 24px;">${challenge.description}</p>
        <p style="color: var(--xp-gold); font-size: 1.2rem; margin-bottom: 16px;">+60 XP</p>

        ${completed
          ? '<p style="color: var(--accent-green); font-size: 1.2rem; font-weight: bold;">✓ Completed!</p>'
          : `<button class="btn btn--primary" id="start-challenge-btn" type="button">Start Challenge</button>`
        }
      </div>

      <h2 style="margin-top: 40px;">Your Challenge History</h2>
      <p style="color: var(--text-secondary);">Track your daily challenge progress</p>
    </div>`;

  const startBtn = container.querySelector('#start-challenge-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      soundManager.play('click');
      // Mark challenge complete and award XP
      store.set(`dailyChallenges.${challenge.date}`, { completed: true });
      awardXP('daily_challenge');
      if (challenge.quizId) {
        window.location.hash = `#/quiz/${challenge.quizId}`;
      } else {
        window.location.hash = '#/sandbox';
      }
    });
  }
}
