/**
 * nav.js — Top navigation bar for PhysicsQuest
 *
 * Exports renderNav(container) and updateNav().
 * Displays logo, navigation links, player stats (streak, XP, level),
 * sound toggle, and a mobile hamburger menu.
 */

import store from '../store.js';
import { getLevelProgress, getLevelTitle } from '../xp.js';
import { formatNumber } from '../utils.js';
import soundManager from '../sound.js';

/* ------------------------------------------------------------------ */
/*  Module-level references for updateNav()                            */
/* ------------------------------------------------------------------ */

let navContainer = null;

/* ------------------------------------------------------------------ */
/*  Nav links                                                          */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: 'Dashboard', hash: '#/' },
  { label: 'Courses', hash: '#/courses' },
  { label: 'Skill Tree', hash: '#/skill-tree' },
  { label: 'Challenges', hash: '#/challenges' },
  { label: 'Sandbox', hash: '#/sandbox' },
];

/* ------------------------------------------------------------------ */
/*  Render                                                             */
/* ------------------------------------------------------------------ */

/**
 * Render the full navigation bar into the given container element.
 * @param {HTMLElement} container
 */
export function renderNav(container) {
  navContainer = container;

  const xp = store.get('player.xp') || 0;
  const progress = getLevelProgress(xp);
  const level = progress.level;
  const pct = Math.round(progress.progress * 100);
  const streak = store.get('streak.current') || 0;
  const soundOn = store.get('settings.soundEnabled') !== false;

  const linksHTML = NAV_LINKS.map((link) => {
    const active = window.location.hash === link.hash ||
      (link.hash === '#/' && (!window.location.hash || window.location.hash === '#'));
    return `<a href="${link.hash}" class="nav__link${active ? ' nav__link--active' : ''}">${link.label}</a>`;
  }).join('');

  container.innerHTML = `
    <div class="nav-bar">
      <!-- Left: Logo -->
      <a href="#/" class="nav__logo" aria-label="PhysicsQuest Home">
        <span class="nav__logo-icon">
          <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="5" fill="var(--accent-cyan)"/>
            <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="var(--accent-cyan)" stroke-width="2"/>
            <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="var(--accent-cyan)" stroke-width="2" transform="rotate(60 32 32)"/>
            <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="var(--accent-cyan)" stroke-width="2" transform="rotate(120 32 32)"/>
          </svg>
        </span>
        <span class="nav__logo-text">PhysicsQuest</span>
      </a>

      <!-- Center: Navigation links (desktop) -->
      <div class="nav__links" id="nav-links">
        ${linksHTML}
      </div>

      <!-- Right: Player info -->
      <div class="nav__player">
        <!-- Streak -->
        <div class="nav__streak tooltip" data-tooltip="${streak} day streak">
          <span class="nav__streak-flame">&#128293;</span>
          <span class="nav__streak-count" id="nav-streak-count">${streak}</span>
        </div>

        <!-- XP mini bar -->
        <div class="nav__xp tooltip" data-tooltip="Level ${level} — ${pct}% to next level">
          <div class="nav__xp-bar">
            <div class="nav__xp-fill" id="nav-xp-fill" style="width: ${pct}%;"></div>
          </div>
        </div>

        <!-- Level badge -->
        <div class="nav__level tooltip" data-tooltip="${getLevelTitle(level)}" id="nav-level-badge">
          <span id="nav-level-number">${level}</span>
        </div>

        <!-- Sound toggle -->
        <button class="nav__sound-btn icon-btn icon-btn--sm tooltip"
                data-tooltip="${soundOn ? 'Mute sounds' : 'Unmute sounds'}"
                id="nav-sound-toggle"
                aria-label="Toggle sound">
          <span id="nav-sound-icon">${soundOn ? '&#128266;' : '&#128264;'}</span>
        </button>

        <!-- Hamburger (mobile) -->
        <button class="nav__hamburger icon-btn icon-btn--sm" id="nav-hamburger" aria-label="Toggle menu">
          <span class="nav__hamburger-icon" id="nav-hamburger-icon">&#9776;</span>
        </button>
      </div>
    </div>

    <!-- Mobile dropdown -->
    <div class="nav__mobile-menu hidden" id="nav-mobile-menu">
      ${NAV_LINKS.map((link) => `<a href="${link.hash}" class="nav__mobile-link">${link.label}</a>`).join('')}
    </div>
  `;

  // Attach event listeners
  attachNavEvents();
}

