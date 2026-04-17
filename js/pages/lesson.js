/**
 * lesson.js — Individual lesson with video, reading, simulation, quiz
 *
 * Tabs: Video (Lewin lecture), Reading (Feynman), Simulation, Quiz
 * Completion of each section awards XP and updates the progress tracker.
 */
import store from '../store.js';
import { awardXP } from '../xp.js';
import soundManager from '../sound.js';

/* ------------------------------------------------------------------ */
/*  External resource helpers                                          */
/* ------------------------------------------------------------------ */

/**
 * Feynman Lectures Online (Caltech) — chapter numbers zero-padded to 2 digits.
 */
function feynmanUrl(volume, chapter) {
  return `https://www.feynmanlectures.caltech.edu/${volume}_${String(chapter).padStart(2, '0')}.html`;
}

/**
 * YouTube search URL for a specific Walter Lewin lecture.
 * Linking to a search is more reliable than hard-coding video IDs.
 */
function lewinSearchUrl(lectureNum, courseTitle) {
  const q = encodeURIComponent(`Walter Lewin ${courseTitle} Lecture ${lectureNum} MIT`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

/**
 * MIT OCW course pages for each course ID.
 */
const OCW_URLS = {
  mechanics:       'https://ocw.mit.edu/courses/8-01sc-physics-i-classical-mechanics-fall-2016/',
  electromagnetism:'https://ocw.mit.edu/courses/8-02-physics-ii-electricity-and-magnetism-spring-2002/',
  'waves-quantum': 'https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/',
};

/* ------------------------------------------------------------------ */
/*  Render                                                             */
/* ------------------------------------------------------------------ */

export function renderLesson(params, container) {
  const { courseId, lessonId } = params;

  /* Loading state */
  container.innerHTML = `
    <div class="page">
      <div class="lesson-header">
        <a href="#/courses/${courseId}" class="btn btn--ghost btn--sm">← Back to Course</a>
      </div>
      <div style="padding: var(--space-2xl); text-align: center; color: var(--text-secondary);">
        Loading lesson…
      </div>
    </div>`;

  fetch('data/courses.json')
    .then((r) => r.json())
    .then((data) => {
      const courseData = data.courses.find((c) => c.id === courseId);
      if (!courseData) {
        container.innerHTML = '<div class="page"><p>Course not found.</p></div>';
        return;
      }

      let lesson = null;
      let unitData = null;
      for (const unit of courseData.units) {
        const found = unit.lessons.find((l) => l.id === lessonId);
        if (found) { lesson = found; unitData = unit; break; }
      }

      if (!lesson) {
        container.innerHTML = '<div class="page"><p>Lesson not found.</p></div>';
        return;
      }

      /* Completion state */
      const watched     = store.get(`courses.${courseId}.lectures.${lessonId}.watched`)    || false;
      const readDone    = store.get(`courses.${courseId}.readings.${lessonId}.read`)        || false;
      const quizDone    = store.get(`courses.${courseId}.quizzes.${lessonId}.completed`)    || false;
      const simDone     = lesson.simulationId
        ? store.get(`courses.${courseId}.simulations.${lessonId}.completed`) || false
        : null;

      /* Tabs to show */
      const tabs = [];
      if (lesson.lewinLecture) tabs.push({ id: 'video',      label: '🎥 Video',      done: watched });
      tabs.push(                          { id: 'reading',   label: '📖 Reading',     done: readDone });
      if (lesson.simulationId) tabs.push( { id: 'simulation',label: '🔬 Simulation',  done: simDone === true });
      tabs.push(                          { id: 'quiz',      label: '📝 Quiz',        done: quizDone });

      /* ---- Build tab HTML ---- */

      /* Video tab */
      const videoTabHTML = lesson.lewinLecture ? `
        <div class="lesson-tab-content" id="pane-video" hidden>
          <div class="reading-section">
            <div class="reading-section__icon">🎥</div>
            <div class="reading-section__content">
              <div class="reading-section__title">
                Walter Lewin — Lecture ${lesson.lewinLecture}
              </div>
              <div class="reading-section__description">
                ${lesson.title}<br>
                Watch the original MIT lecture by Professor Walter Lewin.
                The video opens on YouTube — use the playlist to find the correct lecture number.
              </div>
              <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap; margin-top: var(--space-md);">
                <a href="${lewinSearchUrl(lesson.lewinLecture, courseData.title)}"
                   target="_blank" rel="noopener noreferrer"
                   class="btn btn--primary btn--sm">
                  ▶ Watch on YouTube ↗
                </a>
                <a href="${OCW_URLS[courseId] || '#'}"
                   target="_blank" rel="noopener noreferrer"
                   class="btn btn--secondary btn--sm">
                  MIT OpenCourseWare ↗
                </a>
              </div>
            </div>
          </div>
          <div style="margin-top: var(--space-lg);">
            <button class="btn btn--success mark-complete-btn ${watched ? 'completed' : ''}"
                    data-type="lecture" type="button" ${watched ? 'disabled' : ''}>
              ${watched ? '✓ Marked as Watched' : 'Mark as Watched  (+100 XP)'}
            </button>
          </div>
        </div>` : '';

      /* Reading tab */
      const readUrl = feynmanUrl(lesson.feynmanVolume, lesson.feynmanChapter);
      const readingTabHTML = `
        <div class="lesson-tab-content" id="pane-reading" hidden>
          <div class="reading-section">
            <div class="reading-section__icon">📖</div>
            <div class="reading-section__content">
              <div class="reading-section__title">
                The Feynman Lectures on Physics — Volume ${lesson.feynmanVolume},
                Chapter ${lesson.feynmanChapter}
              </div>
              <div class="reading-section__description">
                Read the corresponding chapter from Richard Feynman's celebrated lecture series,
                freely available online from Caltech.
              </div>
              <a href="${readUrl}" target="_blank" rel="noopener noreferrer"
                 class="reading-section__link">
                Open Feynman Lecture ↗
              </a>
            </div>
          </div>
          <div style="margin-top: var(--space-lg);">
            <button class="btn btn--success mark-complete-btn ${readDone ? 'completed' : ''}"
                    data-type="reading" type="button" ${readDone ? 'disabled' : ''}>
              ${readDone ? '✓ Marked as Read' : 'Mark as Read  (+100 XP)'}
            </button>
          </div>
        </div>`;

      /* Simulation tab */
      const simTabHTML = lesson.simulationId ? `
        <div class="lesson-tab-content" id="pane-simulation" hidden>
          <div class="reading-section">
            <div class="reading-section__icon">🔬</div>
            <div class="reading-section__content">
              <div class="reading-section__title">Interactive Simulation</div>
              <div class="reading-section__description">
                Simulation: <strong>${lesson.simulationId}</strong>
              </div>
              <a href="#/sandbox/${lesson.simulationId}" class="btn btn--secondary btn--sm"
                 style="margin-top: var(--space-md); display: inline-flex;">
                Open in Sandbox →
              </a>
            </div>
          </div>
        </div>` : '';

      /* Quiz tab */
      const quizTabHTML = `
        <div class="lesson-tab-content" id="pane-quiz" hidden>
          <div class="reading-section">
            <div class="reading-section__icon">📝</div>
            <div class="reading-section__content">
              <div class="reading-section__title">Quiz</div>
              <div class="reading-section__description">
                Test your understanding of <em>${lesson.title}</em>.
              </div>
              ${lesson.quizId ? `
                <a href="#/quiz/${lesson.quizId}" class="btn btn--primary btn--sm"
                   style="margin-top: var(--space-md); display: inline-flex;">
                  Start Quiz →
                </a>` : '<p style="color: var(--text-muted); margin-top: var(--space-sm);">No quiz for this lesson yet.</p>'}
            </div>
          </div>
        </div>`;

      /* ---- Tab buttons ---- */
      const tabButtonsHTML = tabs.map((t, i) => `
        <button class="lesson-tab${i === 0 ? ' active' : ''}"
                data-pane="pane-${t.id}" type="button">
          ${t.label}${t.done ? ' <span style="color:var(--accent-green)">✓</span>' : ''}
        </button>`).join('');

      /* ---- Progress tracker ---- */
      const progressItems = tabs.map((t) => `
        <div class="lesson-progress-item${t.done ? ' completed' : ''}">
          <div class="lesson-progress-item__circle">${t.done ? '✓' : ''}</div>
          <div class="lesson-progress-item__label">${t.label.replace(/^\S+\s/, '')}</div>
        </div>`).join('');

      /* ---- Full page ---- */
      container.innerHTML = `
        <div class="page lesson-page animate-fade-in">
          <div class="lesson-header">
            <div class="lesson-header__breadcrumb">
              <a href="#/courses">Courses</a>
              <span>/</span>
              <a href="#/courses/${courseId}">${courseData.title}</a>
              <span>/</span>
              <span>${unitData.title}</span>
            </div>
            <h1 class="lesson-header__title">${lesson.title}</h1>
            <div class="lesson-header__unit">
              <span class="lesson-header__unit-badge"></span>
              ${unitData.title}
            </div>
          </div>

          <div class="lesson-progress">${progressItems}</div>

          <div class="lesson-tabs">${tabButtonsHTML}</div>

          <div class="lesson-tabs__content">
            ${videoTabHTML}
            ${readingTabHTML}
            ${simTabHTML}
            ${quizTabHTML}
          </div>
        </div>`;

      /* Show first tab */
      const firstPane = container.querySelector('.lesson-tab-content');
      if (firstPane) firstPane.removeAttribute('hidden');

      /* Tab switching */
      container.querySelectorAll('.lesson-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.lesson-tab').forEach((b) => b.classList.remove('active'));
          container.querySelectorAll('.lesson-tab-content').forEach((p) => p.setAttribute('hidden', ''));
          btn.classList.add('active');
          const pane = document.getElementById(btn.dataset.pane);
          if (pane) pane.removeAttribute('hidden');
          soundManager.play('click');
        });
      });

      /* Mark-complete buttons */
      container.querySelectorAll('.mark-complete-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.type;
          if (type === 'lecture' && !watched) {
            store.set(`courses.${courseId}.lectures.${lessonId}.watched`, true);
            awardXP('lecture');
            btn.disabled = true;
            btn.textContent = '✓ Marked as Watched';
            btn.classList.add('completed');
            soundManager.play('correct');
          } else if (type === 'reading' && !readDone) {
            store.set(`courses.${courseId}.readings.${lessonId}.read`, true);
            awardXP('reading');
            btn.disabled = true;
            btn.textContent = '✓ Marked as Read';
            btn.classList.add('completed');
            soundManager.play('correct');
          }
        });
      });
    })
    .catch(() => {
      container.innerHTML = '<div class="page"><p>Failed to load lesson data.</p></div>';
    });
}
