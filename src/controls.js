import { state } from './state.js';
import {
  controlBar, displayScreen, settingsPanel,
  btnPlay, btnPrev, btnNext, btnTop, btnHome,
  btnTranslation, btnSettings,
  toggleParticles, toggleBg,
  resumeToast, btnResume, canvas,
  scrollContainer, speedBtns,
  btnFontDecrease, btnFontIncrease,
  lyricContent,
} from './dom.js';

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
  });

  btnFontIncrease.addEventListener('click', () => {
    const next = Math.min(FONT_MAX, parseFloat((state.fontScale + FONT_STEP).toFixed(3)));
    applyFontScale(next);
  });
}
import { startScroll, stopScroll, jumpToVerse } from './scroll.js';
import { scheduleBgCycle, clearBgTimer } from './background.js';
import { renderParticles, getParticleFrameId, setParticleFrameId } from './particles.js';

export function showControlBar() {
  controlBar.classList.add('visible');
  resetHideTimer();
}

export function resetHideTimer() {
  clearTimeout(state.hideTimer);
  state.hideTimer = setTimeout(() => {
    if (settingsPanel.classList.contains('hidden')) {
      controlBar.classList.remove('visible');
    }
  }, 3500);
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
}

export function initControls(onExit) {
  btnPlay.addEventListener('click', () => {
    if (state.isPlaying) stopScroll();
    else startScroll();
  });

  btnTop.addEventListener('click', () => {
    stopScroll();
    scrollContainer.scrollTop = 0;
    state.scrollPos = 0;
    resumeToast.classList.add('hidden');
  });

  btnHome.addEventListener('click', onExit);

  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.scrollSpeed = btn.dataset.speed;
      if (state.isPlaying) {
        stopScroll();
        startScroll();
      }
    });
  });

  btnPrev.addEventListener('click', () => jumpToVerse('prev'));
  btnNext.addEventListener('click', () => jumpToVerse('next'));

  btnTranslation.addEventListener('click', () => {
    state.translationsVisible = !state.translationsVisible;
    displayScreen.classList.toggle('translations-visible', state.translationsVisible);
    btnTranslation.classList.toggle('active', state.translationsVisible);
    resetHideTimer();
  });

  btnSettings.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle('hidden');
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
    if (state.particlesEnabled && !getParticleFrameId()) {
      setParticleFrameId(requestAnimationFrame(renderParticles));
    }
  });

  toggleBg.addEventListener('click', () => {
    state.bgTransitionsEnabled = !state.bgTransitionsEnabled;
    toggleBg.textContent = state.bgTransitionsEnabled ? 'On' : 'Off';
    toggleBg.classList.toggle('active', state.bgTransitionsEnabled);
    if (state.bgTransitionsEnabled && state.currentKirtan) {
      scheduleBgCycle();
    } else {
      clearBgTimer();
    }
  });

  btnResume.addEventListener('click', () => {
    state.scrollPos = scrollContainer.scrollTop;
    startScroll();
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
        onExit();
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
