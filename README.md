# PhysicsQuest 🚀

> Master physics through an epic gamified learning adventure inspired by Elon Musk's philosophy: *"The best part is no part, the best process is no process."* We've stripped away friction and maxed out engagement.

**PhysicsQuest** is a fully-featured, vanilla JavaScript physics learning platform that makes mastering classical mechanics, electromagnetism, and waves genuinely fun.

## 🎮 Features

### Core Gamification
- **100-Level Progression** — Quadratic XP curve with physics-themed titles (Novice Physicist → Cosmic Sage)
- **50+ Achievements** — Across 5 categories: Discovery, Mastery, Dedication, Experiment, Boss Battles
- **Daily Streaks** — Track consecutive days with flame emoji. Milestone rewards at 7-day and 30-day streaks
- **Daily Challenges** — Rotating 5-challenge types with +60 XP per day
- **Boss Battles** — 7 themed bosses to unlock new course content
- **Skill Tree** — Interactive prerequisite-based progression through 60+ nodes

### Learning Content
- **56 Lessons** — 3 courses: Classical Mechanics, Electromagnetism, Waves & Quantum
- **Feynman Lecture Integration** — Links to *The Feynman Lectures on Physics*
- **Interactive Simulations** — Projectile motion, pendulum, spring oscillator
- **Quiz System** — Immediate feedback and XP rewards

### Technical Excellence
- **Fully Vanilla JS** — No build step, no dependencies (CDN libraries only)
- **Progressive Web App** — Works offline, installable on mobile
- **Responsive Design** — Dark sci-fi aesthetic across all devices
- **Sound Synthesis** — Web Audio API sounds
- **Fast Loading** — Single-page app, ~10KB JavaScript

## 🏗️ Project Structure

```
/physics
├── index.html              # SPA shell
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── data/
│   ├── courses.json        # 56 lessons
│   ├── skill-tree.json     # 60+ nodes
│   ├── achievements.json   # 50+ achievements
│   └── quizzes/            # Quiz data
├── js/
│   ├── app.js              # Router + initialization
│   ├── router.js           # Hash-based routing
│   ├── store.js            # State management
│   ├── xp.js               # Progression system
│   ├── sound.js            # Audio synthesis
│   ├── pages/              # Page renderers
│   ├── components/         # UI components
│   └── simulations/        # Physics simulations
└── css/                    # Styling (11 files)
```

## 📋 Core Pages

| Route | Feature |
|-------|---------|
| `#/` | Dashboard with player stats |
| `#/courses` | Browse 3 physics courses |
| `#/courses/:courseId/:lessonId` | Video, reading, simulation, quiz |
| `#/skill-tree` | Interactive progression tree |
| `#/boss/:bossId` | Boss battle arena |
| `#/sandbox` | Free-play simulations |
| `#/profile` | Stats and achievements |
| `#/challenges` | Daily challenge |
| `#/settings` | Preferences and save/reset |

## 💾 Data Storage

All state in localStorage:
- No server needed
- Export/import saves as JSON
- Fully offline functional

## 🚀 Deploy to GitHub Pages

1. Push this branch to GitHub
2. GitHub Settings → Pages
3. Deploy from branch `claude/gamify-physics-learning-lCJcP`
4. Site live at `https://bengothard.github.io/physics/`

## 🧪 Local Testing

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

## 📚 Curriculum

**Course 1: Classical Mechanics** (21 lessons)
- Kinematics, forces, energy, momentum, oscillations, rotation

**Course 2: Electromagnetism** (20 lessons)
- Charges, fields, circuits, magnetic forces, induction

**Course 3: Waves & Quantum** (15 lessons)
- Oscillations, waves, interference, quantum fundamentals

Each lesson → Lewin video + Feynman reading + simulation + quiz

## ✅ Completion Status

- [x] Batch 1: Core foundation (router, store, XP, sound, nav)
- [x] Chunk A: Course navigation (56 lessons with curriculum data)
- [x] Chunk B: Gamification (achievements, quizzes, streaks, daily challenges)
- [x] Chunk C: Simulations, skill tree, boss battles, PWA

**Total**: 27 JS files, 11 CSS files, 6 JSON files, 100% vanilla JS, 0 build steps

## 🎯 Next Steps (Optional)

- Expand simulation library (collisions, orbits, e-field, circuits)
- Add more quizzes per topic
- Leaderboard with backend (optional)
- YouTube video embed with Lewin lecture IDs
