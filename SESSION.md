# KrishnaSongs — Session State
_Last saved: 2026-05-31_

---

## How to use this file
Paste the contents of this file at the start of a new Claude session, or say:
> "Read SESSION.md at /Users/anukrati/Documents/Krishna/krishnasongs/SESSION.md and pick up from where we left off."

---

## Project in one line
Full-screen TV teleprompter web app for ISKCON kirtan lyrics used during Bhagavad Gītā classes. Vite + vanilla JS, no framework, no backend. Deployed on Netlify. Repo: github.com/omaranu/krishnasongs.

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
| `src/controls.js` | initControls(onExit), initControlBarHide, showControlBar, resetHideTimer |
| `src/display.js` | enterDisplayMode, exitDisplayMode |
| `src/home.js` | initHome |
| `src/style.css` | Sacred luxury theme — deep blue/purple + gold |
| `src/data/kirtans.json` | 11 kirtans with lyrics, translations, image pairings |
| `index.html` | Two screens: home (selector) + display (teleprompter) |
| `public/assets/images/<kirtan-id>/` | Per-kirtan background images |

---

## What was built (Phase 2 — this session)

### Features
- **Translation toggle** in control bar — per-verse translation text shown below each verse block; button hidden when kirtan has no translations
- **Next/Previous verse buttons** (⏮/⏭) flanking play button + `←`/`→` keyboard shortcuts
- **Verse-image pairing** via IntersectionObserver — `imageIndex` for single images, `imageRange: [start, end]` for cycling (maha-mantra cycles 4 images, then shows dedicated images for ending verses)
- **Lotus SVG** replaces ॐ on home screen
- **Home screen cleanup** — removed subtitle, source field, footer; larger label + composer fonts
- **Permanent bottom gradient veil** — decoupled from control bar so it always shows, masking particle origin
- **Auto comma-split** in `renderLyrics` — lines break at `, ` automatically across all kirtans
- **Lyric text glow** — near-white colour, weight 500, three-layer warm gold text-shadow

### Kirtan content added
- **Kṛṣṇa Jinakā Nāma Hai** — 6 verses, full English translations, 6 image slots (images already in folder)
- **Maha-mantra ending verses** — Jai Prabhupāda!, Jai Gurudev!, Nitāi Gaura Haribol! with dedicated image slots (need images: `jai-prabhupada.jpg`, `jai-gurudev.jpg`, `nitai-gaura-haribol.jpg` in `public/assets/images/hare-krishna-maha-mantra/`)

### Code quality fixes (from external review)
- `canvas.getContext('2d')` cached once; particle rAF loop exits cleanly when disabled
- `window.innerWidth/H` cached; `resizeCanvas` uses `setTransform` (no cumulative scale drift)
- DPR re-read on every resize (correct on multi-monitor)
- `kirtans.json` bundled via ES import — works fully offline, no fetch error risk
- `bgCurrentIndex` wraps with modulo; sentinel `-1` prevents first-render guard misfire
- Image `onerror` falls back to gradient cycle
- `lastBestEl` guard removed from IntersectionObserver (was suppressing valid re-triggers)
- `jumpToVerse` uses `getBoundingClientRect` (layout-stable)
- `renderKirtanOverlay` uses `textContent` (XSS safe)
- `will-change: transform` on canvas; `:focus-visible` gold outline added

---

## Current state
- ✅ All changes committed and pushed to `main` (commit `0aead3d`)
- ✅ Local `dist/` built and dev server running on `http://localhost:5173`
- ⏳ 3 images still needed for maha-mantra ending verses (see above)
- ⏳ Images for `krsna-jinaka-nama-hai` are in folder but the `imageIndex` fields are wired — ready to go

---

## Next steps (prioritised)

### 1. ✅ Module split — DONE
730-line monolith split into 10 ES modules. Build passes, dev server confirmed working.

### 2. Add more kirtans
Each kirtan needs: `id`, `title`, `composer`, `content[]` blocks (type: verse/refrain/continuous/gap), optional `translation` per block, optional `imageIndex`/`imageRange`, optional `images[]` filenames.

### 3. Schema validation
Add a dev-time validator that warns when `imageIndex` is out of range or `imageRange` exceeds `images.length`. Review report has the exact code snippet.

### 4. Remaining review items deferred
- `mode` field in JSON is declared but never used — either drive rendering from it or remove
- `source` field present on all kirtans but unused — remove or display as attribution
- Per-frame `ctx.createRadialGradient` for 160 particles — GC pressure; could pre-bake sprites

---

## Key data schema (quick reference)
```json
{
  "id": "kebab-case",
  "title": "Display title with diacriticals",
  "composer": "Composer name",
  "images": ["file1.jpg", "file2.jpg"],
  "content": [
    { "type": "verse", "imageIndex": 0, "lines": ["line 1", "line 2"], "translation": "..." },
    { "type": "gap" },
    { "type": "continuous", "imageRange": [0, 3], "lines": ["..."] }
  ]
}
```
Block types: `verse`, `refrain`, `continuous`, `gap`

## Keyboard shortcuts (display mode)
| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `←` / `→` | Prev / Next verse |
| `↑` / `↓` | Scroll 80px |
| `Home` | Back to top |
| `Esc` | Back to home screen |

---

## How to start dev server
```bash
cd /Users/anukrati/Documents/Krishna/krishnasongs
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
```
