# KrishnaSongs — Session State
_Last saved: 2026-06-14_

---

## How to use this file
Paste the contents of this file at the start of a new Claude session, or say:
> "Read SESSION.md at /Users/anukrati/Documents/Krishna/krishnasongs/SESSION.md and pick up from where we left off."

---

## Project in one line
Full-screen TV teleprompter web app for ISKCON kirtan lyrics used during Bhagavad Gītā classes. Vite + vanilla JS, no framework, no backend. Deployed on **krishnasongs.com** (Cloudflare Workers + Wrangler). Repo: github.com/omaranu/krishnasongs.

## Deployment — CRITICAL
```
git push origin main → Cloudflare auto-builds → krishnasongs.com live (~30s)
```
**Never run `npx wrangler deploy` locally.** No CLOUDFLARE_API_TOKEN needed. Just `git push`.

## Key files
| File | Purpose |
|---|---|
| `src/main.js` | Entry point — init() only |
| `src/state.js` | Shared state object + SPEEDS constant |
| `src/dom.js` | All DOM element references |
| `src/renderer.js` | renderLyrics, renderKirtanOverlay |
| `src/scroll.js` | startScroll, stopScroll, scrollStep, jumpToVerse |
| `src/background.js` | setupBackground, crossfadeBg, scheduleBgCycle |
| `src/particles.js` | initParticles, renderParticles |
| `src/observer.js` | setupVerseImageObserver, teardownVerseImageObserver |
| `src/controls.js` | initControls, initControlBarHide, initFontScale, initFullscreen |
| `src/display.js` | enterDisplayMode, exitDisplayMode |
| `src/home.js` | initHome — lazy kirtan loading via import.meta.glob |
| `src/style.css` | Sacred luxury theme — deep blue/purple + gold |
| `src/data/kirtans.json` | **Manifest only** — 15 kirtans, id/title/composer |
| `src/data/kirtans/<id>.json` | Full kirtan data, one file per bhajan |
| `index.html` | Two screens: home (selector) + display (teleprompter) |
| `public/assets/images/<kirtan-id>/` | Per-kirtan background images |
| `public/assets/images/home-bg.png` | Home screen background |
| `public/favicon.png` | Golden lotus favicon |

---

## Current state (commit d7988c8)
- ✅ Deployed live at **krishnasongs.com**
- ✅ 15 kirtans in manifest, all JSON files present
- ✅ Page title: "krishnasongs.com — Krishna Bhajans" (no ISKCON reference)
- ✅ Golden lotus favicon
- ✅ SPEEDS.fast = 30 px/s

---

## Dropdown order (15 kirtans)
1. Hare Krishna Mahā-mantra
2. Maṅgalācaraṇa
3. Mahā-prasāde Govinde
4. Kṛṣṇa Jinakā Nāma Hai
5. Narasiṁha Ārtī
6. Jaya Rādhā Mādhava
7. Ayodhyā Vāsī Rāma
8. Tulasī Āratī
9. Śrī Guru Vandanā
10. Govinda Jaya Jaya
11. Śrī Kṛṣṇa Caitanya
12. Bhaja Hure Mana
13. Nitāi-pada-kamala
14. Gopāla Govinda
15. Śrī Gurv-aṣṭakam

---

## Architecture rules — MUST follow in every session

### Data schema
```json
{
  "id": "kebab-case",
  "title": "Display title with diacritics",
  "composer": "Composer name",
  "images": ["filename.png"],
  "content": [
    { "type": "verse", "imageIndex": 0, "lines": ["line 1"], "translation": "..." },
    { "type": "continuous", "imageRange": [0, 3], "lines": ["..."] },
    { "type": "gap" }
  ]
}
```
- Block types: `verse`, `refrain`, `continuous`, `gap`
- `imageIndex`: integer → single image for that block
- `imageRange`: [start, end] → cycles through images start–end
- `fullscreen: true` → 100vh block, 2× font, vertically centred (use sparingly)
- `translation`: string → shown below block when translation toggle is on
- Lines are **lowercase** to match Sanskrit transliteration convention

### Images
- Folder: `public/assets/images/<kirtan-id>/`
- Naming: `<kirtan-id>-1.png`, `<kirtan-id>_1.png`, or `<kirtan-id>_1.jpeg`
- Always add a `README.txt` to each image folder
- Always list filenames in `images[]` array in the kirtan JSON
- imageIndex is 0-based

### Manifest (kirtans.json)
- **NEVER truncate or overwrite the full manifest** — only add/reorder entries
- Always verify the full list after any session that touched kirtans.json

### Commit rule
**NO commits without explicit user sign-off.** User must say "commit" or "yes" before any git commit.

---

## Next steps
1. **Images for remaining kirtans** — Śrī Guru Vandanā, Govinda Jaya Jaya, Śrī Kṛṣṇa Caitanya, Bhaja Hure Mana, Nitāi-pada-kamala, Gopāla Govinda, Śrī Gurv-aṣṭakam all have `images: []`
2. **Translations** for kirtans that don't have them yet
3. **Ayodhyā Vāsī Rāma** — font/layout still being tuned (6-line verse blocks)

---

## Keyboard shortcuts (display mode)
| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `←` / `→` | Prev / Next verse |
| `↑` / `↓` | Scroll 80px |
| `Home` | Back to top |
| `F` | Toggle fullscreen |
| `Esc` | Exit fullscreen → back to home |
