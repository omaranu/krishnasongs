import { state } from './state.js';
import { scrollContainer } from './dom.js';
import { switchToImage } from './background.js';

let verseImageObserver = null;
let rangeCycleTimer    = null;
const verseImageRatios = new Map();

export function setupVerseImageObserver() {
  if (verseImageObserver) { verseImageObserver.disconnect(); verseImageObserver = null; }
  verseImageRatios.clear();

  const blocks = [...scrollContainer.querySelectorAll('[data-image-index], [data-image-range]')];
  if (!blocks.length) return;

  verseImageObserver = new IntersectionObserver(entries => {
    entries.forEach(e => verseImageRatios.set(e.target, e.intersectionRatio));
    let bestEl = null, bestRatio = -1;
    verseImageRatios.forEach((r, el) => { if (r > bestRatio) { bestRatio = r; bestEl = el; } });
    if (!bestEl || bestRatio === 0) return;
    if (bestEl.dataset.imageRange) {
      const [start, end] = bestEl.dataset.imageRange.split(',').map(Number);
      stopRangeCycle();
      startRangeCycle(start, end);
    } else {
      stopRangeCycle();
      switchToImage(parseInt(bestEl.dataset.imageIndex));
    }
  }, { root: scrollContainer, threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0] });

  blocks.forEach(b => { verseImageRatios.set(b, 0); verseImageObserver.observe(b); });
}

export function teardownVerseImageObserver() {
  if (verseImageObserver) { verseImageObserver.disconnect(); verseImageObserver = null; }
  verseImageRatios.clear();
}

function startRangeCycle(start, end) {
  if (state.bgCurrentIndex < start || state.bgCurrentIndex > end) {
    switchToImage(start);
  }
  scheduleRangeCycle(start, end);
}

function scheduleRangeCycle(start, end) {
  rangeCycleTimer = setTimeout(() => {
    const next = state.bgCurrentIndex >= end ? start : state.bgCurrentIndex + 1;
    switchToImage(next);
    scheduleRangeCycle(start, end);
  }, 10000);
}

export function stopRangeCycle() {
  if (rangeCycleTimer) { clearTimeout(rangeCycleTimer); rangeCycleTimer = null; }
}
