# KṛṣṇaSongs — ISKCON Kirtan Display App

A full-screen, TV-optimized web application for displaying Kirtan lyrics during Bhagavad Gītā classes.

## Features (Phase 1 MVP)

- 10 curated Kirtans with ISKCON transliteration (diacritical marks supported)
- Auto-scroll with Slow / Default / Fast presets
- Play / Pause, Back to Top, keyboard shortcuts (Space, Home, Esc, ↑↓)
- Auto-hiding control bar (reappears on mouse/key)
- Gold particle effects (Canvas-based, togglable)
- Background crossfade with Krishna-conscious gradients (togglable)
- Kirtan-specific image support (`public/assets/images/<kirtan-id>/`)
- Settings panel for toggling effects
- Cormorant Garamond font — full diacritical support

## Project Structure

```
krishnasongs/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.js
│   ├── style.css
│   └── data/
│       └── kirtans.json
└── public/
    └── assets/
        └── images/
            ├── general/          ← fallback image pool
            └── <kirtan-id>/      ← kirtan-specific images
```

## Adding Background Images

1. Place images in `public/assets/images/<kirtan-id>/` (e.g. `public/assets/images/hare-krishna-maha-mantra/`)
2. Add filenames to the kirtan's `images` array in `src/data/kirtans.json`
3. If `images` is empty or absent, the app uses gradient fallbacks

**General pool** (used when a kirtan has no images): `public/assets/images/general/`
Recommended: ISKCON devotional painted art, 1920×1080px minimum.

## Adding / Editing Kirtans

Edit `src/data/kirtans.json`. Each entry:

```json
{
  "id": "unique-kebab-id",
  "title": "Display Title with Diacriticals",
  "composer": "Composer Name",
  "source": "kksongs.org",
  "mode": "refrain-verse",
  "images": ["optional-image-1.jpg"],
  "content": [
    { "type": "refrain", "lines": ["Line 1", "Line 2"] },
    { "type": "gap" },
    { "type": "verse", "lines": ["Line 1", "Line 2"] }
  ]
}
```

Block types: `refrain`, `verse`, `continuous`, `gap`  
Modes: `refrain-verse`, `continuous`

## Keyboard Shortcuts

| Key       | Action             |
|-----------|--------------------|
| `Space`   | Play / Pause       |
| `Home`    | Back to Top        |
| `Esc`     | Back to Home       |
| `↑` / `↓` | Manual scroll 80px |

## Development

```bash
npm install
npm run dev
```

## Deployment

**Netlify** (recommended):
```bash
npm run build
# Deploy the `dist/` folder
```
- `vite.config.js` base is set to `'/'` for Netlify

**GitHub Pages**:
- Change `base` in `vite.config.js` to `'/your-repo-name/'`
- Build and deploy `dist/` to `gh-pages` branch

## Tech Stack

| Layer      | Choice                              |
|------------|-------------------------------------|
| Framework  | Vite + vanilla JS                   |
| Lyrics     | `src/data/kirtans.json` (local)     |
| Fonts      | Cormorant Garamond (Google Fonts)   |
| Effects    | Custom Canvas particles + CSS       |
| Hosting    | GitHub Pages or Netlify             |
