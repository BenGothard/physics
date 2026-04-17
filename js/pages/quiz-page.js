/**
 * quiz-page.js — Full quiz flow with feedback and scoring
 */
import store from '../store.js';
import { awardXP } from '../xp.js';
import soundManager from '../sound.js';

export function renderQuiz(params, container) {
  const { quizId } = params;

  // Derive course from quizId prefix (e.g. "mech-kinematics" → "mechanics")
  const prefix = quizId.split('-')[0];
  const courseId = prefix === 'mech' ? 'mechanics'
    : prefix === 'em' ? 'electromagnetism'
    : 'waves-quantum';

  fetch(`data/quizzes/${courseId === 'mechanics' ? 'mechanics' : courseId}/${quizId}.json`)
    .catch(() => null)
    .then(r => r ? r.json() : null)
    .catch(() => null)
    .then(quiz => {
      if (!quiz) {
        container.innerHTML = '<div class="page"><p style="padding:40px;text-align:center;color:var(--text-secondary)">Quiz not found.</p></div>';
        return;
      }

      let currentQuestion = 0;
      let score = 0;

      const showQuestion = () => {
        if (currentQuestion >= quiz.questions.length) {
          showResults();
          return;
        }

        const q = quiz.questions[currentQuestion];
        let optionsHTML = '';

        if (q.type === 'multiple') {
          optionsHTML = q.options.map((opt, i) => `
            <button class="quiz-option" data-index="${i}">${opt}</button>
          `).join('');
        } else if (q.type === 'numerical') {
          optionsHTML = `<input type="number" class="quiz-input" placeholder="Enter your answer">`;
        }

        container.innerHTML = `
          <div class="quiz-container animate-fade-in">
            <div class="quiz-header">
              <div class="quiz-progress">Question ${currentQuestion + 1} of ${quiz.questions.length}</div>
              <div class="progress-bar" style="margin: 16px 0;">
                <div class="progress-bar__fill" style="width: ${((currentQuestion + 1) / quiz.questions.length) * 100}%;"></div>
              </div>
            </div>

            <div class="quiz-question card">
              <h3>${q.text}</h3>
            </div>

            <div class="quiz-options">
              ${optionsHTML}
            </div>

            ${q.type === 'multiple' ? `
              <button class="btn btn--primary" id="next-btn" disabled>Next</button>
            ` : `
              <button class="btn btn--primary" id="submit-btn">Submit</button>
            `}
          </div>`;

        if (q.type === 'multiple') {
          container.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => {
              container.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
              btn.classList.add('selected');
              document.getElementById('next-btn').disabled = false;
            });
          });

          document.getElementById('next-btn').addEventListener('click', () => {
            const selected = container.querySelector('.quiz-option.selected');
            const answerIndex = parseInt(selected.dataset.index);
            if (answerIndex === q.correct) {
              score += 1;
              soundManager.play('correct');
            } else {
              soundManager.play('wrong');
            }
            currentQuestion++;
            showQuestion();
          });
        } else {
          document.getElementById('submit-btn').addEventListener('click', () => {
            const input = container.querySelector('.quiz-input');
            const answer = parseFloat(input.value);
            const tolerance = q.tolerance || 0.1;
            const isCorrect = Math.abs(answer - q.answer) <= tolerance;
            if (isCorrect) {
              score += 1;
              soundManager.play('correct');
            } else {
              soundManager.play('wrong');
            }
            currentQuestion++;
            showQuestion();
          });
        }
      };

      const showResults = () => {
        const total = quiz.questions.length;
        const percentage = Math.round((score / total) * 100);
        const isPerfect = score === total;

        // Award XP and capture totals
        const base = awardXP('quiz_base');
        const correct = awardXP('quiz_correct', { correctAnswers: score });
        const perfect = isPerfect ? awardXP('quiz_perfect') : { xpGained: 0 };
        const totalXP = base.xpGained + correct.xpGained + perfect.xpGained;

        // Persist completion
        store.set(`quizzes.${quizId}.completed`, true);
        store.update('stats.totalQuizzesTaken', v => (v || 0) + 1);
        store.update('stats.totalCorrectAnswers', v => (v || 0) + score);

        container.innerHTML = `
          <div class="quiz-result animate-fade-in" style="text-align: center; padding: 60px 20px;">
            <h1 style="font-size: 3rem; color: var(--accent-green);">${score}/${total}</h1>
            <p style="font-size: 1.5rem; color: var(--text-secondary); margin: 16px 0;">${percentage}%</p>
            <p style="font-size: 1.2rem; color: var(--xp-gold);">+${totalXP} XP</p>
            ${isPerfect ? '<p style="font-size: 1rem; color: var(--accent-cyan); margin-top: 8px;">Perfect score bonus!</p>' : ''}
            <button class="btn btn--primary" id="back-btn" style="margin-top: 24px;">Back to Dashboard</button>
          </div>`;

        document.getElementById('back-btn').addEventListener('click', () => {
          soundManager.play('click');
          window.location.hash = '#/';
        });
      };

      showQuestion();
    });
}
