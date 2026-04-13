/**
 * course-overview.js — Individual course with units and lessons
 */
import store from '../store.js';
import soundManager from '../sound.js';

const COURSES_DATA = {
  mechanics: { title: 'Classical Mechanics', units: 4, icon: '⚙️' },
  electromagnetism: { title: 'Electromagnetism', units: 4, icon: '⚡' },
  'waves-quantum': { title: 'Waves & Quantum', units: 3, icon: '🌊' }
};

export function renderCourseOverview(params, container) {
  const { courseId } = params;
  const course = COURSES_DATA[courseId];
  if (!course) {
    container.innerHTML = '<p>Course not found</p>';
    return;
  }

  // Fetch courses.json to get the structure
  fetch('/data/courses.json')
    .then(r => r.json())
    .then(data => {
      const courseData = data.courses.find(c => c.id === courseId);
      if (!courseData) {
        container.innerHTML = '<p>Course data not found</p>';
        return;
      }

      const unitsHTML = courseData.units.map((unit) => {
        const lessonsHTML = unit.lessons.map((lesson) => {
          const watched = store.get(`courses.${courseId}.lectures.${lesson.id}.watched`) || false;
          const checkmark = watched ? '✓' : '○';
          return `
            <div class="lesson-item ${watched ? 'lesson-item--complete' : ''}" data-lesson="${lesson.id}">
              <span class="lesson-item__check">${checkmark}</span>
              <div class="lesson-item__info">
                <p class="lesson-item__title">${lesson.title}</p>
                <p class="lesson-item__meta">Lewin L${lesson.lewinLecture} • Feynman ${lesson.feynmanVolume}-${lesson.feynmanChapter}</p>
              </div>
            </div>`;
        }).join('');

        const completed = unit.lessons.filter(l => store.get(`courses.${courseId}.lectures.${l.id}.watched`)).length;
        const pct = Math.round((completed / unit.lessons.length) * 100);

        return `
          <div class="unit">
            <div class="unit__header">
              <h3>${unit.title}</h3>
              <span class="unit__progress">${completed}/${unit.lessons.length}</span>
            </div>
            <div class="progress-bar" style="margin-bottom: 16px;">
              <div class="progress-bar__fill" style="width: ${pct}%;"></div>
            </div>
            <div class="lessons-list">${lessonsHTML}</div>
            ${unit.bossId ? `<button class="btn btn--danger btn--sm unit__boss" data-boss="${unit.bossId}">⚔️ ${unit.bossName}</button>` : ''}
          </div>`;
      }).join('');

      container.innerHTML = `
        <div class="page animate-fade-in">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 32px;">
            <a href="#/courses" class="btn btn--ghost btn--sm">← Back</a>
            <h1>${course.icon} ${courseData.title}</h1>
          </div>
          ${unitsHTML}
        </div>`;

      // Attach event listeners
      container.querySelectorAll('.lesson-item').forEach(item => {
        item.addEventListener('click', () => {
          soundManager.play('click');
          const lessonId = item.dataset.lesson;
          window.location.hash = `#/courses/${courseId}/${lessonId}`;
        });
      });
    });
}
