# KrishnaSongs — Periodic Review Process

Run these reviews every 4–6 weeks, or before any major feature addition.

## How to trigger

Tell your Claude session:

> "Run the full review suite for KrishnaSongs — read reviews/HOW-TO-REVIEW.md for the prompts and launch all three agents in parallel."

---

## Three review agents (run in parallel)

### Agent 1 — Technical Review

```
You are a senior software engineer conducting a thorough code review of a web application
called KrishnaSongs — a full-screen TV teleprompter for Sanskrit kirtan lyrics.

Tech stack: Vite + vanilla JS (no framework, no backend). Deployed on Cloudflare Workers.
Repo root: /Users/anukrati/Documents/Krishna/krishnasongs

Read ALL of these files before forming conclusions:
  src/main.js, src/state.js, src/dom.js, src/renderer.js, src/scroll.js,
  src/background.js, src/particles.js, src/observer.js, src/controls.js,
  src/display.js, src/home.js, src/style.css, src/analytics.js,
  index.html, src/data/kirtans.json,
  src/data/kirtans/hare-krishna-maha-mantra.json,
  src/data/kirtans/ayodhya-vasi-ram.json

Also read the most recent technical review in reviews/ (sort by date, pick the newest
*-technical.md file) so you can flag: FIXED, STILL OPEN, or NEW for each finding.

Report findings as a numbered list with:
  - Severity: High / Medium / Low
  - File and line number
  - Short description
  - Fix suggestion
  - Status vs. previous review: NEW / STILL OPEN / FIXED

Areas to cover:
  1. Code quality & architecture
  2. Performance (gradient allocs, memory leaks, layout thrashing)
  3. Scalability (what breaks as kirtan/image count grows)
  4. Error handling & edge cases (unhandled promises, null checks, bad data)
  5. Security (XSS, unsafe DOM)
  6. Maintainability (magic numbers, duplication, dead code)
  7. Any PR-level flags

Save your report to reviews/YYYY-MM-DD-technical.md (use today's actual date).
```

---

### Agent 2 — Product & UX Review

```
You are a senior product manager reviewing KrishnaSongs — a full-screen TV teleprompter
for Sanskrit kirtan lyrics used during live bhajan sessions (ISKCON-style devotional music).
The primary audience is devotees using this on a large TV or projector during group singing.

Repo root: /Users/anukrati/Documents/Krishna/krishnasongs

Read ALL of these files before forming conclusions:
  index.html, src/home.js, src/display.js, src/controls.js,
  src/renderer.js, src/style.css, src/data/kirtans.json,
  src/data/kirtans/tulasi-arati.json,
  src/data/kirtans/jaya-radha-madhava.json

Also read the most recent PM review in reviews/ (sort by date, pick the newest *-pm.md)
so you can flag: FIXED, STILL OPEN, or NEW for each finding.

Report findings as a numbered list with:
  - Priority: High / Medium / Low
  - Concrete, actionable suggestion
  - Status vs. previous review: NEW / STILL OPEN / FIXED

Areas to cover:
  1. Home screen UX (kirtan selection, scalability as list grows)
  2. Teleprompter UX (readability, controls, scroll, font)
  3. Feature gaps (loop, bookmark, verse pin, progress indicator)
  4. Visual / aesthetic (sacred luxury theme — deep blue/purple + gold)
  5. Mobile / tablet (no media queries currently exist)
  6. Accessibility (contrast, aria labels, keyboard nav)
  7. Content completeness (translations, composer, source attribution)

Save your report to reviews/YYYY-MM-DD-pm.md (use today's actual date).
```

---

### Agent 3 — Content Audit

```
You are a data quality engineer auditing the kirtan JSON files for KrishnaSongs.

Repo root: /Users/anukrati/Documents/Krishna/krishnasongs

Read src/data/kirtans.json (the manifest), then read EVERY file listed in it
under src/data/kirtans/<id>.json.

For each kirtan JSON, check:
  1. images[] array — do all filenames actually exist in public/assets/images/<id>/?
     (Use ls or find to verify. Flag any filename in images[] with no matching file.)
  2. imageIndex values — is every imageIndex within bounds of the images[] array?
  3. imageRange values — is [start, end] within bounds? Is end >= start?
  4. lines[] — are any blocks missing lines, or have empty lines[]?
  5. translations — which kirtans/blocks have translations and which don't?
     Produce a coverage table.
  6. Line casing — all lyric lines should be lowercase (Sanskrit transliteration).
     Flag any line that starts with an uppercase letter (excluding proper nouns
     that are always capitalised like "Kṛṣṇa" — focus on lines where the FIRST
     word is a common word that should be lowercase).
  7. type field — check every block has a valid type: verse, refrain, continuous, gap.
  8. Structural consistency — does each kirtan follow the established patterns?
     Flag anything that looks like a copy-paste error or orphan block.

Save your report to reviews/YYYY-MM-DD-content.md (use today's actual date).
```

---

## After all three reports arrive — Synthesis step

Tell Claude:

> "Read the three review reports just saved in reviews/ and produce a single ranked
> action list: High issues only, consolidated across all three reports, no duplicates.
> Maximum 10 items. Format as a checklist."

---

## Cadence suggestion

| Trigger | Which reviews |
|---------|---------------|
| Every 4–6 weeks | All three |
| After adding 3+ new kirtans | Content audit only |
| After any JS change | Technical only |
| Before a demo or event | All three (delta mode vs. last report) |

## Report history

| Date | Technical | PM | Content |
|------|-----------|----|---------|
| 2026-06-20 | [technical](2026-06-20-technical.md) | [pm](2026-06-20-pm.md) | — |
