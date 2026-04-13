# PhysicsQuest GitHub Pages Deployment Guide

## Quick Start

Your PhysicsQuest application is ready to deploy to GitHub Pages. Follow these steps:

### Option 1: Deploy to Root of `main` Branch (Recommended)

1. **Extract the bundle:**
   ```bash
   tar -xzf physicsquest-deploy.tar.gz
   ```

2. **Replace repository contents with the deployment files:**
   ```bash
   cd /path/to/your/local/BenGothard/physics/repository
   rm -rf ./* .gitignore
   # Extract physicsquest files here
   tar -xzf physicsquest-deploy.tar.gz --strip-components=1 .
   ```

3. **Commit and push to main:**
   ```bash
   git add .
   git commit -m "Deploy PhysicsQuest to GitHub Pages"
   git push origin main
   ```

4. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `/ (root)`
   - Click Save

5. **Site will be live at:**
   ```
   https://bengothard.github.io/physics/
   ```

---

### Option 2: Deploy to `/docs` Folder on `main` Branch

1. **Create docs folder:**
   ```bash
   mkdir -p docs
   cd docs
   tar -xzf ../physicsquest-deploy.tar.gz --strip-components=1 .
   cd ..
   ```

2. **Commit and push:**
   ```bash
   git add docs/
   git commit -m "Deploy PhysicsQuest to GitHub Pages"
   git push origin main
   ```

3. **Enable GitHub Pages:**
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `/docs`
   - Click Save

---

### Option 3: Deploy from Your Feature Branch

1. **Push the current branch:**
   ```bash
   git push origin claude/gamify-physics-learning-lCJcP
   ```

2. **Enable GitHub Pages:**
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `claude/gamify-physics-learning-lCJcP` / `/ (root)`
   - Click Save

3. **Site will be live at:**
   ```
   https://bengothard.github.io/physics/
   ```

---

## File Structure

The deployment includes:

```
/
├── index.html              # SPA shell
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── .nojekyll              # Tells GitHub Pages to skip Jekyll
├── README.md              # Documentation
├── css/                   # 11 CSS files (dark sci-fi theme)
├── js/
│   ├── app.js
│   ├── router.js
│   ├── store.js
│   ├── xp.js
│   ├── sound.js
│   ├── utils.js
│   ├── achievements.js
│   ├── streak.js
│   ├── daily-challenge.js
│   ├── pages/             # 12 page renderers
│   ├── components/        # UI components
│   └── simulations/       # 4 physics simulations
└── data/
    ├── courses.json       # 56 lessons
    ├── skill-tree.json    # 60+ skill nodes
    ├── achievements.json  # 50+ achievements
    ├── levels.json        # 100-level progression
    └── quizzes/           # Quiz data
```

---

## Testing Locally

Before deploying, test locally:

```bash
cd /path/to/deployed/files
python3 -m http.server 8000
# Open http://localhost:8000
```

---

## What's Deployed

✅ Complete PhysicsQuest application
- 56 physics lessons (Lewin + Feynman)
- Gamification system (XP, levels, achievements, streaks)
- 4 interactive simulations
- Skill tree with boss battles
- Quiz system
- PWA support (offline + mobile installation)
- Responsive design
- Web Audio sound synthesis

✅ Zero external dependencies
- No build step
- No npm packages
- Pure vanilla JavaScript
- CDN libraries only (KaTeX, Canvas-Confetti, Chart.js, Howler.js)

---

## After Deployment

1. **Wait 1-2 minutes** for GitHub Pages to build and publish
2. **Visit** `https://bengothard.github.io/physics/`
3. **Test the app:**
   - Dashboard loads
   - Courses are browsable
   - Lessons have video + reading tabs
   - Quizzes work
   - XP is earned
   - Settings page works
   - PWA installs on mobile

---

## Troubleshooting

**Blank page?**
- Check browser console (F12 → Console) for errors
- Verify all files are deployed (check Network tab)

**404 errors?**
- Ensure `.nojekyll` file is in root
- Hash routing should work: `#/courses`, `#/quiz/kinematics`, etc.

**PWA not installing?**
- Ensure `manifest.json` is present
- Check browser supports Web Apps (modern Chrome/Edge/Firefox)

**Service Worker not caching?**
- Open DevTools → Application → Service Workers
- Verify `sw.js` is registered and activated

---

## Support

All state is stored in localStorage. No backend server needed.
Users can export saves (Settings → Export Save) to back up progress.

---

**PhysicsQuest is ready to launch!** 🚀