/* ------------------------------------------------------------------ */
/*  Event listeners                                                    */
/* ------------------------------------------------------------------ */

function attachNavEvents() {
  // Sound toggle
  const soundBtn = document.getElementById('nav-sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const current = store.get('settings.soundEnabled') !== false;
      store.set('settings.soundEnabled', !current);

      const icon = document.getElementById('nav-sound-icon');
      if (icon) {
        icon.innerHTML = !current ? '&#128266;' : '&#128264;';
      }
      soundBtn.setAttribute('data-tooltip', !current ? 'Mute sounds' : 'Unmute sounds');

      if (!current) {
        soundManager.play('click');
      }
    });
  }

  // Hamburger menu
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden', !isHidden);

      const icon = document.getElementById('nav-hamburger-icon');
      if (icon) {
        icon.innerHTML = isHidden ? '&#10005;' : '&#9776;';
      }
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('.nav__mobile-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        const icon = document.getElementById('nav-hamburger-icon');
        if (icon) icon.innerHTML = '&#9776;';
      });
    });
  }

  // Update active link on hash change
  window.addEventListener('hashchange', updateActiveLink);
}

function updateActiveLink() {
  if (!navContainer) return;
  const links = navContainer.querySelectorAll('.nav__link');
  const hash = window.location.hash || '#/';

  links.forEach((link) => {
    const href = link.getAttribute('href');
    const isActive = href === hash || (href === '#/' && (hash === '' || hash === '#'));
    link.classList.toggle('nav__link--active', isActive);
  });

  // Also update mobile links
  const mobileLinks = navContainer.querySelectorAll('.nav__mobile-link');
  mobileLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const isActive = href === hash || (href === '#/' && (hash === '' || hash === '#'));
    link.classList.toggle('nav__link--active', isActive);
  });
}

/* ------------------------------------------------------------------ */
/*  Update (partial, no full re-render)                                */
/* ------------------------------------------------------------------ */

/**
 * Update the nav's dynamic values (XP bar, level, streak) without
 * re-rendering the entire navigation bar.
 */
export function updateNav() {
  const xp = store.get('player.xp') || 0;
  const progress = getLevelProgress(xp);
  const level = progress.level;
  const pct = Math.round(progress.progress * 100);
  const streak = store.get('streak.current') || 0;

  // XP bar width
  const xpFill = document.getElementById('nav-xp-fill');
  if (xpFill) {
    xpFill.style.width = `${pct}%`;
  }

  // XP tooltip
  const xpTooltip = navContainer && navContainer.querySelector('.nav__xp');
  if (xpTooltip) {
    xpTooltip.setAttribute('data-tooltip', `Level ${level} — ${pct}% to next level`);
  }

  // Level number
  const levelNumber = document.getElementById('nav-level-number');
  if (levelNumber) {
    levelNumber.textContent = level;
  }

  // Level badge tooltip
  const levelBadge = document.getElementById('nav-level-badge');
  if (levelBadge) {
    levelBadge.setAttribute('data-tooltip', getLevelTitle(level));
  }

  // Streak count
  const streakCount = document.getElementById('nav-streak-count');
  if (streakCount) {
    streakCount.textContent = streak;
  }

  // Streak tooltip
  const streakTooltip = navContainer && navContainer.querySelector('.nav__streak');
  if (streakTooltip) {
    streakTooltip.setAttribute('data-tooltip', `${streak} day streak`);
  }
}

/* ------------------------------------------------------------------ */
/*  Auto-update on store events                                        */
/* ------------------------------------------------------------------ */

store.on('xp-gained', () => {
  updateNav();

  // Animate XP bar flash
  const xpFill = document.getElementById('nav-xp-fill');
  if (xpFill) {
    xpFill.style.transition = 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)';
    xpFill.classList.add('progress-bar__fill--animated');
    setTimeout(() => {
      xpFill.classList.remove('progress-bar__fill--animated');
    }, 1000);
  }
});

store.on('level-up', () => {
  updateNav();

  // Flash the level badge
  const levelBadge = document.getElementById('nav-level-badge');
  if (levelBadge) {
    levelBadge.classList.add('animate-pop-in');
    levelBadge.classList.add('animate-glow-gold');
    setTimeout(() => {
      levelBadge.classList.remove('animate-pop-in');
      levelBadge.classList.remove('animate-glow-gold');
    }, 2000);
  }
});
