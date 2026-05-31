/**
 * KrishnaSongs — main.js
 */
import kirtansData from './data/kirtans.json';

// ═══════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════
const state = {
  currentKirtan: null,
  isPlaying: false,
  scrollSpeed: 'default',   // slow | default | fast
  particlesEnabled: true,
  bgTransitionsEnabled: true,
  translationsVisible: false,
  versePairingActive: false,
  userScrolled: false,      // true when user manually scrolled
  hideTimer: null,
  bgTimer: null,
  bgImages: [],
  bgCurrentIndex: 0,
  bgActiveLayer: 'a',
  animFrameId: null,
  scrollPos: 0,
};

// Speed map: pixels per second
const SPEEDS = { slow: 8, default: 14, fast: 22 };

// ═══════════════════════════════════════════════
//  DOM REFS
// ═══════════════════════════════════════════════
const $ = id => document.getElementById(id);

const homeScreen     = $('home-screen');
const displayScreen  = $('display-screen');
const kirtanSelect   = $('kirtan-select');
const beginBtn       = $('begin-btn');
const kirtanMeta     = $('kirtan-meta');
const metaComposer   = $('meta-composer');
const scrollContainer= $('scroll-container');
const lyricContent   = $('lyric-content');
const controlBar     = $('control-bar');
const btnPlay        = $('btn-play');
const iconPlay       = $('icon-play');
const iconPause      = $('icon-pause');
const btnPrev        = $('btn-prev');
const btnNext        = $('btn-next');
const btnTop         = $('btn-top');
const btnHome        = $('btn-home');
const btnTranslation = $('btn-translation');
const btnSettings    = $('btn-settings');
const settingsPanel  = $('settings-panel');
const toggleParticles= $('toggle-particles');
const toggleBg       = $('toggle-bg');
const resumeToast    = $('resume-toast');
const btnResume      = $('btn-resume');
const bgLayerA       = $('bg-layer-a');
const bgLayerB       = $('bg-layer-b');
const canvas         = $('particle-canvas');
const kirtanOverlay  = $('kirtan-title-overlay');
const speedBtns      = document.querySelectorAll('.speed-btn');

// ═══════════════════════════════════════════════
//  HOME SCREEN
// ═══════════════════════════════════════════════
function initHome() {
  // Populate dropdown
  kirtansData.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k.id;
    opt.textContent = k.title;
    kirtanSelect.appendChild(opt);
  });

  kirtanSelect.addEventListener('change', () => {
    const id = kirtanSelect.value;
    if (!id) {
      beginBtn.disabled = true;
      kirtanMeta.classList.add('hidden');
      return;
    }
    const k = kirtansData.find(x => x.id === id);
    metaComposer.textContent = k.composer;
    kirtanMeta.classList.remove('hidden');
    beginBtn.disabled = false;
    state.currentKirtan = k;
  });

  beginBtn.addEventListener('click', () => {
    if (!state.currentKirtan) return;
    enterDisplayMode(state.currentKirtan);
  });
}

// ═══════════════════════════════════════════════
//  DISPLAY MODE
// ═══════════════════════════════════════════════
function enterDisplayMode(kirtan) {
  renderLyrics(kirtan);
  renderKirtanOverlay(kirtan);
  state.versePairingActive = kirtan.content.some(
    b => typeof b.imageIndex === 'number' || Array.isArray(b.imageRange)
  );
  setupBackground(kirtan);
  if (state.versePairingActive) setupVerseImageObserver();

  // Reset scroll
  scrollContainer.scrollTop = 0;
  state.scrollPos = 0;
  state.userScrolled = false;
  state.isPlaying = false;

  // Translation: reset and show button only if kirtan has translation data
  state.translationsVisible = false;
  displayScreen.classList.remove('translations-visible');
  btnTranslation.classList.remove('active');
  const hasTranslations = kirtan.content.some(b => b.translation);
  btnTranslation.classList.toggle('hidden', !hasTranslations);

  // Transition screens
  homeScreen.classList.remove('active');
  displayScreen.classList.add('active');

  // Auto-show control bar briefly
  showControlBar();

  // Wire up manual scroll detection
  scrollContainer.addEventListener('scroll', onManualScroll, { passive: true });
}

