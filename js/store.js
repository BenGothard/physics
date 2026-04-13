/**
 * store.js — LocalStorage state manager for PhysicsQuest
 *
 * Singleton Store with dot-notation access, auto-save,
 * deep-merge on load, and a lightweight event emitter.
 */

const STORAGE_KEY = 'physicsquest_save';

/**
 * Build the default state tree. Called as a function so every
 * invocation returns a fresh object graph.
 */
function createDefaults() {
  return {
    player: {
      name: 'Physicist',
      avatarId: 0,
      xp: 0,
      level: 1,
      title: 'Curious Observer',
      createdAt: new Date().toISOString(),
      totalStudyTimeMs: 0,
    },
    streak: {
      current: 0,
      longest: 0,
      lastActiveDate: null,
      freezesAvailable: 0,
    },
    courses: {
      mechanics: {
        lectures: {},
        readings: {},
        quizzes: {},
        simulations: {},
        bossBattles: {},
      },
      electromagnetism: {
        lectures: {},
        readings: {},
        quizzes: {},
        simulations: {},
        bossBattles: {},
      },
      'waves-quantum': {
        lectures: {},
        readings: {},
        quizzes: {},
        simulations: {},
        bossBattles: {},
      },
    },
    achievements: {},
    dailyChallenges: {},
    settings: {
      soundEnabled: true,
      theme: 'dark',
      musicEnabled: true,
    },
    stats: {
      totalQuizzesTaken: 0,
      totalCorrectAnswers: 0,
      totalSimulationTime: 0,
      bossesDefeated: 0,
      perfectQuizStreak: 0,
      totalProjectilesLaunched: 0,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Utility helpers                                                    */
/* ------------------------------------------------------------------ */

/**
 * Deep-merge `source` into `target`, adding any keys present in source
 * but missing in target. Existing target values are preserved.
 */
function deepMerge(target, source) {
  if (
    source === null || source === undefined ||
    typeof source !== 'object' || Array.isArray(source)
  ) {
    return target;
  }

  for (const key of Object.keys(source)) {
    if (!(key in target)) {
      // New field — copy it in
      target[key] = structuredClone(source[key]);
    } else if (
      typeof target[key] === 'object' && target[key] !== null &&
      !Array.isArray(target[key]) &&
      typeof source[key] === 'object' && source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      deepMerge(target[key], source[key]);
    }
  }
  return target;
}

/**
 * Resolve a dot-notation path to { parent, key } so we can read/write.
 */
function resolvePath(obj, path) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] === undefined || current[parts[i]] === null) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  return { parent: current, key: parts[parts.length - 1] };
}

/* ------------------------------------------------------------------ */
/*  Store class                                                        */
/* ------------------------------------------------------------------ */

class Store {
  constructor() {
    /** @type {Object} The live state tree */
    this._state = createDefaults();
    /** @type {Map<string, Set<Function>>} Event listeners */
    this._listeners = new Map();

    // Hydrate from localStorage on creation
    this.load();
  }

  /* -------------------- persistence -------------------------------- */

  /** Read from localStorage and merge with defaults (handles new fields). */
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // Start from defaults, then layer the saved data on top,
        // but use deepMerge so new default keys are added.
        this._state = deepMerge(saved, createDefaults());
      }
    } catch (err) {
      console.warn('Store: failed to load saved state, using defaults.', err);
      this._state = createDefaults();
    }
  }

  /** Persist the current state to localStorage. */
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    } catch (err) {
      console.error('Store: failed to save state.', err);
    }
  }

  /* -------------------- dot-notation access ------------------------ */

  /**
   * Read a value by dot-notation path.
   * @param {string} path  e.g. "player.xp"
   * @returns {*}
   */
  get(path) {
    const parts = path.split('.');
    let current = this._state;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  }

  /**
   * Set a value by dot-notation path and auto-save.
   * Emits a "change" event and a "change:<path>" event.
   * @param {string} path
   * @param {*} value
   */
  set(path, value) {
    const { parent, key } = resolvePath(this._state, path);
    const previous = parent[key];
    parent[key] = value;
    this.save();
    this.emit('change', { path, value, previous });
    this.emit(`change:${path}`, { value, previous });
  }

  /**
   * Update a value using a function.
   * @param {string} path
   * @param {Function} fn  Receives current value, should return new value.
   */
  update(path, fn) {
    const current = this.get(path);
    const next = fn(current);
    this.set(path, next);
  }

  /** Reset the entire state to defaults and save. */
  reset() {
    this._state = createDefaults();
    this.save();
    this.emit('reset');
  }

  /* -------------------- import / export ---------------------------- */

  /**
   * Export current state as a JSON string (for save-file download).
   * @returns {string}
   */
  export() {
    return JSON.stringify(this._state, null, 2);
  }

  /**
   * Import state from a JSON string (for save-file upload).
   * Merges with defaults so new fields are present.
   * @param {string} json
   */
  import(json) {
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      this._state = deepMerge(data, createDefaults());
      this.save();
      this.emit('import');
      this.emit('change', { path: '*', value: this._state, previous: null });
    } catch (err) {
      console.error('Store: import failed.', err);
      throw new Error('Invalid save data');
    }
  }

  /* -------------------- event emitter ------------------------------ */

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} unsubscribe function
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);

    // Return an unsubscribe handle
    return () => {
      const set = this._listeners.get(event);
      if (set) set.delete(callback);
    };
  }

  /**
   * Emit an event to all registered listeners.
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    const set = this._listeners.get(event);
    if (!set) return;
    for (const cb of set) {
      try {
        cb(data);
      } catch (err) {
        console.error(`Store: listener error on "${event}"`, err);
      }
    }
  }

  /* -------------------- convenience -------------------------------- */

  /** Direct reference to the raw state (use sparingly). */
  get state() {
    return this._state;
  }
}

/** Singleton instance */
const store = new Store();

export { store, STORAGE_KEY };
export default store;
