/**
 * course-list.js — Course selection page
 */
import store from '../store.js';
import soundManager from '../sound.js';

export function renderCourseList(params, container) {
  const courses = [
    { id: 'mechanics', title: 'Classical Mechanics', subtitle: 'Forces, Motion & Energy', icon: '⚙️', color: '#3b82f6', total: 21 },
    { id: 'electromagnetism', title: 'Electromagnetism', subtitle: 'Fields, Circuits & Waves', icon: '⚡', color: '#f59e0b', total: 20 },
    { id: 'waves-quantum', title: 'Waves & Quantum', subtitle: 'Oscillations to Uncertainty', icon: '🌊', color: '#8b5cf6', total: 15 },
  ];

  const cardsHTML = courses.map((c) => {
    const completed = Object.keys(store.get(`courses.${c.id}.lectures`) || {}).filter(k => store.get(`courses.${c.id}.lectures.${k}.watched`)).length;
    const pct = Math.round((completed / c.total) * 100);
    return `
      <div class="course-card" data-course="${c.id}" style="--course-color: ${c.color};">
        <div class="course-card__icon">${c.icon}</div>
        <h3 class="course-card__title">${c.title}</h3>
        <p class="course-card__subtitle">${c.subtitle}</p>
        <div class="progress-bar">
          <div class="progress-bar__fill" style="width: ${pct}%; background: ${c.color};"></div>
        </div>
        <p class="course-card__progress">${completed} / ${c.total} lessons</p>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="page animate-fade-in">
      <h1>Select a Course</h1>
      <p style="color: var(--text-secondary); margin-bottom: 32px;">Master physics one realm at a time</p>
      <div class="courses-grid">${cardsHTML}</div>
    </div>`;

  container.querySelectorAll('.course-card').forEach(card => {
    card.addEventListener('click', () => {
      soundManager.play('click');
      window.location.hash = `#/courses/${card.dataset.course}`;
    });
  });
}
