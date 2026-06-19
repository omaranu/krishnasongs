function track(eventName, params = {}) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}

export const Analytics = {
  kirtanSelected: (id, title) => track('kirtan_selected', { kirtan_id: id, kirtan_title: title }),
  kirtanStarted:  (id, title) => track('kirtan_started',  { kirtan_id: id, kirtan_title: title }),

  scrollPlay:  () => track('scroll_play'),
  scrollPause: () => track('scroll_pause'),
  scrollTop:   () => track('scroll_to_top'),
  resumeScroll:() => track('resume_scroll'),

  speedChanged:       (speed)   => track('speed_changed',        { speed }),
  versePrev:          ()        => track('verse_prev'),
  verseNext:          ()        => track('verse_next'),
  fontChanged:        (dir)     => track('font_size_changed',     { direction: dir }),
  translationToggled: (visible) => track('translation_toggled',   { visible }),
  settingsToggled:    (open)    => track('settings_toggled',      { open }),
  particlesToggled:   (enabled) => track('particles_toggled',     { enabled }),
  bgToggled:          (enabled) => track('bg_transitions_toggled',{ enabled }),
  fullscreenToggled:  (enabled) => track('fullscreen_toggled',    { enabled }),
  exitToHome:         ()        => track('exit_to_home'),
};
