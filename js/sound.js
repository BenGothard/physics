/**
 * sound.js — Programmatic sound-effect manager for PhysicsQuest
 *
 * Uses the Web Audio API to synthesise short sound effects entirely
 * in code — no external audio files required.
 */

import store from './store.js';

/* ------------------------------------------------------------------ */
/*  Sound definitions                                                  */
/* ------------------------------------------------------------------ */

/**
 * Each definition is a function that receives an AudioContext and
 * its destination, creates the needed nodes, and starts playback.
 */
const SOUND_DEFS = {
  /**
   * correct — short ascending two-tone chime (C5 → E5)
   */
  correct(ctx, dest) {
    const now = ctx.currentTime;

    // Tone 1 — C5 (523 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 523.25;
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1).connect(dest);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Tone 2 — E5 (659 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 659.25;
    gain2.gain.setValueAtTime(0.3, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.connect(gain2).connect(dest);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.3);
  },

  /**
   * wrong — short low buzz (200 Hz for ~200 ms)
   */
  wrong(ctx, dest) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 200;
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain).connect(dest);
    osc.start(now);
    osc.stop(now + 0.2);
  },

  /**
   * levelUp — ascending arpeggio C4 → E4 → G4 → C5
   */
  levelUp(ctx, dest) {
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
    const noteLen = 0.12;
    const gap = 0.1;

    notes.forEach((freq, i) => {
      const start = now + i * gap;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteLen);
      osc.connect(gain).connect(dest);
      osc.start(start);
      osc.stop(start + noteLen);
    });
  },

  /**
   * achievement — sparkle sound (quick high-frequency notes)
   */
  achievement(ctx, dest) {
    const now = ctx.currentTime;
    const notes = [1318.5, 1568.0, 2093.0, 1568.0, 2093.0, 2637.0]; // E6, G6, C7, G6, C7, E7
    const noteLen = 0.06;
    const gap = 0.05;

    notes.forEach((freq, i) => {
      const start = now + i * gap;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteLen);
      osc.connect(gain).connect(dest);
      osc.start(start);
      osc.stop(start + noteLen);
    });
  },

  /**
   * bossIntro — ominous low drone with rising pitch
   */
  bossIntro(ctx, dest) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.8);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc.connect(gain).connect(dest);
    osc.start(now);
    osc.stop(now + 1.0);
  },

  /**
   * bossVictory — triumphant fanfare
   */
  bossVictory(ctx, dest) {
    const now = ctx.currentTime;
    const notes = [392.0, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
    const noteLen = 0.2;
    const gap = 0.15;

    notes.forEach((freq, i) => {
      const start = now + i * gap;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteLen);
      osc.connect(gain).connect(dest);
      osc.start(start);
      osc.stop(start + noteLen);
    });

    // Sustained final chord
    const chordStart = now + notes.length * gap;
    [783.99, 987.77, 1174.66].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, chordStart);
      gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.6);
      osc.connect(gain).connect(dest);
      osc.start(chordStart);
      osc.stop(chordStart + 0.6);
    });
  },

  /**
   * click — short tick (1000 Hz for 50 ms)
   */
  click(ctx, dest) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain).connect(dest);
    osc.start(now);
    osc.stop(now + 0.05);
  },

  /**
   * xpGain — subtle blip (800 Hz for 30 ms)
   */
  xpGain(ctx, dest) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain).connect(dest);
    osc.start(now);
    osc.stop(now + 0.03);
  },

  /**
   * streak — rewarding ascending ping
   */
  streak(ctx, dest) {
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25]; // A4, C#5, E5
    const noteLen = 0.1;
    const gap = 0.08;

    notes.forEach((freq, i) => {
      const start = now + i * gap;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteLen);
      osc.connect(gain).connect(dest);
      osc.start(start);
      osc.stop(start + noteLen);
    });
  },
};

/* ------------------------------------------------------------------ */
/*  SoundManager class                                                 */
/* ------------------------------------------------------------------ */

class SoundManager {
  constructor() {
    /** @type {AudioContext|null} */
    this._ctx = null;
  }

  /**
   * Lazily initialise the AudioContext (must happen after a user gesture
   * on most browsers).
   * @returns {AudioContext}
   */
  _getContext() {
    if (!this._ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this._ctx = new AudioCtx();
    }
    // Resume if suspended (autoplay policy)
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  }

  /**
   * Play a named sound effect.
   * @param {string} name  One of the keys in SOUND_DEFS
   */
  play(name) {
    // Respect the user's sound-enabled setting
    if (!store.get('settings.soundEnabled')) return;

    const def = SOUND_DEFS[name];
    if (!def) {
      console.warn(`SoundManager: unknown sound "${name}"`);
      return;
    }

    try {
      const ctx = this._getContext();
      def(ctx, ctx.destination);
    } catch (err) {
      console.warn(`SoundManager: playback failed for "${name}"`, err);
    }
  }

  /**
   * List all available sound names (useful for debugging / UI).
   * @returns {string[]}
   */
  list() {
    return Object.keys(SOUND_DEFS);
  }
}

/** Singleton instance */
const soundManager = new SoundManager();

export { soundManager, SoundManager };
export default soundManager;
