/**
 * projectile.js — Projectile motion simulator
 */
import { Simulation } from './sim-base.js';

export class ProjectileSimulation extends Simulation {
  init() {
    this.angle = 45; // degrees
    this.velocity = 20; // m/s
    this.gravity = 9.8; // m/s²
    this.scale = 10; // pixels per meter

    this.projectiles = [];
    this.trail = [];

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

    // Angle slider
    const angleLabel = document.createElement('label');
    angleLabel.innerHTML = `
      <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 4px;">Angle: <span id="angle-val">45</span>°</div>
      <input type="range" min="0" max="90" value="45" style="width: 100%;" id="angle-slider">
    `;
    angleLabel.querySelector('#angle-slider').addEventListener('input', (e) => {
      this.angle = parseFloat(e.target.value);
      document.getElementById('angle-val').textContent = this.angle;
    });

    // Velocity slider
    const velLabel = document.createElement('label');
    velLabel.innerHTML = `
      <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 4px;">Velocity: <span id="vel-val">20</span> m/s</div>
      <input type="range" min="5" max="50" value="20" style="width: 100%;" id="vel-slider">
    `;
    velLabel.querySelector('#vel-slider').addEventListener('input', (e) => {
      this.velocity = parseFloat(e.target.value);
      document.getElementById('vel-val').textContent = this.velocity;
    });

    // Launch button
    const launchBtn = document.createElement('button');
    launchBtn.textContent = '🚀 Launch';
    launchBtn.className = 'btn btn--primary';
    launchBtn.addEventListener('click', () => this.launch());

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '🗑 Clear Trails';
    clearBtn.className = 'btn btn--secondary';
    clearBtn.addEventListener('click', () => {
      this.projectiles = [];
      this.trail = [];
    });

    panel.appendChild(angleLabel);
    panel.appendChild(velLabel);
    panel.appendChild(launchBtn);
    panel.appendChild(clearBtn);

    this.container.appendChild(panel);
  }

  launch() {
    const rad = (this.angle * Math.PI) / 180;
    const vx = this.velocity * Math.cos(rad);
    const vy = this.velocity * Math.sin(rad);

    this.projectiles.push({
      x: 50,
      y: this.height - 50,
      vx,
      vy,
      age: 0,
    });
  }

  update(dt) {
    this.projectiles = this.projectiles.filter((p) => {
      p.x += p.vx * this.scale * dt;
      p.y -= p.vy * this.scale * dt;
      p.vy -= this.gravity * dt;
      p.age += dt;

      this.trail.push({ x: p.x, y: p.y });

      return p.y < this.height && p.x < this.width && p.age < 10;
    });
  }

  draw() {
    // Ground
    this.ctx.strokeStyle = 'var(--accent-cyan)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height - 50);
    this.ctx.lineTo(this.width, this.height - 50);
    this.ctx.stroke();

    // Trail
    if (this.trail.length > 1) {
      this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      this.ctx.stroke();
    }

    // Projectiles
    this.projectiles.forEach((p) => {
      this.ctx.fillStyle = 'var(--accent-yellow)';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Info text
    this.ctx.fillStyle = 'var(--text-secondary)';
    this.ctx.font = '12px sans-serif';
    this.ctx.fillText(`Angle: ${this.angle}° | Velocity: ${this.velocity} m/s`, 10, 20);
  }
}
