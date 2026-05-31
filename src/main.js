import { initHome } from './home.js';
import { initControls, initControlBarHide } from './controls.js';
import { exitDisplayMode } from './display.js';
import { initParticles } from './particles.js';
import { applyBgGradient } from './background.js';

function init() {
  initHome();
  initControls(exitDisplayMode);
  initControlBarHide();
  initParticles();
  applyBgGradient(0);
}

init();
