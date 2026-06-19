import kirtansManifest from './data/kirtans.json';
import { state } from './state.js';
import { kirtanSelect, beginBtn, kirtanMeta, metaComposer } from './dom.js';
import { enterDisplayMode } from './display.js';
import { Analytics } from './analytics.js';

// Vite pre-registers all kirtan JSON files as lazy chunks.
// Each is only fetched when the user actually clicks Begin.
const kirtan_modules = import.meta.glob('./data/kirtans/*.json');

export function initHome() {
  kirtansManifest.forEach(k => {
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
    const meta = kirtansManifest.find(x => x.id === id);
    metaComposer.textContent = meta.composer;
    kirtanMeta.classList.remove('hidden');
    beginBtn.disabled = false;
    state.currentKirtan = meta;
    Analytics.kirtanSelected(meta.id, meta.title);
  });

  beginBtn.addEventListener('click', async () => {
    if (!state.currentKirtan) return;
    const id = state.currentKirtan.id;
    const loader = kirtan_modules[`./data/kirtans/${id}.json`];
    if (!loader) return;
    Analytics.kirtanStarted(id, state.currentKirtan.title);
    const mod = await loader();
    enterDisplayMode(mod.default);
  });
}
