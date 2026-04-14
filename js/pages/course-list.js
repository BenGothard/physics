/**
 * course-list.js — Course selection page
 */
import store from '../store.js';
import soundManager from '../sound.js';

const COURSES = [
  {
    id: 'mechanics',
    title: 'Classical Mechanics',
    subtitle: 'Forces, Motion & Energy',
    icon: '⚙️',
    color: '#3b82f6',
    total: 21,
    description: 'Master Newton\'s laws, energy, momentum, rotation, and gravity through MIT\'s legendary 8.01 lectures.',
  },
  {
    id: 'electromagnetism',
    title: 'Electromagnetism',
    subtitle: 'Fields, Circuits & Waves',
    icon: '⚡',
    color: '#f59e0b',
    total: 20,
    description: 'From Coulomb\'s law to Maxwell\'s equations — explore the forces that power the universe.',
  },
  {
    id: 'waves-quantum',
    title: 'Waves & Quantum',
    subtitle: 'Oscillations to Uncertainty',
    icon: '🌊',
    color: '#8b5cf6',
    total: 15,
    description: 'Oscillations, wave mechanics, and the quantum world where particles defy intuition.',
  },
];

export function renderCourseList(params, container) {
  const cardsHTML = COURSES.map((c) => {
    const lectures = store.get(`courses.${c.id}.lectures`) || {};
    const completed = Object.values(lectures).filter((l) => l.watched).length;
    const pct = Math.round((completed / c.total) * 100);
    const started = completed > 0;

    return `
      <a href="#/courses/${c.id}"
         class="course-card"
         style="--course-color: ${c.color};"
         aria-label="${c.title} — ${completed} of ${c.total} lessons completed">
        <div class="course-card__icon">${c.icon}</div>
        <h3 class="course-card__title">${c.title}</h3>
        <p class="course-card__subtitle">${c.subtitle}</p>
        <p style="font-size: var(--fs-sm); color: var(--text-secondary); margin-bottom: var(--space-md); line-height: 1.5; flex: 1;">
          ${c.description}
        </p>
        <div class="progress-bar progress-bar--sm" style="margin-bottom: var(--space-sm);">
          <div class="progress-bar__fill" style="width: ${pct}%; background: ${c.color};"></div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <p class="course-card__progress">${completed} / ${c.total} lessons &bull; ${pct}%</p>
          <span class="btn btn--primary btn--sm" aria-hidden="true" style="pointer-events: none;">
            ${started ? 'Continue →' : 'Start →'}
          </span>
        </div>
      </a>`;
  }).join('');

  container.innerHTML = `
    <div class="page animate-fade-in">
      <h1>Select a Course</h1>
      <p style="color: var(--text-secondary); margin-bottom: var(--space-xl);">
        Master physics one realm at a time
      </p>
      <div class="courses-grid">${cardsHTML}</div>
    </div>`;

  /* Play click sound on navigation */
  container.querySelectorAll('.course-card').forEach((card) => {
    card.addEventListener('click', () => soundManager.play('click'));
  });
}
