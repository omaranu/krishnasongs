# Technical Review — 2026-06-20

## High Severity

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `home.js:40` | No try/catch on dynamic `import()` — Begin button silently stops working on network error | Wrap `await loader()` in try/catch, show error message |
| 2 | `background.js:31–36` | Stale `onload` callback fires after user navigates back to Home — leaves background layers broken for next kirtan | Guard with `if (kirtan.id !== state.currentKirtan?.id) return` |

## Medium Severity

| # | File | Issue | Fix |
|---|------|-------|-----|
| 3 | `controls.js:162` | BG transitions toggle doesn't stop `rangeCycleTimer` — images keep cycling on verse-paired kirtans even when off | Also call `stopRangeCycle()` in the toggle handler |
| 4 | `particles.js:72` | 160 `createRadialGradient()` calls per frame (9,600/sec) — battery drain on TV sticks | Pre-create gradient or cache by quantized radius |
| 5 | `background.js:79` | Only image 1 preloaded — images 2–N fetch cold on crossfade, causing blank flash | Preload next 1–2 images ahead of current index |
| 6 | `scroll.js:51` | Manual-scroll detection (20px threshold) causes spurious auto-pause on fractional-pixel displays | Compare against last `scrollTop` integer directly |
| 7 | `observer.js:22` | `imageRange` attribute parsed with no validation — malformed value sets background to `url('undefined')` | Validate `[start, end]` are finite numbers |
| 8 | `controls.js:103,189` | Scroll-to-top logic copy-pasted verbatim in two places | Extract to `scrollToTop()` helper |
| 9 | `controls.js:58`, `renderer.js:49` | Magic numbers `3500` and `5000` for timer delays | Name them `CONTROL_BAR_HIDE_DELAY`, `OVERLAY_FADE_DELAY` |

## Low Severity

| # | File | Issue |
|---|------|-------|
| 10 | `controls.js:47` | `import` statements appear mid-file after function definitions |
| 11 | `dom.js:1` | DOM refs resolved at module-load time before DOMContentLoaded |
| 12 | `renderer.js:49` | Overlay `setTimeout` not stored/cancelled — stale timer fades next kirtan's overlay early |
| 13 | `particles.js:19` | `resize` listener added but never removed |
| 14 | `scroll.js:64` | `getBoundingClientRect` loop on every Prev/Next keypress — cache at render time |
| 15 | `src/data/kirtans/` | 7 orphan JSON files bundled by Vite but unreachable (removed from manifest) |
| 16 | `particles.js:87` | `getParticleFrameId`/`setParticleFrameId` export is encapsulation leak — export `resumeParticles()` instead |
| 17 | `state.js` | User preferences and ephemeral session state mixed in one flat object |
| 18 | `analytics.js:2` | `typeof gtag` checked on every event call — resolve once at load |
| 19 | `index.html:14` | GA measurement ID hardcoded — no staging vs. prod separation |
| 20 | `style.css:179,304` | `.app-subtitle` and `.home-footer` styled but never rendered (dead CSS) |
