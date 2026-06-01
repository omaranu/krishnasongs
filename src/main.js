import { initHome } from './home.js';
import { initControls, initControlBarHide, initFontScale, initFullscreen } from './controls.js';
import { exitDisplayMode } from './display.js';
import { initParticles } from './particles.js';
import { applyBgGradient } from './background.js';

function init() {
  initHome();
  initControls(exitDisplayMode);
  initControlBarHide();
  initFontScale();
  initFullscreen();
  initParticles();
  applyBgGradient(0);
}

init();
