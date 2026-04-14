/**
 * quiz-page.js — Full quiz flow with feedback and scoring
 */
import store from '../store.js';
import { awardXP } from '../xp.js';
import soundManager from '../sound.js';

export function renderQuiz(params, container) {
  const { quizId } = params;

  fetch(`data/quizzes/${quizId.split('-')[0]}/${quizId}.json`)
    .then(r => r.json())
    .catch(() => {
      container.innerHTML = '<p>Quiz not found</p>';
      return null;
    })
    .then(quiz => {
      if (!quiz) return;

      let currentQuestion = 0;
      let score = 0;
      const answers = [];

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
            answers.push(answerIndex);
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
            answers.push(answer);
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
        const percentage = Math.round((score / quiz.questions.length) * 100);
        const xpEarned = Math.round((score / quiz.questions.length) * 100);
        awardXP('quiz_base');
        awardXP('quiz_correct', { correctAnswers: score });

        container.innerHTML = `
          <div class="quiz-result animate-fade-in" style="text-align: center; padding: 60px 20px;">
            <h1 style="font-size: 3rem; color: var(--accent-green);">${score}/${quiz.questions.length}</h1>
            <p style="font-size: 1.5rem; color: var(--text-secondary); margin: 16px 0;">${percentage}%</p>
            <p style="font-size: 1.2rem; color: var(--xp-gold);">+${xpEarned} XP</p>
            <button class="btn btn--primary" style="margin-top: 24px;" onclick="window.location.hash='#/'">Back to Dashboard</button>
          </div>`;
      };

      showQuestion();
    });
}
