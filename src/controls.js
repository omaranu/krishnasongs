import { state } from './state.js';
import { Analytics } from './analytics.js';
import {
  controlBar, displayScreen, settingsPanel,
  btnPlay, btnPrev, btnNext, btnTop, btnHome,
  btnTranslation, btnSettings,
  toggleParticles, toggleBg,
  resumeToast, btnResume, canvas,
  scrollContainer, speedBtns,
  btnFontDecrease, btnFontIncrease,
  lyricContent,
  btnFullscreen, iconExpand, iconCompress,
  btnShare, btnMore,
} from './dom.js';
import { getKirtanShareUrl } from './routes.js';

const FONT_MIN   = 0.75;
const FONT_MAX   = 1.5;
const FONT_STEP  = 0.125;
const LS_KEY     = 'ks-font-scale';

function applyFontScale(scale) {
  state.fontScale = scale;
  lyricContent.style.setProperty('--lyric-scale', scale);
  btnFontDecrease.disabled = scale <= FONT_MIN;
  btnFontIncrease.disabled = scale >= FONT_MAX;
  btnFontDecrease.classList.toggle('active', scale < 1);
  btnFontIncrease.classList.toggle('active', scale > 1);
  localStorage.setItem(LS_KEY, scale);
}

export function initFontScale() {
  const saved = parseFloat(localStorage.getItem(LS_KEY)) || 1;
  const clamped = Math.min(FONT_MAX, Math.max(FONT_MIN, saved));
  applyFontScale(clamped);

  btnFontDecrease.addEventListener('click', () => {
    const next = Math.max(FONT_MIN, parseFloat((state.fontScale - FONT_STEP).toFixed(3)));
    applyFontScale(next);
    Analytics.fontChanged('decrease');
  });

  btnFontIncrease.addEventListener('click', () => {
    const next = Math.min(FONT_MAX, parseFloat((state.fontScale + FONT_STEP).toFixed(3)));
    applyFontScale(next);
    Analytics.fontChanged('increase');
  });
}
import { startScroll, stopScroll, jumpToVerse } from './scroll.js';
import { scheduleBgCycle, clearBgTimer } from './background.js';
import { renderParticles, getParticleFrameId, setParticleFrameId } from './particles.js';
import { setupVerseImageObserver, stopRangeCycle } from './observer.js';

export function showControlBar() {
  controlBar.classList.add('visible');
  btnShare.classList.add('visible');
  resetHideTimer();
}

export function resetHideTimer() {
  clearTimeout(state.hideTimer);
  state.hideTimer = setTimeout(() => {
    if (settingsPanel.classList.contains('hidden')) {
      controlBar.classList.remove('visible');
      btnShare.classList.remove('visible');
    }
  }, 3500);
}

function updateFullscreenIcon() {
  const isFs = !!document.fullscreenElement;
  iconExpand.classList.toggle('hidden', isFs);
  iconCompress.classList.toggle('hidden', !isFs);
}

export function initFullscreen() {
  const supported = document.fullscreenEnabled
    && typeof document.documentElement.requestFullscreen === 'function';
  btnFullscreen.classList.toggle('hidden', !supported);
  if (!supported) return;

  btnFullscreen.addEventListener('click', async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        Analytics.fullscreenToggled(true);
      } catch {
        // Some mobile browsers expose the API but reject a fullscreen request.
        btnFullscreen.classList.add('hidden');
      }
    } else {
      await document.exitFullscreen();
      Analytics.fullscreenToggled(false);
    }
  });

  document.addEventListener('fullscreenchange', updateFullscreenIcon);
}

export function initControlBarHide() {
  document.addEventListener('mousemove', () => {
    if (displayScreen.classList.contains('active')) showControlBar();
  });
  document.addEventListener('keydown', () => {
    if (displayScreen.classList.contains('active')) showControlBar();
  });
  document.addEventListener('touchstart', () => {
    if (displayScreen.classList.contains('active')) showControlBar();
  }, { passive: true });
  scrollContainer.addEventListener('manualscroll', () => {
    if (displayScreen.classList.contains('active')) showControlBar();
  });
}