function exitDisplayMode() {
  stopScroll();
  clearBgTimer();
  stopRangeCycle();
  if (verseImageObserver) { verseImageObserver.disconnect(); verseImageObserver = null; }
  verseImageRatios.clear();
  homeScreen.classList.add('active');
  displayScreen.classList.remove('active');
  displayScreen.classList.remove('translations-visible');
  scrollContainer.removeEventListener('scroll', onManualScroll);
  resumeToast.classList.add('hidden');
  settingsPanel.classList.add('hidden');
}

function renderLyrics(kirtan) {
  lyricContent.innerHTML = '';
  kirtan.content.forEach(block => {
    if (block.type === 'gap') {
      const gap = document.createElement('div');
      gap.className = 'lyric-gap';
      lyricContent.appendChild(gap);
    } else {
      const div = document.createElement('div');
      div.className = 'lyric-block';
      if (typeof block.imageIndex === 'number') {
        div.dataset.imageIndex = block.imageIndex;
      } else if (Array.isArray(block.imageRange)) {
        div.dataset.imageRange = block.imageRange.join(',');
      }
      block.lines.forEach(line => {
        const parts = line.split(/(?<=,) /);
        parts.forEach(part => {
          const p = document.createElement('p');
          p.className = 'lyric-line';
          p.textContent = part;
          div.appendChild(p);
        });
      });
      if (block.translation) {
        const t = document.createElement('div');
        t.className = 'translation-block';
        t.textContent = block.translation;
        div.appendChild(t);
      }
      lyricContent.appendChild(div);
    }
  });
}

function renderKirtanOverlay(kirtan) {
  kirtanOverlay.innerHTML = '';
  const titleEl = document.createElement('div');
  titleEl.className = 'overlay-title';
  titleEl.textContent = kirtan.title;
  const composerEl = document.createElement('div');
  composerEl.className = 'overlay-composer';
  composerEl.textContent = kirtan.composer;
  kirtanOverlay.appendChild(titleEl);
  kirtanOverlay.appendChild(composerEl);
  kirtanOverlay.style.opacity = '1';
  setTimeout(() => { kirtanOverlay.style.opacity = '0'; }, 5000);
}

// ═══════════════════════════════════════════════
//  AUTO-SCROLL
// ═══════════════════════════════════════════════
let lastTime = null;

function startScroll() {
  state.isPlaying = true;
  state.userScrolled = false;
  resumeToast.classList.add('hidden');
  updatePlayUI();
  lastTime = null;
  requestAnimationFrame(scrollStep);
}

function stopScroll() {
  state.isPlaying = false;
  if (state.animFrameId) {
    cancelAnimationFrame(state.animFrameId);
    state.animFrameId = null;
  }
  updatePlayUI();
}

function scrollStep(timestamp) {
  if (!state.isPlaying) return;

  if (lastTime === null) lastTime = timestamp;
  const delta = (timestamp - lastTime) / 1000; // seconds
  lastTime = timestamp;

  const pxPerSec = SPEEDS[state.scrollSpeed];
  state.scrollPos += pxPerSec * delta;
  scrollContainer.scrollTop = state.scrollPos;

  // Stop at bottom
  const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
  if (state.scrollPos >= maxScroll) {
    stopScroll();
    return;
  }

  state.animFrameId = requestAnimationFrame(scrollStep);
}

function onManualScroll() {
  if (!state.isPlaying) {
    // User scrolled while paused — just sync position
    state.scrollPos = scrollContainer.scrollTop;
    return;
  }
  // User scrolled while playing — pause and offer resume
  const newPos = scrollContainer.scrollTop;
  const diff = Math.abs(newPos - state.scrollPos);
  if (diff > 20) {
    state.scrollPos = newPos;
    stopScroll();
    state.userScrolled = true;
    resumeToast.classList.remove('hidden');
  }
}

function updatePlayUI() {
  if (state.isPlaying) {
    iconPlay.classList.add('hidden');
    iconPause.classList.remove('hidden');
  } else {
    iconPlay.classList.remove('hidden');
    iconPause.classList.add('hidden');
  }
}

