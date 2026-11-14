// The phone menu, project filters, the email address and the live demos.
import { $, $$, lockScroll } from './util.js';

/* ── Phone / tablet menu ───────────────────────────────────────────── */
// The menu is a <details> element, so it opens and closes without JavaScript. This adds the
// rest: Esc closes it, the page behind it stops scrolling, and it closes itself when a link
// leads somewhere on the same page or the window grows wide enough for the full menu bar.
export function initMenu() {
  const menu = $('[data-menu]');
  if (!menu) return;
  const button = $('summary', menu);
  menu.addEventListener('toggle', () => lockScroll(menu.open));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.open) { menu.open = false; button.focus(); }
  });
  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (a && a.hash && a.pathname === location.pathname) menu.open = false;
  });
  matchMedia('(min-width: 1100px)').addEventListener('change', (m) => { if (m.matches) menu.open = false; });
  // coming back to a page with the Back button shows it as it was left: close the menu
  addEventListener('pageshow', () => { if (menu.open) menu.open = false; });
}

/* ── Filters on the category pages ─────────────────────────────────── */
export function initFilters() {
  $$('[data-filters]').forEach((bar) => {
    const scope = bar.parentElement;
    const grid = $('[data-filter-grid]', scope);
    const status = $('[data-filter-status]', scope);
    if (!grid) return;
    const cards = $$('.card', grid);
    const buttons = $$('[data-filter]', bar);
    bar.hidden = false;
    buttons.forEach((b) => b.addEventListener('click', () => {
      const kind = b.dataset.filter;
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      let n = 0;
      cards.forEach((c) => {
        const show = !kind || c.dataset.kind === kind;
        c.hidden = !show;
        if (show) n += 1;
      });
      if (status) status.textContent = `Showing ${n} ${n === 1 ? 'project' : 'projects'}.`;
    }));
  });
}

/* ── Email: assembled here so it never sits in the HTML for scrapers ── */
export function initEmail() {
  const addr = ['eshunburge', 'gmail.com'].join('@');
  $$('[data-email]').forEach((a) => {
    a.href = `mailto:${addr}`;
    const t = $('[data-email-text]', a);
    if (t) t.textContent = addr;
  });
}

/* ── Live demos: an iframe loads only when asked for ───────────────── */
export function initDemos() {
  $$('[data-demo]').forEach((box) => {
    const btn = $('[data-demo-load]', box);
    if (!btn) return;
    btn.hidden = false;
    btn.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = box.dataset.demo;
      f.title = box.dataset.demoTitle || 'Live demo';
      if (box.dataset.demoAllow) f.allow = box.dataset.demoAllow;
      f.referrerPolicy = 'no-referrer';
      $('.demo__poster', box).replaceWith(f);
      f.focus();
    });
  });
}
