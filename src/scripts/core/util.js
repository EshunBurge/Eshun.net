// Small shared helpers. No dependencies.
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;

const rm = matchMedia('(prefers-reduced-motion: reduce)');
export const reducedMotion = () => rm.matches;
export const onReducedMotionChange = (fn) => rm.addEventListener('change', fn);
export const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Run fn at most once per animation frame. */
export function rafThrottle(fn) {
  let queued = false, lastArgs;
  return (...args) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fn(...lastArgs); });
  };
}

/** Elements that should be unreachable while a modal is open. */
export function setInert(on, except) {
  for (const el of document.body.children) {
    if (el === except || el.contains(except) || el.tagName === 'SCRIPT') continue;
    if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
  }
}

/** Lock page scroll without layout shift. */
export function lockScroll(on) {
  const h = document.documentElement;
  if (on) {
    const sw = window.innerWidth - h.clientWidth;
    h.style.setProperty('--sbw', sw + 'px');
    h.style.overflow = 'hidden';
    h.style.paddingRight = sw ? sw + 'px' : '';
  } else {
    h.style.overflow = '';
    h.style.paddingRight = '';
  }
}

/** Observe visibility once or continuously. */
export function inView(el, cb, opts = { rootMargin: '0px', threshold: 0 }) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => cb(e.isIntersecting, e)), opts);
  io.observe(el);
  return () => io.disconnect();
}

/** Simple swipe detector (pointer events). Calls cb('left'|'right'|'up'|'down'). */
export function onSwipe(el, cb, { threshold = 40, axis = 'both' } = {}) {
  let x0 = 0, y0 = 0, id = null, t0 = 0;
  el.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') return; id = e.pointerId; x0 = e.clientX; y0 = e.clientY; t0 = performance.now(); }, { passive: true });
  el.addEventListener('pointerup', (e) => {
    if (e.pointerId !== id) return;
    id = null;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    if (performance.now() - t0 > 800) return;
    if ((axis === 'both' || axis === 'x') && Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.2) cb(dx < 0 ? 'left' : 'right');
    else if ((axis === 'both' || axis === 'y') && Math.abs(dy) > threshold && Math.abs(dy) > Math.abs(dx) * 1.2) cb(dy < 0 ? 'up' : 'down');
  }, { passive: true });
  el.addEventListener('pointercancel', () => { id = null; }, { passive: true });
}