// ═══════════════════════════════════════════════
//  BACKGROUND IMAGES
// ═══════════════════════════════════════════════
// We use CSS gradient placeholders as fallback (no actual image files in MVP).
// When real images are added to public/assets/images/, this will load them.

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #0D1B3E 0%, #1A2D5A 40%, #0D1B3E 100%)',
  'linear-gradient(135deg, #1A0D35 0%, #2A1A55 50%, #1A0D35 100%)',
  'linear-gradient(135deg, #0D1B3E 0%, #243B74 45%, #1A0D35 100%)',
  'linear-gradient(135deg, #1A0D35 0%, #1A2D5A 60%, #0D2240 100%)',
];

function setupBackground(kirtan) {
  clearBgTimer();

  // Always start with a gradient on layer A so there's no blank flash
  bgLayerA.style.backgroundImage = FALLBACK_GRADIENTS[0];
  bgLayerA.style.opacity = '1';
  bgLayerB.style.opacity = '0';
  state.bgActiveLayer = 'a';
  state.bgCurrentIndex = -1; // sentinel — prevents equality guard misfiring on first render

  if (!state.bgTransitionsEnabled) return;

  const hasImages = kirtan.images && kirtan.images.length > 0;
  state.bgImages = hasImages
    ? kirtan.images.map(img => `/assets/images/${kirtan.id}/${img}`)
    : null;

  if (state.bgImages) {
    // Preload first image into layer B, crossfade once ready
    const first = new Image();
    first.onload = () => {
      bgLayerB.style.backgroundImage = `url('${state.bgImages[0]}')`;
      bgLayerB.style.opacity = '1';
      bgLayerA.style.opacity = '0';
      state.bgActiveLayer = 'b';
      state.bgCurrentIndex = 0;
      if (!state.versePairingActive) scheduleBgCycle();
    };
    first.onerror = () => {
      state.bgImages = null;
      if (!state.versePairingActive) scheduleBgCycle();
    };
    first.src = state.bgImages[0];
  } else {
    if (!state.versePairingActive) scheduleBgCycle();
  }
}

function applyBg(index) {
  if (state.bgImages) {
    const url = state.bgImages[index % state.bgImages.length];
    const active = state.bgActiveLayer === 'a' ? bgLayerA : bgLayerB;
    active.style.backgroundImage = `url('${url}')`;
    active.style.background = '';
  } else {
    applyBgGradient(index);
  }
}

function applyBgGradient(index) {
  const g = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
  const active = state.bgActiveLayer === 'a' ? bgLayerA : bgLayerB;
  active.style.backgroundImage = g;
}

function scheduleBgCycle() {
  if (!state.bgTransitionsEnabled) return;
  state.bgTimer = setTimeout(() => {
    crossfadeBg();
    scheduleBgCycle();
  }, 10000); // 10s per image
}

function crossfadeBg() {
  const nextIndex = (state.bgCurrentIndex + 1);
  const entering = state.bgActiveLayer === 'a' ? bgLayerB : bgLayerA;
  const leaving  = state.bgActiveLayer === 'a' ? bgLayerA : bgLayerB;

  // Set up entering layer
  if (state.bgImages) {
    entering.style.backgroundImage = `url('${state.bgImages[nextIndex % state.bgImages.length]}')`;
  } else {
    entering.style.backgroundImage = FALLBACK_GRADIENTS[nextIndex % FALLBACK_GRADIENTS.length];
  }

  // Crossfade
  entering.style.opacity = '1';
  leaving.style.opacity = '0';

  state.bgActiveLayer = state.bgActiveLayer === 'a' ? 'b' : 'a';
  state.bgCurrentIndex = state.bgImages
    ? nextIndex % state.bgImages.length
    : nextIndex % FALLBACK_GRADIENTS.length;
}

function clearBgTimer() {
  if (state.bgTimer) {
    clearTimeout(state.bgTimer);
    state.bgTimer = null;
  }
}

