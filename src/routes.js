const KIRTAN_PARAM = 'kirtan';

export function getKirtanIdFromUrl() {
  return new URL(window.location.href).searchParams.get(KIRTAN_PARAM);
}

export function setKirtanRoute(id) {
  const url = new URL(window.location.href);
  if (url.searchParams.get(KIRTAN_PARAM) === id) return;

  url.searchParams.set(KIRTAN_PARAM, id);
  window.history.pushState({ kirtan: id }, '', url);
}

export function clearKirtanRoute() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(KIRTAN_PARAM)) return;

  url.searchParams.delete(KIRTAN_PARAM);
  window.history.pushState({}, '', url);
}

export function getKirtanShareUrl(id) {
  const url = new URL(window.location.href);
  url.searchParams.set(KIRTAN_PARAM, id);
  return url.toString();
}
