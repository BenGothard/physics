/**
 * spring.js — Spring oscillator with damping
 */
import { Simulation } from './sim-base.js';

export class SpringSimulation extends Simulation {
  init() {
    this.position = -1; // meters (displacement from equilibrium)
    this.velocity = 0;
    this.k = 100; // spring constant (N/m)
    this.mass = 1; // kg
    this.damping = 0.95;

    this.scale = 200; // pixels per meter
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

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

    const kLabel = document.createElement('label');
    kLabel.innerHTML = `
      <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 4px;">Spring Constant: <span id="k-val">100</span> N/m</div>
      <input type="range" min="10" max="500" step="10" value="100" style="width: 100%;" id="k-slider">
    `;
    kLabel.querySelector('#k-slider').addEventListener('input', (e) => {
      this.k = parseFloat(e.target.value);
      document.getElementById('k-val').textContent = this.k;
    });

    const massLabel = document.createElement('label');
    massLabel.innerHTML = `
      <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 4px;">Mass: <span id="mass-val">1</span> kg</div>
      <input type="range" min="0.5" max="5" step="0.5" value="1" style="width: 100%;" id="mass-slider">
    `;
    massLabel.querySelector('#mass-slider').addEventListener('input', (e) => {
      this.mass = parseFloat(e.target.value);
      document.getElementById('mass-val').textContent = this.mass.toFixed(1);
    });

    panel.appendChild(kLabel);
    panel.appendChild(massLabel);

    this.container.appendChild(panel);
  }

  update(dt) {
    const acceleration = -(this.k / this.mass) * this.position;
    this.velocity += acceleration * dt;
    this.velocity *= this.damping;
    this.position += this.velocity * dt;
  }

  draw() {
    const bobX = this.centerX + this.position * this.scale;

    // Fixed point
    this.ctx.fillStyle = 'var(--accent-cyan)';
    this.ctx.fillRect(this.centerX - 8, this.centerY - 30, 16, 60);

    // Spring
    this.ctx.strokeStyle = 'var(--accent-cyan)';
    this.ctx.lineWidth = 2;
    const coils = 8;
    const coilHeight = (bobX - (this.centerX - 10)) / coils;
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX + 10, this.centerY - 30);
    for (let i = 0; i < coils; i++) {
      const x = this.centerX + 10 + (i / coils) * (bobX - (this.centerX + 10));
      const y = this.centerY - 30 + (i % 2 === 0 ? 10 : -10);
      this.ctx.lineTo(x, y);
    }
    this.ctx.lineTo(bobX, this.centerY);
    this.ctx.stroke();

    // Mass
    this.ctx.fillStyle = 'var(--accent-yellow)';
    this.ctx.beginPath();
    this.ctx.arc(bobX, this.centerY, 10, 0, Math.PI * 2);
    this.ctx.fill();

    // Equilibrium line
    this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.centerY);
    this.ctx.lineTo(this.width, this.centerY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Energy
    const pe = 0.5 * this.k * this.position ** 2;
    const ke = 0.5 * this.mass * this.velocity ** 2;
    const total = pe + ke;

    this.ctx.fillStyle = 'var(--text-secondary)';
    this.ctx.font = '12px sans-serif';
    this.ctx.fillText(`PE: ${pe.toFixed(1)} J | KE: ${ke.toFixed(1)} J | Total: ${total.toFixed(1)} J`, 10, 20);
    this.ctx.fillText(`Position: ${this.position.toFixed(2)} m`, 10, 35);
  }
}