// ═══════════════════════════════════════════════
//  CONTROL BAR — AUTO-HIDE
// ═══════════════════════════════════════════════
function showControlBar() {
  controlBar.classList.add('visible');
  resetHideTimer();
}

function resetHideTimer() {
  clearTimeout(state.hideTimer);
  state.hideTimer = setTimeout(() => {
    if (settingsPanel.classList.contains('hidden')) {
      controlBar.classList.remove('visible');
    }
  }, 3500);
}

function initControlBarHide() {
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

// ═══════════════════════════════════════════════
//  CONTROL BAR — BUTTON HANDLERS
// ═══════════════════════════════════════════════
function initControls() {
  // Play/Pause
  btnPlay.addEventListener('click', () => {
    if (state.isPlaying) stopScroll();
    else startScroll();
  });

  // Back to top
  btnTop.addEventListener('click', () => {
    stopScroll();
    scrollContainer.scrollTop = 0;
    state.scrollPos = 0;
    resumeToast.classList.add('hidden');
  });

  // Home
  btnHome.addEventListener('click', exitDisplayMode);

  // Speed
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.scrollSpeed = btn.dataset.speed;
      // If playing, restart scroll at new speed
      if (state.isPlaying) {
        stopScroll();
        startScroll();
      }
    });
  });

  // Prev / Next verse
  btnPrev.addEventListener('click', () => jumpToVerse('prev'));
  btnNext.addEventListener('click', () => jumpToVerse('next'));

  // Translation toggle
  btnTranslation.addEventListener('click', () => {
    state.translationsVisible = !state.translationsVisible;
    displayScreen.classList.toggle('translations-visible', state.translationsVisible);
    btnTranslation.classList.toggle('active', state.translationsVisible);
    resetHideTimer();
  });

  // Settings toggle
  btnSettings.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle('hidden');
    resetHideTimer();
  });

  // Close settings on outside click
  document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && e.target !== btnSettings) {
      settingsPanel.classList.add('hidden');
    }
  });

  // Particles toggle
  toggleParticles.addEventListener('click', () => {
    state.particlesEnabled = !state.particlesEnabled;
    toggleParticles.textContent = state.particlesEnabled ? 'On' : 'Off';
    toggleParticles.classList.toggle('active', state.particlesEnabled);
    canvas.style.display = state.particlesEnabled ? 'block' : 'none';
    if (state.particlesEnabled && !particleFrameId) {
      particleFrameId = requestAnimationFrame(renderParticles);
    }
  });

  // BG transitions toggle
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

  // Resume toast
  btnResume.addEventListener('click', () => {
    state.scrollPos = scrollContainer.scrollTop;
    startScroll();
  });

  // Keyboard shortcuts
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
        exitDisplayMode();
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

// ═══════════════════════════════════════════════
//  VERSE → IMAGE OBSERVER
// ═══════════════════════════════════════════════
let verseImageObserver = null;
let rangeCycleTimer    = null;
const verseImageRatios = new Map();

// ═══════════════════════════════════════════════
//  PARTICLE SYSTEM — Gold Dust Rising
// ═══════════════════════════════════════════════
let particleCtx = null;
let particleFrameId = null;
let canvasW = 0;
let canvasH = 0;
const particles = [];
const PARTICLE_COUNT = 160;

function initParticles() {
  particleCtx = canvas.getContext('2d');
  resizeCanvas(window.devicePixelRatio || 1);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle(true));
  }

  window.addEventListener('resize', () => resizeCanvas(window.devicePixelRatio || 1));
  particleFrameId = requestAnimationFrame(renderParticles);
}

