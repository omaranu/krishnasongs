import kirtansManifest from './data/kirtans.json';
import { state } from './state.js';
import { kirtanSelectBtn, kirtanSelectText, kirtanDropdown, kirtanSearch, kirtanOptions, beginBtn } from './dom.js';
import { enterDisplayMode } from './display.js';
import { Analytics } from './analytics.js';

const kirtan_modules = import.meta.glob('./data/kirtans/*.json');

const normalize = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

let selectedKirtan = null;

export function initHome() {
  renderOptions(kirtansManifest);

  kirtanSelectBtn.addEventListener('click', () => {
    const isOpen = !kirtanDropdown.classList.contains('hidden');
    isOpen ? closeDropdown() : openDropdown();
  });

  kirtanSelectBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDropdown(); }
  });

  kirtanSearch.addEventListener('input', () => {
    const q = normalize(kirtanSearch.value);
    const filtered = q
      ? kirtansManifest.filter(k => normalize(k.title).includes(q))
      : kirtansManifest;
    renderOptions(filtered);
  });

  document.addEventListener('click', e => {
    if (!kirtanSelectBtn.contains(e.target) && !kirtanDropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDropdown();
  });

  beginBtn.addEventListener('click', async () => {
    if (!selectedKirtan) return;
    const id = selectedKirtan.id;
    const loader = kirtan_modules[`./data/kirtans/${id}.json`];
    if (!loader) return;
    Analytics.kirtanStarted(id, selectedKirtan.title);
    try {
      const mod = await loader();
      enterDisplayMode(mod.default);
    } catch (e) {
      console.error('Failed to load kirtan:', id, e);
    }
  });
}

function openDropdown() {
  kirtanDropdown.classList.remove('hidden');
  kirtanSelectBtn.classList.add('open');
  kirtanSelectBtn.setAttribute('aria-expanded', 'true');
  kirtanSearch.value = '';
  renderOptions(kirtansManifest);
  kirtanSearch.focus();
}

function closeDropdown() {
  kirtanDropdown.classList.add('hidden');
  kirtanSelectBtn.classList.remove('open');
  kirtanSelectBtn.setAttribute('aria-expanded', 'false');
}

function renderOptions(kirtans) {
  kirtanOptions.innerHTML = '';
  kirtans.forEach(k => {
    const btn = document.createElement('button');
    btn.className = 'kirtan-option';
    btn.textContent = k.title;
    btn.addEventListener('click', () => selectKirtan(k));
    kirtanOptions.appendChild(btn);
  });
}

function selectKirtan(meta) {
  selectedKirtan = meta;
  state.currentKirtan = meta;
  kirtanSelectText.textContent = meta.title;
  kirtanSelectText.classList.add('selected');
  closeDropdown();
  beginBtn.disabled = false;
  Analytics.kirtanSelected(meta.id, meta.title);
}
