/**
 * sandbox.js — Free-play physics simulation sandbox
 */
import { ProjectileSimulation } from '../simulations/projectile.js';
import { PendulumSimulation } from '../simulations/pendulum.js';
import { SpringSimulation } from '../simulations/spring.js';

const SIMULATIONS = [
  { id: 'projectile', name: '🚀 Projectile Motion', class: ProjectileSimulation },
  { id: 'pendulum', name: '🎯 Pendulum', class: PendulumSimulation },
  { id: 'spring', name: '🔧 Spring Oscillator', class: SpringSimulation },
];

export function renderSandbox(params, container) {
  const selectedId = params.simId || 'projectile';
  const selectedSim = SIMULATIONS.find(s => s.id === selectedId);

  if (!selectedSim) {
    container.innerHTML = '<p>Simulation not found</p>';
    return;
  }

  container.innerHTML = `
    <div class="page animate-fade-in">
      <h1>Physics Sandbox</h1>
      <p style="color: var(--text-secondary); margin-bottom: 24px;">Experiment with interactive physics simulations</p>

      <div style="display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;">
        ${SIMULATIONS.map(sim => `
          <a href="#/sandbox/${sim.id}" class="btn ${sim.id === selectedId ? 'btn--primary' : 'btn--ghost'} btn--sm">
            ${sim.name}
          </a>
        `).join('')}
      </div>

      <div id="sim-container" style="background: var(--bg-card); border-radius: var(--border-radius); padding: 16px;"></div>
    </div>`;

  // Initialize the selected simulation
  setTimeout(() => {
    try {
      new selectedSim.class('sim-container');
    } catch (e) {
      console.error('Sim error:', e);
    }
  }, 100);
}
