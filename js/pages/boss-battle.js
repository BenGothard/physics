/**
 * boss-battle.js — Boss battle arena with health bar and timer
 */
import store from '../store.js';
import { awardXP } from '../xp.js';
import soundManager from '../sound.js';

const BOSSES = {
  'boss-kinematic-kraken': { name: 'The Kinematic Kraken', hp: 100, timeLimit: 900 },
  'boss-newtons-nemesis': { name: "Newton's Nemesis", hp: 100, timeLimit: 900 },
  'boss-energy-enigma': { name: 'The Energy Enigma', hp: 100, timeLimit: 900 },
  'boss-rotational-revenant': { name: 'The Rotational Revenant', hp: 100, timeLimit: 900 },
  'boss-coulombs-colossus': { name: "Coulomb's Colossus", hp: 100, timeLimit: 900 },
  'boss-circuit-serpent': { name: 'The Circuit Serpent', hp: 100, timeLimit: 900 },
  'boss-harmonic-hydra': { name: 'The Harmonic Hydra', hp: 100, timeLimit: 900 },
};

export function renderBossBattle(params, container) {
  const { bossId } = params;
  const boss = BOSSES[bossId];

  if (!boss) {
    container.innerHTML = '<p>Boss not found</p>';
    return;
  }

  let currentQuestion = 0;
  let playerHp = 3;
  let bossHp = boss.hp;
  let score = 0;
  const startTime = Date.now();

  const questions = generateBossQuestions(bossId);

  const renderArena = () => {
    if (playerHp <= 0) {
      renderDefeat();
      return;
    }

    if (currentQuestion >= questions.length) {
      renderVictory(score, questions.length);
      return;
    }

    const q = questions[currentQuestion];
    const timeRemaining = Math.max(0, boss.timeLimit - Math.floor((Date.now() - startTime) / 1000));

    if (timeRemaining <= 0) {
      renderDefeat();
      return;
    }

    let optionsHTML = '';
    if (q.type === 'multiple') {
      optionsHTML = q.options.map((opt, i) => `
        <button class="quiz-option" data-index="${i}">${opt}</button>
      `).join('');
    }

    container.innerHTML = `
      <div class="boss-arena animate-fade-in" style="padding: 40px 20px;">
        <div class="boss-header" style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: var(--accent-red); font-size: 2.5rem; margin-bottom: 8px;">⚔️ ${boss.name}</h1>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 600px; margin: 24px auto;">
            <!-- Boss Health -->
            <div>
              <p style="color: var(--text-secondary); font-size: 0.9rem;">Boss HP</p>
              <div class="progress-bar" style="height: 20px; background: var(--bg-card); margin: 8px 0;">
                <div class="progress-bar__fill" style="width: ${(bossHp / boss.hp) * 100}%; background: var(--accent-red); height: 100%;"></div>
              </div>
              <p style="color: var(--accent-red); font-weight: bold;">${bossHp} / ${boss.hp}</p>
            </div>

            <!-- Player Lives -->
            <div>
              <p style="color: var(--text-secondary); font-size: 0.9rem;">Your Lives</p>
              <p style="font-size: 1.5rem;">
                ${Array.from({length: 3}).map((_, i) => i < playerHp ? '❤️' : '💔').join(' ')}
              </p>
            </div>

            <!-- Timer -->
            <div style="grid-column: 1 / -1;">
              <p style="color: var(--text-secondary); font-size: 0.9rem;">Time Remaining</p>
              <p style="font-size: 2rem; color: ${timeRemaining < 60 ? 'var(--accent-red)' : 'var(--accent-cyan)'}; font-weight: bold;">
                ${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>

        <div class="boss-question card" style="max-width: 600px; margin: 24px auto;">
          <p style="color: var(--text-secondary); margin-bottom: 16px;">Question ${currentQuestion + 1} of ${questions.length}</p>
          <h3 style="margin-bottom: 24px;">${q.text}</h3>
          <div class="quiz-options" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            ${optionsHTML}
          </div>
        </div>
      </div>`;

    container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const answerIndex = parseInt(btn.dataset.index);
        const correct = answerIndex === q.correct;

        if (correct) {
          score++;
          bossHp -= 10;
          soundManager.play('correct');
        } else {
          playerHp--;
          soundManager.play('wrong');
        }

        currentQuestion++;
        renderArena();
      });
    });
  };

  const renderVictory = (finalScore, totalQuestions) => {
    const percentage = Math.round((finalScore / totalQuestions) * 100);
    awardXP('boss_battle');
    if (percentage === 100) awardXP('boss_perfect');
    store.set(`bosses.${bossId}.defeated`, true);
    store.set(`stats.bossesDefeated`, (store.get('stats.bossesDefeated') || 0) + 1);

    container.innerHTML = `
      <div class="boss-victory animate-fade-in" style="text-align: center; padding: 60px 20px; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: 3rem; color: var(--accent-green); margin-bottom: 16px;">🎉 VICTORY!</h1>
        <p style="font-size: 1.5rem; color: var(--xp-gold); margin-bottom: 32px;">You defeated ${boss.name}</p>

        <div class="card" style="max-width: 400px; margin: 0 auto; padding: 32px;">
          <h2 style="color: var(--accent-green);">${finalScore}/${totalQuestions}</h2>
          <p style="color: var(--text-secondary); margin: 16px 0;">Accuracy: ${percentage}%</p>
          <p style="color: var(--xp-gold); font-size: 1.2rem;">+${Math.round(500 + (finalScore / totalQuestions) * 200)} XP</p>
        </div>

        <button class="btn btn--primary" id="victory-back-btn" style="margin-top: 32px;">Back to Skill Tree</button>
      </div>`;

    document.getElementById('victory-back-btn').addEventListener('click', () => {
      soundManager.play('click');
      window.location.hash = '#/skill-tree';
    });
  };

  const renderDefeat = () => {
    container.innerHTML = `
      <div class="boss-defeat animate-fade-in" style="text-align: center; padding: 60px 20px; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: 3rem; color: var(--accent-red); margin-bottom: 16px;">💔 DEFEATED</h1>
        <p style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 32px;">You were defeated by ${boss.name}</p>

        <button class="btn btn--primary" id="defeat-retry-btn" style="margin-top: 24px;">Try Again</button>
        <button class="btn btn--ghost" id="defeat-back-btn" style="margin-top: 12px;">Back to Skill Tree</button>
      </div>`;

    document.getElementById('defeat-retry-btn').addEventListener('click', () => {
      soundManager.play('click');
      window.location.hash = `#/boss/${bossId}`;
    });
    document.getElementById('defeat-back-btn').addEventListener('click', () => {
      soundManager.play('click');
      window.location.hash = '#/skill-tree';
    });
  };

  renderArena();
}

function generateBossQuestions(bossId) {
  // Simple generated questions for demo
  const baseQuestions = [
    { type: 'multiple', text: 'What is the SI unit of force?', options: ['Newton', 'Joule', 'Watt', 'Pascal'], correct: 0 },
    { type: 'multiple', text: 'Which equation relates force, mass, and acceleration?', options: ['E=mc²', 'F=ma', 'P=IV', 'V=IR'], correct: 1 },
    { type: 'multiple', text: 'What does the first law of thermodynamics state?', options: ['Energy is created', 'Energy is conserved', 'All motion is circular', 'All force is gravity'], correct: 1 },
  ];

  return baseQuestions;
}
