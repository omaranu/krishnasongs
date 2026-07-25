import { state } from './state.js';
import { bgLayerA, bgLayerB } from './dom.js';

export const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #0D1B3E 0%, #1A2D5A 40%, #0D1B3E 100%)',
  'linear-gradient(135deg, #1A0D35 0%, #2A1A55 50%, #1A0D35 100%)',
  'linear-gradient(135deg, #0D1B3E 0%, #243B74 45%, #1A0D35 100%)',
  'linear-gradient(135deg, #1A0D35 0%, #1A2D5A 60%, #0D2240 100%)',
];

let bgLoadToken = 0;

export function setupBackground(kirtan) {
  clearBgTimer();
  const myToken = ++bgLoadToken;

  bgLayerA.style.backgroundImage = FALLBACK_GRADIENTS[0];
  bgLayerA.style.opacity = '1';
  bgLayerB.style.opacity = '0';
  state.bgActiveLayer = 'a';
  state.bgCurrentIndex = -1;

  state.bgInterval = kirtan.bgInterval || 10000;

  if (!state.bgTransitionsEnabled) return;

  const hasImages = kirtan.images && kirtan.images.length > 0;
  state.bgImages = hasImages
    ? kirtan.images.map(img => `/assets/images/${kirtan.id}/${img}`)
    : null;

  if (state.bgImages) {
    const first = new Image();
    first.onload = () => {
      if (myToken !== bgLoadToken) return;
      bgLayerB.style.backgroundImage = `url('${state.bgImages[0]}')`;
      bgLayerB.style.opacity = '1';
      bgLayerA.style.opacity = '0';
      state.bgActiveLayer = 'b';
      state.bgCurrentIndex = 0;
      if (!state.versePairingActive) scheduleBgCycle();
    };
    first.onerror = () => {
      if (myToken !== bgLoadToken) return;
      state.bgImages = null;
      if (!state.versePairingActive) scheduleBgCycle();
    };
    first.src = state.bgImages[0];
  } else {
    if (!state.versePairingActive) scheduleBgCycle();
  }
}

export function applyBg(index) {
  if (state.bgImages) {
    const url = state.bgImages[index % state.bgImages.length];
    const active = state.bgActiveLayer === 'a' ? bgLayerA : bgLayerB;
    active.style.backgroundImage = `url('${url}')`;
    active.style.background = '';
  } else {
    applyBgGradient(index);
  }
}

export function applyBgGradient(index) {
  const g = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
  const active = state.bgActiveLayer === 'a' ? bgLayerA : bgLayerB;
  active.style.backgroundImage = g;
}

export function scheduleBgCycle() {
  if (!state.bgTransitionsEnabled) return;
  state.bgTimer = setTimeout(() => {
    crossfadeBg();
    scheduleBgCycle();
  }, state.bgInterval);
}

export function crossfadeBg() {
  const nextIndex = state.bgCurrentIndex + 1;
  const entering = state.bgActiveLayer === 'a' ? bgLayerB : bgLayerA;
  const leaving  = state.bgActiveLayer === 'a' ? bgLayerA : bgLayerB;

  if (state.bgImages) {
    entering.style.backgroundImage = `url('${state.bgImages[nextIndex % state.bgImages.length]}')`;
  } else {
    entering.style.backgroundImage = FALLBACK_GRADIENTS[nextIndex % FALLBACK_GRADIENTS.length];
  }

  entering.style.opacity = '1';
  leaving.style.opacity = '0';

  state.bgActiveLayer  = state.bgActiveLayer === 'a' ? 'b' : 'a';
  state.bgCurrentIndex = state.bgImages
    ? nextIndex % state.bgImages.length
    : nextIndex % FALLBACK_GRADIENTS.length;
}

export function clearBgTimer() {
  if (state.bgTimer) {
    clearTimeout(state.bgTimer);
    state.bgTimer = null;
  }
}

export function switchToImage(imgIndex) {
  if (!state.bgImages || imgIndex === state.bgCurrentIndex) return;
  const entering = state.bgActiveLayer === 'a' ? bgLayerB : bgLayerA;
  const leaving  = state.bgActiveLayer === 'a' ? bgLayerA : bgLayerB;
  entering.style.backgroundImage = `url('${state.bgImages[imgIndex % state.bgImages.length]}')`;
  entering.style.opacity = '1';
  leaving.style.opacity  = '0';
  state.bgActiveLayer  = state.bgActiveLayer === 'a' ? 'b' : 'a';
  state.bgCurrentIndex = imgIndex;
}
