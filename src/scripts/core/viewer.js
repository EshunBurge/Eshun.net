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
      <div class="viewer__tools" role="group" aria-label="Zoom">
        <button type="button" class="viewer__tool" data-v-out aria-label="Zoom out">−</button>
        <button type="button" class="viewer__tool viewer__tool--fit" data-v-fit aria-label="Fit to screen">Fit</button>
        <button type="button" class="viewer__tool" data-v-in aria-label="Zoom in">+</button>
      </div>
      <button type="button" class="viewer__close" data-v-close>Close</button>
    </div>
    <div class="viewer__stage">
      <div class="viewer__pan"><img class="viewer__img" alt="" decoding="async" draggable="false"></div>
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
    pan: $('.viewer__pan', v),
    zin: $('[data-v-in]', v),
    zout: $('[data-v-out]', v),
    fit: $('[data-v-fit]', v),
  };
}

export function initViewer() {
  if (!$('a[data-viewer]')) return;
  let ui = null, group = [], idx = 0, lastFocus = null, open = false;
  // zoom and pan: the picture opens fitted whole; zoom with the buttons, + and −, the wheel, a pinch or a
  // double tap, then drag to move around it
  let z = 1, px = 0, py = 0;
  const MAX = 6, MIN = 0.4;
  const paint = () => {
    ui.img.style.transform = `translate(${px}px, ${py}px) scale(${z})`;
    ui.v.classList.toggle('is-zoomed', z > 1.001);
    ui.fit.textContent = Math.abs(z - 1) > 0.001 ? `${Math.round(z * 100)}%` : 'Fit';
  };
  const clamp = () => {
    const r = ui.pan.getBoundingClientRect();
    const iw = ui.img.naturalWidth || r.width, ih = ui.img.naturalHeight || r.height;
    const f = Math.min(r.width / iw, r.height / ih);
    const mx = Math.max(0, (iw * f * z - r.width) / 2), my = Math.max(0, (ih * f * z - r.height) / 2);
    px = Math.max(-mx, Math.min(mx, px));
    py = Math.max(-my, Math.min(my, py));
  };
  const zoomTo = (nz, cx = null, cy = null) => {
    nz = Math.max(MIN, Math.min(MAX, nz));
    const r = ui.pan.getBoundingClientRect();
    const ox = (cx ?? r.left + r.width / 2) - (r.left + r.width / 2), oy = (cy ?? r.top + r.height / 2) - (r.top + r.height / 2);
    const k = nz / z;
    px = ox - (ox - px) * k; py = oy - (oy - py) * k;
    z = nz;
    if (z <= 1) { px = 0; py = 0; }
    clamp(); paint();
  };
  const reset = () => { z = 1; px = 0; py = 0; if (ui) paint(); };

  function set(i, dir = 0) {
    idx = (i + group.length) % group.length;
    const t = group[idx];
    reset();
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
    reset();
    lockScroll(false);
    setInert(false, ui.v);
    lastFocus?.focus({ preventScroll: true });
  }

  let moved = false;
  function wire(u) {
    u.close.addEventListener('click', hide);
    u.prev.addEventListener('click', () => set(idx - 1, -1));
    u.next.addEventListener('click', () => set(idx + 1, 1));
    u.stage.addEventListener('click', (e) => { if (e.target === u.stage || e.target === u.pan) { if (z <= 1.001 && !moved) hide(); } });
    u.zin.addEventListener('click', () => zoomTo(z * 1.6));
    u.zout.addEventListener('click', () => zoomTo(z / 1.6));
    u.fit.addEventListener('click', () => zoomTo(1));
    u.pan.addEventListener('wheel', (e) => { e.preventDefault(); zoomTo(z * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025)), e.clientX, e.clientY); }, { passive: false });
    u.img.addEventListener('dblclick', (e) => { e.preventDefault(); z > 1.001 ? zoomTo(1) : zoomTo(2.5, e.clientX, e.clientY); });
    // drag to move (mouse, pen or one finger); two fingers pinch
    const ptrs = new Map();
    let last = null, pinch = 0, tapT = 0;
    u.pan.addEventListener('pointerdown', (e) => {
      u.pan.setPointerCapture(e.pointerId);
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      moved = false;
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); }
      last = [e.clientX, e.clientY];
    });
    u.pan.addEventListener('pointermove', (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (pinch) zoomTo(z * (d / pinch), (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
        pinch = d; moved = true; return;
      }
      if (z > 1.001 && last) {
        const dx = e.clientX - last[0], dy = e.clientY - last[1];
        if (Math.abs(dx) + Math.abs(dy) > 1) moved = true;
        px += dx; py += dy; clamp(); paint();
      }
      last = [e.clientX, e.clientY];
    });
    const up = (e) => {
      ptrs.delete(e.pointerId); pinch = 0; last = ptrs.size ? [...ptrs.values()][0] : null;
      if (e.pointerType === 'touch' && !moved && ptrs.size === 0) { const n = performance.now(); if (n - tapT < 300) { z > 1.001 ? zoomTo(1) : zoomTo(2.5, e.clientX, e.clientY); tapT = 0; } else tapT = n; }
    };
    u.pan.addEventListener('pointerup', up);
    u.pan.addEventListener('pointercancel', up);
    onSwipe(u.stage, (d) => {
      if (z > 1.001) return;
      if (d === 'left') set(idx + 1, 1);
      if (d === 'right') set(idx - 1, -1);
      if (d === 'down') hide();
    });
    document.addEventListener('keydown', (e) => {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); hide(); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomTo(z * 1.4); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomTo(z / 1.4); }
      else if (e.key === '0') { e.preventDefault(); zoomTo(1); }
      else if (z > 1.001 && e.key.startsWith('Arrow')) {
        e.preventDefault();
        const d = 80;
        if (e.key === 'ArrowLeft') px += d; else if (e.key === 'ArrowRight') px -= d; else if (e.key === 'ArrowUp') py += d; else py -= d;
        clamp(); paint();
      }
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
