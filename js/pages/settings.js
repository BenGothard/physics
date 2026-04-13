/**
 * settings.js — Settings and preferences
 */
import store from '../store.js';

export function renderSettings(params, container) {
  const soundEnabled = store.get('settings.soundEnabled') !== false;
  const theme = store.get('settings.theme') || 'dark';

  container.innerHTML = `
    <div class="page animate-fade-in" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1>Settings</h1>

      <div class="card" style="padding: 24px; margin: 24px 0;">
        <h2>Audio</h2>
        <label style="display: flex; align-items: center; margin-top: 16px; cursor: pointer;">
          <input type="checkbox" id="sound-toggle" ${soundEnabled ? 'checked' : ''} style="margin-right: 12px;">
          <span>Enable sound effects</span>
        </label>
      </div>

      <div class="card" style="padding: 24px; margin: 24px 0;">
        <h2>Player Settings</h2>
        <label style="margin-top: 16px;">
          <div style="color: var(--text-secondary); margin-bottom: 8px;">Player Name</div>
          <input type="text" value="${store.get('player.name') || 'Physicist'}" id="player-name"
            style="width: 100%; padding: 8px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--accent-cyan); border-radius: 4px;">
        </label>
      </div>

      <div class="card" style="padding: 24px; margin: 24px 0;">
        <h2>Data Management</h2>
        <button class="btn btn--secondary" style="width: 100%; margin-top: 16px;" id="export-btn">📥 Export Save</button>
        <button class="btn btn--secondary" style="width: 100%; margin-top: 12px;" id="reset-btn">🗑️ Reset Progress</button>
      </div>

      <div class="card" style="padding: 24px; margin: 24px 0;">
        <h2>About</h2>
        <p style="color: var(--text-secondary);">PhysicsQuest v0.1.0</p>
        <p style="color: var(--text-secondary); margin-top: 8px;">A gamified learning experience for physics built with vanilla JavaScript.</p>
        <p style="color: var(--text-secondary); margin-top: 8px; font-size: 0.9rem;">
          Based on Walter Lewin's MIT lectures and the Feynman Lectures on Physics.
        </p>
      </div>
    </div>`;

  document.getElementById('sound-toggle').addEventListener('change', (e) => {
    store.set('settings.soundEnabled', e.target.checked);
  });

  document.getElementById('player-name').addEventListener('blur', (e) => {
    store.set('player.name', e.target.value || 'Physicist');
  });

  document.getElementById('export-btn').addEventListener('click', () => {
    const data = store.export();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physicsquest-save-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Are you sure? This will reset all progress.')) {
      store.reset();
      alert('Progress reset. Reloading...');
      window.location.hash = '#/';
      window.location.reload();
    }
  });
}
