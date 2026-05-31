import { lyricContent, kirtanOverlay } from './dom.js';

export function renderLyrics(kirtan) {
  lyricContent.innerHTML = '';
  kirtan.content.forEach(block => {
    if (block.type === 'gap') {
      const gap = document.createElement('div');
      gap.className = 'lyric-gap';
      lyricContent.appendChild(gap);
    } else {
      const div = document.createElement('div');
      div.className = block.fullscreen ? 'lyric-block lyric-block--fullscreen' : 'lyric-block';
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

export function renderKirtanOverlay(kirtan) {
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
