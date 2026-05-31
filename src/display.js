import { state } from './state.js';
import {
  homeScreen, displayScreen,
  scrollContainer, btnTranslation, resumeToast, settingsPanel,
} from './dom.js';
import { renderLyrics, renderKirtanOverlay } from './renderer.js';
import { setupBackground, clearBgTimer, applyBgGradient } from './background.js';
import { setupVerseImageObserver, teardownVerseImageObserver, stopRangeCycle } from './observer.js';
import { stopScroll, onManualScroll } from './scroll.js';
import { showControlBar } from './controls.js';

export function enterDisplayMode(kirtan) {
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

  showControlBar();

  scrollContainer.addEventListener('scroll', onManualScroll, { passive: true });
}

export function exitDisplayMode() {
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
}
