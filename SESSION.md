# KrishnaSongs — Session State
_Last saved: 2026-06-01_

---

## How to use this file
Paste the contents of this file at the start of a new Claude session, or say:
> "Read SESSION.md at /Users/anukrati/Documents/Krishna/krishnasongs/SESSION.md and pick up from where we left off."

---

## Project in one line
Full-screen TV teleprompter web app for ISKCON kirtan lyrics used during Bhagavad Gītā classes. Vite + vanilla JS, no framework, no backend. Deployed on **krishnasongs.com** (Cloudflare Workers + Wrangler). Repo: github.com/omaranu/krishnasongs.

## Key files
| File | Purpose |
|---|---|
| `src/main.js` | Entry point — init() only (~12 lines) |
| `src/state.js` | Shared state object + SPEEDS constant |
| `src/dom.js` | All DOM element references |
| `src/renderer.js` | renderLyrics, renderKirtanOverlay |
| `src/scroll.js` | startScroll, stopScroll, scrollStep, jumpToVerse, onManualScroll |
| `src/background.js` | setupBackground, crossfadeBg, scheduleBgCycle, switchToImage, clearBgTimer |
| `src/particles.js` | initParticles, renderParticles |
| `src/observer.js` | setupVerseImageObserver, teardownVerseImageObserver, stopRangeCycle |
| `src/controls.js` | initControls(onExit), initControlBarHide, initFontScale, initFullscreen, showControlBar, resetHideTimer |
| `src/display.js` | enterDisplayMode, exitDisplayMode |
| `src/home.js` | initHome — uses import.meta.glob for lazy kirtan loading |
| `src/style.css` | Sacred luxury theme — deep blue/purple + gold |
| `src/data/kirtans.json` | Manifest only — 12 kirtans, id/title/composer |
| `src/data/kirtans/<id>.json` | Full kirtan data, one file per bhajan |
| `index.html` | Two screens: home (selector) + display (teleprompter) |
| `public/assets/images/<kirtan-id>/` | Per-kirtan background images |
| `public/assets/images/home-bg.png` | Home screen kirtan celebration background |
| `wrangler.toml` | Cloudflare Workers static asset config |

---

## Current state (commit e408d25)
- ✅ Deployed live at **krishnasongs.com** (Cloudflare Workers, auto-deploys on git push)
- ✅ 10 ES modules — clean modular architecture
- ✅ 12 kirtans, per-bhajan JSON files, manifest-based lazy loading
- ✅ Home screen redesign — kirtan celebration bg image, title at top, controls at bottom, inverted arch gradient veil
- ✅ Fullscreen button in control bar + F key shortcut; Esc exits fullscreen before exiting display mode
- ✅ Font size A−/A+ controls (0.75×–1.5×, persisted in localStorage)
- ✅ Hare Krishna Maha-mantra — fullscreen closing screens (Jai Prabhupāda / Jai Gurudev / Nitāi Gaura Haribol) with 2× font and dedicated images
- ⚠️ Fast scroll speed bumped to 25 px/s (was 22) — **NOT YET COMMITTED** (src/state.js modified)

## Uncommitted changes
- `src/state.js` — SPEEDS.fast changed from 22 → 25 (15% faster). Commit when ready.

---

## Dropdown order (13 kirtans)
1. Hare Krishna Mahā-mantra
2. ✅ Maṅgalācaraṇa
3. Kṛṣṇa Jinakā Nāma Hai
4. Mahā-prasāde Govinde
5. Jaya Rādhā Mādhava
6. Śrī Guru Vandanā
7. Govinda Jaya Jaya
8. Śrī Kṛṣṇa Caitanya
9. Nṛsiṁha Praṇāma
10. Bhaja Hure Mana
11. Nitāi-pada-kamala
12. Gopāla Govinda
13. Śrī Gurv-aṣṭakam

---

## Next steps (prioritised)
1. ✅ **Maṅgalācaraṇa added** — `src/data/kirtans/mangalacharan.json`, 10 blocks (8 verses + 2 continuous), translations on all verse blocks, no images yet
2. **Unit tests (Vitest)** — discussed but not started. Most valuable: scroll math, speed mapping, imageIndex validation, font scale clamping
3. **Schema validator** — dev-time warning when imageIndex out of range
4. **Images for remaining kirtans** — several still have `images: []`
5. **Remaining review items** — `mode` field unused; `source` field unused

---

## Commit rule
**NO commits without explicit user sign-off.** User must say "commit" or "commit please" before any git commit is made.

---

## Deployment
```
git push → Cloudflare builds (npm run build) → krishnasongs.com live (~30s)
```

## Dev server
```bash
cd /Users/anukrati/Documents/Krishna/krishnasongs
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
```

## Key data schema
```json
{
  "id": "kebab-case",
  "title": "Display title with diacriticals",
  "composer": "Composer name",
  "images": ["file1.jpg"],
  "content": [
    { "type": "verse", "imageIndex": 0, "lines": ["line 1"], "translation": "..." },
    { "type": "verse", "fullscreen": true, "imageIndex": 1, "lines": ["Jai Prabhupāda!"] },
    { "type": "gap" },
    { "type": "continuous", "imageRange": [0, 3], "lines": ["..."] }
  ]
}
```
Block types: `verse`, `refrain`, `continuous`, `gap`
Special flags: `fullscreen: true` → 100vh block, 2× font, vertically centred

## Keyboard shortcuts (display mode)
| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `←` / `→` | Prev / Next verse |
| `↑` / `↓` | Scroll 80px |
| `Home` | Back to top |
| `F` | Toggle fullscreen |
| `Esc` | Exit fullscreen (first), then back to home |
