/**
 * skill-tree.js — Interactive skill tree visualization
 */
import store from '../store.js';

export function renderSkillTree(params, container) {
  container.innerHTML = `
    <div class="page animate-fade-in">
      <h1>Skill Tree</h1>
      <p style="color: var(--text-secondary); margin-bottom: 24px;">Master physics through skill progression. Complete prerequisites to unlock new content.</p>

      <div style="background: var(--bg-card); border-radius: var(--border-radius); padding: 16px; margin-bottom: 24px;">
        <h3>How it works:</h3>
        <ul style="color: var(--text-secondary); line-height: 1.8;">
          <li>⭐ <strong>Gold nodes</strong> = Completed</li>
          <li>🟢 <strong>Green nodes</strong> = Available to start</li>
          <li>🔒 <strong>Gray nodes</strong> = Locked (complete prerequisites first)</li>
          <li>⚔️ <strong>Red nodes</strong> = Boss battles</li>
        </ul>
      </div>

      <div style="overflow-x: auto;">
        <svg width="1200" height="600" style="border: 1px solid var(--accent-cyan); border-radius: var(--border-radius); background: var(--bg-primary);">
          <defs>
            <style>
              .skill-node { cursor: pointer; transition: all 0.2s ease; }
              .skill-node:hover { filter: brightness(1.2); }
              .skill-node.completed { fill: var(--xp-gold); }
              .skill-node.available { fill: var(--accent-green); }
              .skill-node.locked { fill: var(--text-muted); opacity: 0.5; cursor: default; }
              .skill-node.boss { fill: var(--accent-red); }
              .skill-node-text { font-size: 10px; text-anchor: middle; dominant-baseline: middle; font-weight: bold; }
              .skill-connection { stroke: var(--accent-cyan); stroke-width: 2; fill: none; }
              .skill-connection.locked { stroke: var(--text-muted); stroke-dasharray: 4 4; }
            </style>
          </defs>
        </svg>
      </div>

      <div style="margin-top: 32px; padding: 16px; background: var(--bg-card); border-radius: var(--border-radius);">
        <h3>Legend</h3>
        <p style="color: var(--text-secondary); margin: 0;">Complete lessons to progress through the skill tree. Boss battles mark the end of each unit section.</p>
      </div>
    </div>`;

  fetch('data/skill-tree.json')
    .then(r => r.json())
    .then(data => {
      const svg = container.querySelector('svg');
      if (!svg) return;

      let allNodes = [];
      data.branches.forEach(branch => {
        allNodes = allNodes.concat(branch.nodes.map(n => ({ ...n, branchId: branch.id })));
      });

      const completedSet = new Set();
      allNodes.forEach(node => {
        if (isNodeCompleted(node.id)) completedSet.add(node.id);
      });

      const isUnlocked = (node) => {
        if (node.prerequisites.length === 0) return true;
        return node.prerequisites.every(prereqId => completedSet.has(prereqId));
      };

      // Draw connections first (behind nodes)
      allNodes.forEach(node => {
        node.prerequisites.forEach(prereqId => {
          const prereq = allNodes.find(n => n.id === prereqId);
          if (!prereq) return;
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', prereq.x + 30);
          line.setAttribute('y1', prereq.y + 30);
          line.setAttribute('x2', node.x + 30);
          line.setAttribute('y2', node.y + 30);
          const unlocked = isUnlocked(node);
          line.setAttribute('class', `skill-connection${unlocked ? '' : ' locked'}`);
          svg.appendChild(line);
        });
      });

      // Draw nodes
      allNodes.forEach(node => {
        const completed = completedSet.has(node.id);
        const unlocked = isUnlocked(node);
        const isBoss = node.type === 'boss';

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x + 30);
        circle.setAttribute('cy', node.y + 30);
        circle.setAttribute('r', isBoss ? 20 : 15);

        let stateClass = 'locked';
        if (completed) stateClass = 'completed';
        else if (isBoss && unlocked) stateClass = 'boss';
        else if (unlocked) stateClass = 'available';

        circle.setAttribute('class', `skill-node ${stateClass}`);

        if (unlocked) {
          circle.addEventListener('click', () => {
            if (node.type === 'lesson' && node.lessonId) {
              window.location.hash = `#/courses/mechanics/${node.lessonId}`;
            } else if (node.type === 'boss' && node.bossId) {
              window.location.hash = `#/boss/${node.bossId}`;
            }
          });
        }

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x + 30);
        text.setAttribute('y', node.y + 30);
        text.setAttribute('class', 'skill-node-text');
        text.setAttribute('fill', 'white');
        text.textContent = isBoss ? '⚔' : (completed ? '✓' : (unlocked ? '○' : '🔒'));

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = node.title || node.id;

        group.appendChild(circle);
        group.appendChild(text);
        group.appendChild(title);
        svg.appendChild(group);
      });
    });
}

function isNodeCompleted(nodeId) {
  return !!(
    store.get(`courses.mechanics.lectures.${nodeId}.watched`) ||
    store.get(`courses.electromagnetism.lectures.${nodeId}.watched`) ||
    store.get(`courses.waves-quantum.lectures.${nodeId}.watched`)
  );
}
