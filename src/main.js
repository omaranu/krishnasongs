/**
 * KrishnaSongs — main.js
 * Phase 1 MVP: Home screen, display mode, auto-scroll,
 * particle effects, background crossfade, control bar.
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
const SPEEDS = { slow: 18, default: 38, fast: 72 };

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
const metaSource     = $('meta-source');
const scrollContainer= $('scroll-container');
const lyricContent   = $('lyric-content');
const controlBar     = $('control-bar');
const btnPlay        = $('btn-play');
const iconPlay       = $('icon-play');
const iconPause      = $('icon-pause');
const btnTop         = $('btn-top');
const btnHome        = $('btn-home');
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
    metaSource.textContent = k.source;
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
  setupBackground(kirtan);

  // Reset scroll
  scrollContainer.scrollTop = 0;
  state.scrollPos = 0;
  state.userScrolled = false;
  state.isPlaying = false;

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
  homeScreen.classList.add('active');
  displayScreen.classList.remove('active');
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
      block.lines.forEach(line => {
        const p = document.createElement('p');
        p.className = 'lyric-line';
        p.textContent = line;
        div.appendChild(p);
      });
      lyricContent.appendChild(div);
    }
  });
}

function renderKirtanOverlay(kirtan) {
  kirtanOverlay.innerHTML = `
    <div class="overlay-title">${kirtan.title}</div>
    <div class="overlay-composer">${kirtan.composer}</div>
  `;
  kirtanOverlay.style.opacity = '1';
  // Fade out after 5s
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
  if (!state.bgTransitionsEnabled) {
    applyBgGradient(0);
    return;
  }
  // Determine image pool
  // If kirtan has images[] with filenames, build paths; else use gradients
  const hasImages = kirtan.images && kirtan.images.length > 0;
  if (hasImages) {
    state.bgImages = kirtan.images.map(
      img => `/assets/images/${kirtan.id}/${img}`
    );
  } else {
    state.bgImages = null; // use gradients
  }
  state.bgCurrentIndex = 0;
  state.bgActiveLayer = 'a';
  applyBg(0);
  scheduleBgCycle();
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
  state.bgCurrentIndex = nextIndex;
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
//  PARTICLE SYSTEM — Gold Dust Rising
// ═══════════════════════════════════════════════
const particles = [];
const PARTICLE_COUNT = 80;

function initParticles() {
  const dpr = window.devicePixelRatio || 1;
  resizeCanvas(dpr);

  // Create particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle(true));
  }

  window.addEventListener('resize', () => resizeCanvas(dpr));
  renderParticles();
}

function resizeCanvas(dpr) {
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width  = window.innerWidth  + 'px';
  canvas.style.height = window.innerHeight + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
}

function createParticle(randomY = false) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return {
    x: Math.random() * w,
    y: randomY ? Math.random() * h : h + 10,
    size: Math.random() * 2.5 + 0.4,
    speedY: Math.random() * 0.5 + 0.15,
    speedX: (Math.random() - 0.5) * 0.25,
    opacity: Math.random() * 0.6 + 0.1,
    life: Math.random(),
    fadeRate: Math.random() * 0.003 + 0.001,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: Math.random() * 0.015 + 0.005,
  };
}

function renderParticles() {
  if (!state.particlesEnabled) {
    requestAnimationFrame(renderParticles);
    return;
  }

  const ctx = canvas.getContext('2d');
  const w = window.innerWidth;
  const h = window.innerHeight;

  ctx.clearRect(0, 0, w, h);

  particles.forEach((p, i) => {
    p.y -= p.speedY;
    p.x += p.speedX + Math.sin(p.wobble) * 0.3;
    p.wobble += p.wobbleSpeed;
    p.life -= p.fadeRate;

    // Fade in near bottom, fade out near top
    const heightRatio = 1 - (p.y / h);
    const fadeIn = Math.min(1, heightRatio * 5);
    const fadeOut = Math.min(1, (1 - heightRatio) * 3);
    const alpha = p.opacity * Math.min(fadeIn, fadeOut) * Math.max(0, p.life);

    if (p.y < -10 || p.life <= 0) {
      particles[i] = createParticle(false);
      return;
    }

    // Draw gold particle
    ctx.save();
    ctx.globalAlpha = alpha;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    gradient.addColorStop(0, '#F0C96E');
    gradient.addColorStop(0.5, '#D4A843');
    gradient.addColorStop(1, 'rgba(212,168,67,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  requestAnimationFrame(renderParticles);
}

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
function init() {
  initHome();
  initControls();
  initControlBarHide();
  initParticles();

  // Set initial background
  applyBgGradient(0);
}

init();
