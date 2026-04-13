/**
 * pendulum.js — Simple pendulum simulator with energy display
 */
import { Simulation } from './sim-base.js';

export class PendulumSimulation extends Simulation {
  init() {
    this.length = 2; // meters
    this.angle = 0.5; // radians (initial)
    this.angularVelocity = 0;
    this.gravity = 9.8;
    this.damping = 0.999; // energy loss per frame
    this.mass = 1;

    this.pivotX = this.width / 2;
    this.pivotY = 100;
    this.scale = 100; // pixels per meter

    this.maxAngle = Math.PI / 4;
    this.setupControls();
  }

  setupControls() {
    const panel = document.createElement('div');
    panel.style.cssText = `
      background: var(--bg-card);
      padding: 16px;
      border-radius: var(--border-radius);
      margin-top: 16px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    `;

    const lenLabel = document.createElement('label');
    lenLabel.innerHTML = `
      <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 4px;">Length: <span id="len-val">2</span> m</div>
      <input type="range" min="0.5" max="4" step="0.1" value="2" style="width: 100%;" id="len-slider">
    `;
    lenLabel.querySelector('#len-slider').addEventListener('input', (e) => {
      this.length = parseFloat(e.target.value);
      document.getElementById('len-val').textContent = this.length.toFixed(1);
    });

    const dampLabel = document.createElement('label');
    dampLabel.innerHTML = `
      <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 4px;">Damping: <span id="damp-val">0.1</span></div>
      <input type="range" min="0" max="0.5" step="0.01" value="0.1" style="width: 100%;" id="damp-slider">
    `;
    dampLabel.querySelector('#damp-slider').addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.damping = 1 - val;
      document.getElementById('damp-val').textContent = val.toFixed(2);
    });

    panel.appendChild(lenLabel);
    panel.appendChild(dampLabel);

    this.container.appendChild(panel);
  }

  update(dt) {
    const angularAccel = -(this.gravity / this.length) * Math.sin(this.angle);
    this.angularVelocity += angularAccel * dt;
    this.angularVelocity *= this.damping;
    this.angle += this.angularVelocity * dt;
  }

  draw() {
    const bobX = this.pivotX + Math.sin(this.angle) * this.length * this.scale;
    const bobY = this.pivotY + Math.cos(this.angle) * this.length * this.scale;

    // String
    this.ctx.strokeStyle = 'var(--accent-cyan)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.pivotX, this.pivotY);
    this.ctx.lineTo(bobX, bobY);
    this.ctx.stroke();

    // Pivot
    this.ctx.fillStyle = 'var(--accent-cyan)';
    this.ctx.beginPath();
    this.ctx.arc(this.pivotX, this.pivotY, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Bob
    this.ctx.fillStyle = 'var(--accent-yellow)';
    this.ctx.beginPath();
    this.ctx.arc(bobX, bobY, 8, 0, Math.PI * 2);
    this.ctx.fill();

    // Energy calculation
    const height = this.length * (1 - Math.cos(this.angle));
    const potentialEnergy = this.mass * this.gravity * height;
    const kineticEnergy = 0.5 * this.mass * (this.angularVelocity * this.length) ** 2;
    const totalEnergy = potentialEnergy + kineticEnergy;

    // Info
    this.ctx.fillStyle = 'var(--text-secondary)';
    this.ctx.font = '12px sans-serif';
    this.ctx.fillText(`PE: ${potentialEnergy.toFixed(1)} J | KE: ${kineticEnergy.toFixed(1)} J | Total: ${totalEnergy.toFixed(1)} J`, 10, 20);
    this.ctx.fillText(`Angle: ${(this.angle * 180 / Math.PI).toFixed(1)}°`, 10, 35);
  }
}
