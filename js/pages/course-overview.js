/**
 * course-overview.js — Individual course with units and lessons
 */
import store from '../store.js';
import soundManager from '../sound.js';

const COURSES_META = {
  mechanics: { title: 'Classical Mechanics', icon: '⚙️', color: 'var(--mechanics-color)' },
  electromagnetism: { title: 'Electromagnetism', icon: '⚡', color: 'var(--em-color)' },
  'waves-quantum': { title: 'Waves & Quantum', icon: '🌊', color: 'var(--waves-color)' },
};

export function renderCourseOverview(params, container) {
  const { courseId } = params;
  const meta = COURSES_META[courseId];

  if (!meta) {
    container.innerHTML = '<div class="page"><p>Course not found.</p></div>';
    return;
  }

  /* Show loading skeleton while fetching */
  container.innerHTML = `
    <div class="page animate-fade-in">
      <div class="course-overview-header">
        <a href="#/courses" class="btn btn--ghost btn--sm">← Back to Courses</a>
        <h1>${meta.icon} ${meta.title}</h1>
      </div>
      <div class="course-overview-loading">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text"></div>
      </div>
    </div>`;

  fetch('data/courses.json')
    .then((r) => r.json())
    .then((data) => {
      const courseData = data.courses.find((c) => c.id === courseId);
      if (!courseData) {
        container.innerHTML = '<div class="page"><p>Course data not found.</p></div>';
        return;
      }

      /* Total progress across all units */
      const totalLessons = courseData.units.reduce((s, u) => s + u.lessons.length, 0);
      const totalDone = courseData.units.reduce((s, u) =>
        s + u.lessons.filter((l) => store.get(`courses.${courseId}.lectures.${l.id}.watched`)).length, 0);
      const overallPct = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0;

      const unitsHTML = courseData.units.map((unit, unitIdx) => {
        const completed = unit.lessons.filter((l) =>
          store.get(`courses.${courseId}.lectures.${l.id}.watched`)
        ).length;
        const pct = Math.round((completed / unit.lessons.length) * 100);

        const lessonsHTML = unit.lessons.map((lesson) => {
          const watched = store.get(`courses.${courseId}.lectures.${lesson.id}.watched`) || false;
          return `
            <button class="lesson-item ${watched ? 'lesson-item--complete' : ''}"
                    data-lesson="${lesson.id}" type="button">
              <span class="lesson-item__check" aria-hidden="true">${watched ? '✓' : '○'}</span>
              <div class="lesson-item__info">
                <span class="lesson-item__title">${lesson.title}</span>
                <span class="lesson-item__meta">
                  Lewin L${lesson.lewinLecture}
                  &bull;
                  Feynman Vol.&thinsp;${lesson.feynmanVolume} Ch.&thinsp;${lesson.feynmanChapter}
                </span>
              </div>
              <span class="lesson-item__arrow" aria-hidden="true">›</span>
            </button>`;
        }).join('');

        return `
          <div class="unit-card">
            <div class="unit-card__header">
              <div>
                <span class="unit-card__number">Unit ${unitIdx + 1}</span>
                <h3 class="unit-card__title">${unit.title}</h3>
              </div>
              <span class="unit-card__progress badge badge--blue">${completed}/${unit.lessons.length}</span>
            </div>
            <div class="progress-bar progress-bar--sm" style="margin-bottom: var(--space-md);">
              <div class="progress-bar__fill" style="width: ${pct}%;"></div>
            </div>
            <div class="lessons-list">${lessonsHTML}</div>
            ${unit.bossId ? `
              <button class="btn btn--danger unit-boss-btn" data-boss="${unit.bossId}" type="button">
                ⚔️ Face the Boss — ${unit.bossName}
              </button>` : ''}
          </div>`;
      }).join('');

      container.innerHTML = `
        <div class="page animate-fade-in">
          <div class="course-overview-header">
            <a href="#/courses" class="btn btn--ghost btn--sm">← Back to Courses</a>
            <div>
              <h1>${meta.icon} ${courseData.title}</h1>
              <p class="course-overview-subtitle">${courseData.subtitle}</p>
            </div>
          </div>

          <div class="course-overview-progress-bar">
            <div class="course-overview-progress-bar__header">
              <span>Overall Progress</span>
              <span>${totalDone} / ${totalLessons} lessons &bull; ${overallPct}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar__fill" style="width: ${overallPct}%;"></div>
            </div>
          </div>

          <div class="units-list">${unitsHTML}</div>
        </div>`;

      /* Lesson click handlers */
      container.querySelectorAll('.lesson-item').forEach((btn) => {
        btn.addEventListener('click', () => {
          soundManager.play('click');
          window.location.hash = `#/courses/${courseId}/${btn.dataset.lesson}`;
        });
      });

      /* Boss battle click handlers */
      container.querySelectorAll('.unit-boss-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          soundManager.play('click');
          window.location.hash = `#/boss/${btn.dataset.boss}`;
        });
      });
    })
    .catch(() => {
      container.innerHTML = '<div class="page"><p>Failed to load course data.</p></div>';
    });
}
