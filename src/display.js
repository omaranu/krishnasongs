import { state } from './state.js';
import {
  homeScreen, displayScreen,
  scrollContainer, btnTranslation, resumeToast, settingsPanel, keyboardHint,
  controlBar, btnMore,
} from './dom.js';
import { renderLyrics, renderKirtanOverlay } from './renderer.js';
import { setupBackground, clearBgTimer, applyBgGradient } from './background.js';
import { setupVerseImageObserver, teardownVerseImageObserver, stopRangeCycle } from './observer.js';
import { stopScroll, onManualScroll } from './scroll.js';
import { showControlBar } from './controls.js';
import { clearKirtanRoute, setKirtanRoute } from './routes.js';

let keyboardHintTimer = null;

export function enterDisplayMode(kirtan, { updateUrl = true } = {}) {
  if (updateUrl) setKirtanRoute(kirtan.id);
  state.currentKirtan = kirtan;
  renderLyrics(kirtan);
  renderKirtanOverlay(kirtan);
  state.versePairingActive = kirtan.content.some(
    b => typeof b.imageIndex === 'number' || Array.isArray(b.imageRange)
  );
  setupBackground(kirtan);
  if (state.versePairingActive) setupVerseImageObserver();

  scrollContainer.scrollTop = 0;
  state.scrollPos = 0;
  state.userScrolled = false;
  state.isPlaying = false;

  state.translationsVisible = false;
  displayScreen.classList.remove('translations-visible');
  btnTranslation.classList.remove('active');
  const hasTranslations = kirtan.content.some(b => b.translation);
  btnTranslation.classList.toggle('hidden', !hasTranslations);

  homeScreen.classList.remove('active');
  displayScreen.classList.add('active');

  controlBar.classList.remove('mobile-expanded');
  btnMore.setAttribute('aria-expanded', 'false');
  btnMore.setAttribute('aria-label', 'Show more controls');
  showControlBar();
  showKeyboardHint();

  scrollContainer.addEventListener('scroll', onManualScroll, { passive: true });
}

export function exitDisplayMode({ updateUrl = true } = {}) {
  stopScroll();
  clearBgTimer();
  stopRangeCycle();
  teardownVerseImageObserver();
  homeScreen.classList.add('active');
  displayScreen.classList.remove('active');
  displayScreen.classList.remove('translations-visible');
  scrollContainer.removeEventListener('scroll', onManualScroll);
  resumeToast.classList.add('hidden');
  settingsPanel.classList.add('hidden');
  dismissKeyboardHint();
  if (updateUrl) clearKirtanRoute();
}

function showKeyboardHint() {
  dismissKeyboardHint();
  keyboardHint.classList.remove('hidden');
  document.addEventListener('keydown', dismissKeyboardHint, { once: true, capture: true });
  keyboardHintTimer = setTimeout(dismissKeyboardHint, 6000);
}

function dismissKeyboardHint(event) {
  // The first key only dismisses this prompt; it must not also control the kirtan.
  if (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  keyboardHint.classList.add('hidden');
  clearTimeout(keyboardHintTimer);
  document.removeEventListener('keydown', dismissKeyboardHint, true);
}
