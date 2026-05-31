import { state, SPEEDS } from './state.js';
import { scrollContainer, iconPlay, iconPause, resumeToast } from './dom.js';

let lastTime = null;

export function startScroll() {
  state.isPlaying = true;
  state.userScrolled = false;
  resumeToast.classList.add('hidden');
  updatePlayUI();
  lastTime = null;
  requestAnimationFrame(scrollStep);
}

export function stopScroll() {
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
  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  const pxPerSec = SPEEDS[state.scrollSpeed];
  state.scrollPos += pxPerSec * delta;
  scrollContainer.scrollTop = state.scrollPos;

  const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
  if (state.scrollPos >= maxScroll) {
    stopScroll();
    return;
  }

  state.animFrameId = requestAnimationFrame(scrollStep);
}

export function onManualScroll() {
  if (!state.isPlaying) {
    state.scrollPos = scrollContainer.scrollTop;
    return;
  }
  const newPos = scrollContainer.scrollTop;
  const diff = Math.abs(newPos - state.scrollPos);
  if (diff > 20) {
    state.scrollPos = newPos;
    stopScroll();
    state.userScrolled = true;
    resumeToast.classList.remove('hidden');
  }
}

export function jumpToVerse(dir) {
  const blocks = [...scrollContainer.querySelectorAll('.lyric-block')];
  if (!blocks.length) return;

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

function updatePlayUI() {
  if (state.isPlaying) {
    iconPlay.classList.add('hidden');
    iconPause.classList.remove('hidden');
  } else {
    iconPlay.classList.remove('hidden');
    iconPause.classList.add('hidden');
  }
}
