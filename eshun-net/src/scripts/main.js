// main.js — every page loads this. Page features load only where they're used.
import { initMenu, initFilters, initEmail, initDemos } from './core/basics.js';
import { initViewer } from './core/viewer.js';
import { initRail, initEnd, initExpress, initNight, hello } from './core/line.js';

const features = [
  ['[data-train]', () => import('./modules/train.js')],
  ['[data-city]', () => import('./modules/city.js')],
  ['[data-board]', () => import('./modules/board.js')],
  ['[data-ticket]', () => import('./modules/tickets.js')],
  ['[data-contact-form]', () => import('./modules/contact.js')],
];

function safe(fn) {
  try { return fn(); } catch (err) { console.error(err); }
}

function boot() {
  safe(initNight);
  safe(initMenu);
  safe(initEmail);
  safe(initFilters);
  safe(initDemos);
  safe(initViewer);
  safe(initRail);
  safe(initEnd);
  safe(initExpress);
  safe(hello);
  // a collection's own page punches its ticket
  const visit = document.querySelector('[data-visit]');
  if (visit) import('./modules/tickets.js').then((m) => m.recordVisit(visit.dataset.visit)).catch(() => {});
  for (const [sel, load] of features) {
    const els = document.querySelectorAll(sel);
    if (!els.length) continue;
    load().then((m) => els.forEach((el) => safe(() => m.default(el)))).catch((e) => console.error(e));
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