function resizeCanvas(dpr) {
  canvasW = window.innerWidth;
  canvasH = window.innerHeight;
  canvas.width  = canvasW * dpr;
  canvas.height = canvasH * dpr;
  canvas.style.width  = canvasW + 'px';
  canvas.style.height = canvasH + 'px';
  if (particleCtx) particleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createParticle(randomY = false) {
  return {
    x: Math.random() * canvasW,
    y: randomY ? Math.random() * canvasH : canvasH + 10,
    size: Math.random() * 4 + 1,
    speedY: Math.random() * 0.5 + 0.15,
    speedX: (Math.random() - 0.5) * 0.25,
    opacity: Math.random() * 0.5 + 0.4,
    life: Math.random(),
    fadeRate: Math.random() * 0.003 + 0.001,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: Math.random() * 0.015 + 0.005,
  };
}

function renderParticles() {
  if (!state.particlesEnabled) { particleFrameId = null; return; }

  particleCtx.clearRect(0, 0, canvasW, canvasH);

  particles.forEach((p, i) => {
    p.y -= p.speedY;
    p.x += p.speedX + Math.sin(p.wobble) * 0.3;
    p.wobble += p.wobbleSpeed;
    p.life -= p.fadeRate;

    const heightRatio = 1 - (p.y / canvasH);
    const fadeIn = Math.min(1, heightRatio * 12);
    const fadeOut = Math.min(1, (1 - heightRatio) * 3);
    const alpha = p.opacity * Math.min(fadeIn, fadeOut) * Math.max(0, p.life);

    if (p.y < -10 || p.life <= 0) {
      particles[i] = createParticle(false);
      return;
    }

    particleCtx.save();
    particleCtx.globalAlpha = alpha;
    const glowRadius = p.size * 3;
    const gradient = particleCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
    gradient.addColorStop(0, '#FFF4C2');
    gradient.addColorStop(0.2, '#F0C96E');
    gradient.addColorStop(0.5, '#D4A843');
    gradient.addColorStop(1, 'rgba(212,168,67,0)');
    particleCtx.fillStyle = gradient;
    particleCtx.beginPath();
    particleCtx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
    particleCtx.fill();
    particleCtx.restore();
  });

  particleFrameId = requestAnimationFrame(renderParticles);
}

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
//  VERSE → IMAGE PAIRING
// ═══════════════════════════════════════════════
function setupVerseImageObserver() {
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

function switchToImage(imgIndex) {
  if (!state.bgImages || imgIndex === state.bgCurrentIndex) return;
  const entering = state.bgActiveLayer === 'a' ? bgLayerB : bgLayerA;
  const leaving  = state.bgActiveLayer === 'a' ? bgLayerA : bgLayerB;
  entering.style.backgroundImage = `url('${state.bgImages[imgIndex % state.bgImages.length]}')`;
  entering.style.opacity = '1';
  leaving.style.opacity  = '0';
  state.bgActiveLayer  = state.bgActiveLayer === 'a' ? 'b' : 'a';
  state.bgCurrentIndex = imgIndex;
}

function startRangeCycle(start, end) {
  // If current image is outside the range, jump to start
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

function stopRangeCycle() {
  if (rangeCycleTimer) { clearTimeout(rangeCycleTimer); rangeCycleTimer = null; }
}

// ═══════════════════════════════════════════════
//  NEXT / PREVIOUS VERSE
// ═══════════════════════════════════════════════
function jumpToVerse(dir) {
  const blocks = [...scrollContainer.querySelectorAll('.lyric-block')];
  if (!blocks.length) return;

  // Container-relative top — robust regardless of which element is the offsetParent
  const containerTop = scrollContainer.getBoundingClientRect().top;
  const blockTop = el =>
    el.getBoundingClientRect().top - containerTop + scrollContainer.scrollTop;

  const currentScroll = scrollContainer.scrollTop;
  const threshold = scrollContainer.clientHeight * 0.5;
  let currentIdx = 0;
  for (let i = 0; i < blocks.length; i++) {
    if (blockTop(blocks[i]) <= currentScroll + threshold) currentIdx = i;
  }

  const targetIdx = dir === 'next'
    ? Math.min(currentIdx + 1, blocks.length - 1)
    : Math.max(currentIdx - 1, 0);

  const targetY = Math.max(0, blockTop(blocks[targetIdx]) - scrollContainer.clientHeight * 0.12);
  stopScroll();
  scrollContainer.scrollTop = targetY;
  state.scrollPos = targetY;
}

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
function init() {
  initHome();
  initControls();
  initControlBarHide();
  initParticles();
  applyBgGradient(0);
}

init();