export function initControls(onExit) {
  btnPlay.addEventListener('click', () => {
    if (state.isPlaying) { stopScroll(); Analytics.scrollPause(); }
    else { startScroll(); Analytics.scrollPlay(); }
  });

  btnTop.addEventListener('click', () => {
    stopScroll();
    scrollContainer.scrollTop = 0;
    state.scrollPos = 0;
    resumeToast.classList.add('hidden');
    Analytics.scrollTop();
  });

  btnHome.addEventListener('click', () => { Analytics.exitToHome(); onExit(); });

  btnShare.addEventListener('click', async () => {
    const didShare = await shareCurrentKirtan();
    if (didShare) Analytics.kirtanShared();
  });

  btnMore.addEventListener('click', () => {
    const expanded = controlBar.classList.toggle('mobile-expanded');
    btnMore.setAttribute('aria-expanded', String(expanded));
    btnMore.setAttribute('aria-label', expanded ? 'Show fewer controls' : 'Show more controls');
    resetHideTimer();
  });

  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.scrollSpeed = btn.dataset.speed;
      Analytics.speedChanged(btn.dataset.speed);
      if (state.isPlaying) {
        stopScroll();
        startScroll();
      }
    });
  });

  btnPrev.addEventListener('click', () => { jumpToVerse('prev'); Analytics.versePrev(); });
  btnNext.addEventListener('click', () => { jumpToVerse('next'); Analytics.verseNext(); });

  btnTranslation.addEventListener('click', () => {
    state.translationsVisible = !state.translationsVisible;
    displayScreen.classList.toggle('translations-visible', state.translationsVisible);
    btnTranslation.classList.toggle('active', state.translationsVisible);
    Analytics.translationToggled(state.translationsVisible);
    resetHideTimer();
  });

  btnSettings.addEventListener('click', (e) => {
    e.stopPropagation();
    const opening = settingsPanel.classList.contains('hidden');
    settingsPanel.classList.toggle('hidden');
    if (opening) {
      controlBar.classList.remove('mobile-expanded');
      btnMore.setAttribute('aria-expanded', 'false');
      btnMore.setAttribute('aria-label', 'Show more controls');
    }
    Analytics.settingsToggled(opening);
    resetHideTimer();
  });

  document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && e.target !== btnSettings) {
      settingsPanel.classList.add('hidden');
    }
  });

  toggleParticles.addEventListener('click', () => {
    state.particlesEnabled = !state.particlesEnabled;
    toggleParticles.textContent = state.particlesEnabled ? 'On' : 'Off';
    toggleParticles.classList.toggle('active', state.particlesEnabled);
    canvas.style.display = state.particlesEnabled ? 'block' : 'none';
    Analytics.particlesToggled(state.particlesEnabled);
    if (state.particlesEnabled && !getParticleFrameId()) {
      setParticleFrameId(requestAnimationFrame(renderParticles));
    }
  });

  toggleBg.addEventListener('click', () => {
    state.bgTransitionsEnabled = !state.bgTransitionsEnabled;
    toggleBg.textContent = state.bgTransitionsEnabled ? 'On' : 'Off';
    toggleBg.classList.toggle('active', state.bgTransitionsEnabled);
    Analytics.bgToggled(state.bgTransitionsEnabled);
    if (state.bgTransitionsEnabled && state.currentKirtan) {
      if (state.versePairingActive) setupVerseImageObserver();
      else scheduleBgCycle();
    } else {
      clearBgTimer();
      stopRangeCycle();
    }
  });

  btnResume.addEventListener('click', () => {
    state.scrollPos = scrollContainer.scrollTop;
    startScroll();
    Analytics.resumeScroll();
  });

  document.addEventListener('keydown', (e) => {
    if (!displayScreen.classList.contains('active')) return;
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (state.isPlaying) stopScroll();
        else startScroll();
        break;
      case 'Home':
        e.preventDefault();
        stopScroll();
        scrollContainer.scrollTop = 0;
        state.scrollPos = 0;
        resumeToast.classList.add('hidden');
        break;
      case 'Escape':
        if (!document.fullscreenElement) onExit();
        break;
      case 'KeyF':
        if (typeof document.documentElement.requestFullscreen !== 'function') break;
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        jumpToVerse('prev');
        break;
      case 'ArrowRight':
        e.preventDefault();
        jumpToVerse('next');
        break;
      case 'ArrowUp':
        e.preventDefault();
        scrollContainer.scrollTop -= 80;
        state.scrollPos = scrollContainer.scrollTop;
        break;
      case 'ArrowDown':
        e.preventDefault();
        scrollContainer.scrollTop += 80;
        state.scrollPos = scrollContainer.scrollTop;
        break;
    }
  });
}

function getShareDetails() {
  const { currentKirtan } = state;
  if (!currentKirtan) return null;

  return {
    title: `${currentKirtan.title} | KrishnaSongs`,
    url: getKirtanShareUrl(currentKirtan.id),
  };
}

async function shareCurrentKirtan() {
  const details = getShareDetails();
  if (!details) return false;

  if (navigator.share) {
    try {
      await navigator.share(details);
      return true;
    } catch (error) {
      // Closing the native share sheet is expected and should not copy unexpectedly.
      if (error.name === 'AbortError') return false;
    }
  }

  return copyText(details.url);
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand('copy');
    input.remove();
    return copied;
  }
}
