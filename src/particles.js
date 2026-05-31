import { state } from './state.js';
import { canvas } from './dom.js';

let particleCtx = null;
let particleFrameId = null;
let canvasW = 0;
let canvasH = 0;
const particles = [];
const PARTICLE_COUNT = 160;

export function initParticles() {
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

export function renderParticles() {
  if (!state.particlesEnabled) { particleFrameId = null; return; }

  particleCtx.clearRect(0, 0, canvasW, canvasH);

  particles.forEach((p, i) => {
    p.y -= p.speedY;
    p.x += p.speedX + Math.sin(p.wobble) * 0.3;
    p.wobble += p.wobbleSpeed;
    p.life -= p.fadeRate;

    const heightRatio = 1 - (p.y / canvasH);
    const fadeIn  = Math.min(1, heightRatio * 12);
    const fadeOut = Math.min(1, (1 - heightRatio) * 3);
    const alpha   = p.opacity * Math.min(fadeIn, fadeOut) * Math.max(0, p.life);

    if (p.y < -10 || p.life <= 0) {
      particles[i] = createParticle(false);
      return;
    }

    particleCtx.save();
    particleCtx.globalAlpha = alpha;
    const glowRadius = p.size * 3;
    const gradient = particleCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
    gradient.addColorStop(0,   '#FFF4C2');
    gradient.addColorStop(0.2, '#F0C96E');
    gradient.addColorStop(0.5, '#D4A843');
    gradient.addColorStop(1,   'rgba(212,168,67,0)');
    particleCtx.fillStyle = gradient;
    particleCtx.beginPath();
    particleCtx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
    particleCtx.fill();
    particleCtx.restore();
  });

  particleFrameId = requestAnimationFrame(renderParticles);
}

export function getParticleFrameId() { return particleFrameId; }
export function setParticleFrameId(id) { particleFrameId = id; }
