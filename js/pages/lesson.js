/**
 * lesson.js — Individual lesson with video, reading, simulation, quiz
 */
import store from '../store.js';
import { awardXP } from '../xp.js';
import soundManager from '../sound.js';

const FEYNMAN_URLS = {
  'I': 'https://www.feynmanlectures.caltech.edu/I_{chapter}.html',
  'II': 'https://www.feynmanlectures.caltech.edu/II_{chapter}.html',
  'III': 'https://www.feynmanlectures.caltech.edu/III_{chapter}.html',
};

export function renderLesson(params, container) {
  const { courseId, lessonId } = params;

  fetch('data/courses.json')
    .then(r => r.json())
    .then(data => {
      const courseData = data.courses.find(c => c.id === courseId);
      if (!courseData) {
        container.innerHTML = '<p>Course not found</p>';
        return;
      }

      let lesson = null;
      for (const unit of courseData.units) {
        const found = unit.lessons.find(l => l.id === lessonId);
        if (found) {
          lesson = { ...found, unit };
          break;
        }
      }

      if (!lesson) {
        container.innerHTML = '<p>Lesson not found</p>';
        return;
      }

      const feynmanUrl = FEYNMAN_URLS[lesson.feynmanVolume].replace('{chapter}', String(lesson.feynmanChapter).padStart(2, '0'));
      const watched = store.get(`courses.${courseId}.lectures.${lessonId}.watched`) || false;
      const readCompleted = store.get(`courses.${courseId}.readings.${lessonId}.read`) || false;

      const lectureHTML = lesson.lewinLecture
        ? `<div class="tab-pane" id="tab-video">
             <div class="video-container">
               <iframe width="100%" height="600" src="https://www.youtube.com/embed/placeholder" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
             </div>
             <p style="margin-top: 16px; color: var(--text-secondary);">Walter Lewin Lecture ${lesson.lewinLecture}</p>
             <button class="btn btn--primary btn--sm mark-complete-btn" data-type="lecture" ${watched ? 'disabled' : ''}>
               ${watched ? '✓ Watched' : 'Mark as Watched'}
             </button>
           </div>`
        : '';

      const readingHTML = `<div class="tab-pane" id="tab-reading">
        <div class="reading-card card">
          <h3>📖 Feynman Lectures Volume ${lesson.feynmanVolume}</h3>
          <p>Chapter ${lesson.feynmanChapter}</p>
          <a href="${feynmanUrl}" target="_blank" class="btn btn--secondary btn--sm" style="margin-top: 12px;">
            Open Feynman Lecture ↗
          </a>
        </div>
        <button class="btn btn--primary btn--sm mark-complete-btn" data-type="reading" ${readCompleted ? 'disabled' : ''}>
          ${readCompleted ? '✓ Read' : 'Mark as Read'}
        </button>
      </div>`;

      const simHTML = lesson.simulationId
        ? `<div class="tab-pane" id="tab-simulation">
             <p style="padding: 24px; text-align: center; color: var(--text-secondary);">
               🔬 Simulation: ${lesson.simulationId} (coming soon)
             </p>
           </div>`
        : '';

      const quizHTML = `<div class="tab-pane" id="tab-quiz">
        <p style="padding: 24px; text-align: center; color: var(--text-secondary);">
          📝 Quiz loading...
        </p>
      </div>`;

      container.innerHTML = `
        <div class="page lesson-page animate-fade-in">
          <div class="lesson-page__header">
            <a href="#/courses/${courseId}" class="btn btn--ghost btn--sm">← Back</a>
            <h1>${lesson.title}</h1>
            <p style="color: var(--text-secondary);">${lesson.unit.title}</p>
          </div>

          <div class="lesson-progress">
            <div class="lesson-progress-item ${watched ? 'complete' : ''}">
              <span class="icon">🎥</span>
              <span>Video</span>
            </div>
            <div class="lesson-progress-item ${readCompleted ? 'complete' : ''}">
              <span class="icon">📖</span>
              <span>Reading</span>
            </div>
            ${lesson.simulationId ? `
              <div class="lesson-progress-item">
                <span class="icon">🔬</span>
                <span>Simulation</span>
              </div>
            ` : ''}
            <div class="lesson-progress-item">
              <span class="icon">📝</span>
              <span>Quiz</span>
            </div>
          </div>

          <div class="lesson-tabs">
            ${lectureHTML ? '<button class="lesson-tab active" data-tab="tab-video">Video</button>' : ''}
            <button class="lesson-tab" data-tab="tab-reading">Reading</button>
            ${lesson.simulationId ? '<button class="lesson-tab" data-tab="tab-simulation">Simulation</button>' : ''}
            <button class="lesson-tab" data-tab="tab-quiz">Quiz</button>
          </div>

          <div class="lesson-tabs__content">
            ${lectureHTML}
            ${readingHTML}
            ${simHTML}
            ${quizHTML}
          </div>
        </div>`;

      // Tab switching
      container.querySelectorAll('.lesson-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          const tabId = btn.dataset.tab;
          container.querySelectorAll('.lesson-tab').forEach(b => b.classList.remove('active'));
          container.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
          btn.classList.add('active');
          document.getElementById(tabId).style.display = 'block';
        });
      });

      // Mark complete buttons
      container.querySelectorAll('.mark-complete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.type;
          if (type === 'lecture') {
            store.set(`courses.${courseId}.lectures.${lessonId}.watched`, true);
            awardXP('lecture');
            btn.disabled = true;
            btn.textContent = '✓ Watched';
            soundManager.play('correct');
          } else if (type === 'reading') {
            store.set(`courses.${courseId}.readings.${lessonId}.read`, true);
            awardXP('reading');
            btn.disabled = true;
            btn.textContent = '✓ Read';
            soundManager.play('correct');
          }
        });
      });

      // Show first tab by default
      const firstTab = container.querySelector('.lesson-tab');
      if (firstTab) firstTab.click();
    });
}
