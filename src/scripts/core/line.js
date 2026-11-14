// The train that runs through every page: the little one riding the menu bar as you scroll, the
// ride back to the top, the express you can call with a word (silent: the site makes no sound),
// the night sky after dark, and a hello in the console.
import { $, reducedMotion, rafThrottle } from './util.js';

/* ── The menu bar's rail: a tiny train shows how far down the page you are ── */
export function initRail() {
  const rail = $('.hdr__rail');
  const hdr = $('.hdr');
  // once the page has moved, the bar floats over it as glass (see 03-shell.css)
  const stick = rafThrottle(() => hdr?.classList.toggle('is-stuck', scrollY > 24));
  if (hdr) { addEventListener('scroll', stick, { passive: true }); stick(); }
  if (!rail) return;
  const update = rafThrottle(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 40 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    rail.style.setProperty('--x', `${(p * (rail.clientWidth - 36)).toFixed(1)}px`);
    rail.classList.toggle('is-short', max <= 40);
  });
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}

/* ── Back to top (every page's footer): a smooth ride up, landing on the name ── */
export function initEnd() {
  const top = $('[data-top]');
  top?.addEventListener('click', (e) => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    $('.hdr__brand')?.focus({ preventScroll: true });
  });
}

/* ── The express: type "choo" (or the Konami code) anywhere ── */
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
export function initExpress() {
  let typed = '', keys = [];
  addEventListener('keydown', (e) => {
    const t = e.target;
    if (t.closest?.('input, textarea, select, [contenteditable]') || e.ctrlKey || e.metaKey || e.altKey) return;
    keys = [...keys, e.key].slice(-KONAMI.length);
    typed = (typed + (e.key.length === 1 ? e.key.toLowerCase() : ' ')).slice(-8);
    if (typed.endsWith('choo') || KONAMI.every((k, i) => k === keys[i])) { typed = ''; keys = []; express(); }
  });
}
let running = false;
export function express() {
  if (running) return;
  running = true;
  const tpl = $('[data-express-train]')?.content.querySelector('svg');
  const el = document.createElement('div');
  el.className = 'express';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<div class="express__train">${tpl ? tpl.outerHTML : ''}</div><p class="express__note">All aboard!</p>`;
  document.body.appendChild(el);
  setTimeout(() => { el.remove(); running = false; }, reducedMotion() ? 2200 : 2600);
}

/* ── After dark, the stars come out over the city ── */
export function initNight() {
  const h = new Date().getHours();
  if (h >= 19 || h < 6) document.documentElement.classList.add('is-night');
}

/* ── For anyone reading the console ── */
export function hello() {
  try {
    console.log('%cAll aboard!', 'font: 700 15px/1.6 sans-serif; color: #ff5c9d');
    console.log('Tip: type “choo” on any page.');
  } catch { /* consoles can be missing */ }
}
