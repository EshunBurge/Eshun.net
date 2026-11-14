// Viewer — a simple lightbox for screenshots, print pieces and photographs.
// Markup contract: <a href="large.webp" data-viewer="group" data-title="Caption">thumbnail</a>
// Without JavaScript the link simply opens the large image.
import { $, $$, setInert, lockScroll, reducedMotion, onSwipe } from './util.js';

const ARROW = {
  prev: '<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12H4M10 6l-6 6 6 6"/></svg>',
  next: '<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h18M14 6l6 6-6 6"/></svg>',
};

function build() {
  const v = document.createElement('div');
  v.className = 'viewer tone-dark';
  v.hidden = true;
  v.setAttribute('role', 'dialog');
  v.setAttribute('aria-modal', 'true');
  v.setAttribute('aria-label', 'Image viewer');
  v.innerHTML = `
    <div class="viewer__top">
      <p class="viewer__count" aria-live="polite"></p>
      <button type="button" class="viewer__close" data-v-close>Close</button>
    </div>
    <div class="viewer__stage">
      <img class="viewer__img" alt="" decoding="async">
      <button type="button" class="viewer__nav viewer__nav--prev" data-v-prev aria-label="Previous image">${ARROW.prev}</button>
      <button type="button" class="viewer__nav viewer__nav--next" data-v-next aria-label="Next image">${ARROW.next}</button>
    </div>
    <div class="viewer__cap"><p class="viewer__title"></p></div>`;
  document.body.append(v);
  return {
    v,
    img: $('.viewer__img', v),
    count: $('.viewer__count', v),
    title: $('.viewer__title', v),
    prev: $('[data-v-prev]', v),
    next: $('[data-v-next]', v),
    close: $('[data-v-close]', v),
    stage: $('.viewer__stage', v),
  };
}

export function initViewer() {
  if (!$('a[data-viewer]')) return;
  let ui = null, group = [], idx = 0, lastFocus = null, open = false;

  function set(i, dir = 0) {
    idx = (i + group.length) % group.length;
    const t = group[idx];
    ui.img.src = t.href;
    ui.img.alt = t.querySelector('img')?.alt || t.dataset.title || '';
    ui.count.textContent = group.length > 1 ? `${idx + 1} of ${group.length}` : '';
    ui.title.textContent = t.dataset.title || '';
    ui.prev.hidden = ui.next.hidden = group.length < 2;
    if (dir && !reducedMotion()) {
      ui.img.animate([{ opacity: 0, transform: `translateX(${dir * 32}px)` }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
  }

  function show(trigger) {
    if (!ui) ui = wire(build());
    group = $$(`a[data-viewer="${CSS.escape(trigger.dataset.viewer)}"]`);
    lastFocus = trigger;
    open = true;
    ui.v.hidden = false;
    lockScroll(true);
    setInert(true, ui.v);
    set(group.indexOf(trigger));
    if (!reducedMotion()) ui.v.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
    ui.close.focus({ preventScroll: true });
  }

  function hide() {
    if (!open) return;
    open = false;
    ui.v.hidden = true;
    ui.img.removeAttribute('src');
    lockScroll(false);
    setInert(false, ui.v);
    lastFocus?.focus({ preventScroll: true });
  }

  function wire(u) {
    u.close.addEventListener('click', hide);
    u.prev.addEventListener('click', () => set(idx - 1, -1));
    u.next.addEventListener('click', () => set(idx + 1, 1));
    u.stage.addEventListener('click', (e) => { if (e.target === u.stage) hide(); });
    onSwipe(u.stage, (d) => {
      if (d === 'left') set(idx + 1, 1);
      if (d === 'right') set(idx - 1, -1);
      if (d === 'down') hide();
    });
    document.addEventListener('keydown', (e) => {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); hide(); }
      else if (e.key === 'ArrowRight' && group.length > 1) set(idx + 1, 1);
      else if (e.key === 'ArrowLeft' && group.length > 1) set(idx - 1, -1);
      else if (e.key === 'Tab') {
        const f = $$('button:not([hidden])', u.v);
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f.at(-1).focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    return u;
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('a[data-viewer]');
    if (!t || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    show(t);
  });
}
