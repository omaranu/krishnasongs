export const state = {
  currentKirtan: null,
  isPlaying: false,
  scrollSpeed: 'default',   // slow | default | fast
  particlesEnabled: true,
  bgTransitionsEnabled: true,
  translationsVisible: false,
  versePairingActive: false,
  userScrolled: false,
  hideTimer: null,
  bgTimer: null,
  bgImages: [],
  bgCurrentIndex: 0,
  bgActiveLayer: 'a',
  animFrameId: null,
  scrollPos: 0,
};

export const SPEEDS = { slow: 8, default: 14, fast: 22 };
