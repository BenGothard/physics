/**
 * utils.js — Shared utilities for PhysicsQuest
 *
 * DOM helpers, formatting, array utilities, date helpers,
 * deterministic randomness, and animation.
 */

/* ------------------------------------------------------------------ */
/*  DOM helpers                                                        */
/* ------------------------------------------------------------------ */

/**
 * querySelector shorthand.
 * @param {string} selector
 * @param {Element|Document} [root=document]
 * @returns {Element|null}
 */
export function $(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * querySelectorAll shorthand (returns a real Array).
 * @param {string} selector
 * @param {Element|Document} [root=document]
 * @returns {Element[]}
 */
export function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * DOM element factory.
 *
 * @param {string} tag           Tag name, e.g. "div"
 * @param {Object} [attrs={}]    Attribute key/value pairs.
 *   - Regular strings are set via setAttribute.
 *   - Keys starting with "on" (e.g. "onclick") are added as event listeners.
 *   - "className" and "classList" are handled specially.
 *   - "style" can be a string or an object.
 *   - "dataset" accepts an object of data-* keys.
 * @param {Array<string|Node>} [children=[]]  Text strings or child nodes.
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'classList' && Array.isArray(value)) {
      el.classList.add(...value);
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key === 'dataset' && typeof value === 'object') {
      for (const [dk, dv] of Object.entries(value)) {
        el.dataset[dk] = dv;
      }
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value !== null && value !== undefined && value !== false) {
      el.setAttribute(key, value);
    }
  }

  for (const child of children) {
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }

  return el;
}

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

/**
 * Format a number with comma separators.
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  if (n == null || isNaN(n)) return '0';
  return Number(n).toLocaleString('en-US');
}

/**
 * Format milliseconds to a human-readable duration string.
 *   - >= 1 hour  → "Xh Ym"
 *   - >= 1 min   → "Xm Ys"
 *   - < 1 min    → "Xs"
 * @param {number} ms  Duration in milliseconds
 * @returns {string}
 */
export function formatTime(ms) {
  if (ms == null || ms < 0) return '0s';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/* ------------------------------------------------------------------ */
/*  Function helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * Standard debounce — delays invoking `fn` until `ms` milliseconds
 * have elapsed since the last invocation.
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
export function debounce(fn, ms) {
  let timerId = null;
  return function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), ms);
  };
}

/* ------------------------------------------------------------------ */
/*  Random / array utilities                                           */
/* ------------------------------------------------------------------ */

/**
 * Random integer in the range [min, max] (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomBetween(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Fisher-Yates shuffle. Returns a new array; does not mutate the input.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deterministic pseudo-random number generator from a numeric seed.
 * Uses a simple mulberry32 algorithm.
 *
 * Returns a function that produces numbers in [0, 1) each time it is called.
 * @param {number} seed
 * @returns {() => number}
 */
export function seededRandom(seed) {
  let s = seed | 0;
  return function next() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */

/**
 * Convert a Date (or the current date) to a "YYYY-MM-DD" key string.
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
export function dateToKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check whether a "YYYY-MM-DD" date string represents today.
 * @param {string} dateString
 * @returns {boolean}
 */
export function isToday(dateString) {
  return dateString === dateToKey(new Date());
}

/**
 * Return a "YYYY-MM-DD" string for the date N days ago.
 * @param {number} n  Number of days in the past (0 = today)
 * @returns {string}
 */
export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateToKey(d);
}

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

/**
 * Smoothly animate a numeric text value inside an element from `start`
 * to `end` over `duration` milliseconds using requestAnimationFrame.
 *
 * The element's textContent is updated each frame with the interpolated
 * integer value formatted with commas.
 *
 * @param {HTMLElement} element   Target element whose textContent is updated
 * @param {number} start         Starting numeric value
 * @param {number} end           Ending numeric value
 * @param {number} [duration=600] Animation duration in ms
 * @returns {Promise<void>}       Resolves when the animation completes
 */
export function animateValue(element, start, end, duration = 600) {
  return new Promise((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    const range = end - start;
    if (range === 0) {
      element.textContent = formatNumber(end);
      resolve();
      return;
    }

    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + range * eased);

      element.textContent = formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = formatNumber(end);
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}
