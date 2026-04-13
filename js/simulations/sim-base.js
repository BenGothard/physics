/**
 * sim-base.js — Base class for all physics simulations
 *
 * Handles canvas setup, resize, game loop, play/pause, and control panel.
 */

export class Simulation {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error(`Container #${containerId} not found`);

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.width = this.container.clientWidth;
    this.height = Math.max(400, window.innerHeight * 0.6);

    this.setupCanvas();
    this.setupControls();
    this.setupResizeListener();

    this.isRunning = false;
    this.isPaused = false;
    this.startTime = 0;
    this.pausedTime = 0;
    this.deltaTime = 0;
    this.lastFrameTime = 0;

    this.init();
    this.animate();
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.canvas.style.border = '1px solid var(--accent-cyan)';
    this.canvas.style.borderRadius = 'var(--border-radius)';
    this.canvas.style.backgroundColor = 'var(--bg-card)';
    this.ctx.scale(dpr, dpr);
  }

  setupControls() {
    const controls = document.createElement('div');
    controls.className = 'sim-controls';
    controls.style.cssText = `
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
      justify-content: center;
    `;

    const playBtn = document.createElement('button');
    playBtn.textContent = '▶ Play';
    playBtn.className = 'btn btn--sm btn--primary';
    playBtn.addEventListener('click', () => this.play());

    const pauseBtn = document.createElement('button');
    pauseBtn.textContent = '⏸ Pause';
    pauseBtn.className = 'btn btn--sm btn--secondary';
    pauseBtn.addEventListener('click', () => this.pause());

    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🔄 Reset';
    resetBtn.className = 'btn btn--sm btn--ghost';
    resetBtn.addEventListener('click', () => this.reset());

    controls.appendChild(playBtn);
    controls.appendChild(pauseBtn);
    controls.appendChild(resetBtn);

    this.container.appendChild(controls);
  }

  setupResizeListener() {
    window.addEventListener('resize', () => {
      const newWidth = this.container.clientWidth;
      if (newWidth !== this.width) {
        this.width = newWidth;
        this.setupCanvas();
      }
    });
  }

  play() {
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now() - this.pausedTime;
  }

  pause() {
    this.isPaused = true;
    this.pausedTime = Date.now() - this.startTime;
  }

  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = 0;
    this.pausedTime = 0;
    this.deltaTime = 0;
    this.lastFrameTime = 0;
    this.init();
    this.draw();
  }

  getTime() {
    if (!this.isRunning) return 0;
    if (this.isPaused) return this.pausedTime / 1000;
    return (Date.now() - this.startTime) / 1000;
  }

  animate() {
    const now = Date.now();
    if (this.lastFrameTime) {
      this.deltaTime = (now - this.lastFrameTime) / 1000;
    }
    this.lastFrameTime = now;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.isRunning && !this.isPaused) {
      this.update(this.deltaTime);
    }

    this.draw();

    requestAnimationFrame(() => this.animate());
  }

  // Overrides in subclasses
  init() {}
  update(dt) {}
  draw() {}
}
