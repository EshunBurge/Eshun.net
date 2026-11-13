// The tickets (the photo collections and the kinds of work): they tilt toward a mouse pointer and
// lift, easing there frame by frame; once you've visited a page its ticket is punched; and the
// ticket at the top of a collection's own page is punched as you arrive. Visits are remembered in
// this browser only.
import { reducedMotion, finePointer } from '../core/util.js';

const KEY = 'eshun-line-visited';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const write = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage may be off */ } };
const before = read(); // the visits as they stood when this page opened

/** On a collection's (or a kind of work's) own page: remember the visit. */
export function recordVisit(id) {
  const list = read();
  if (!list.includes(id)) write([...list, id]);
}

function punch(t) {
  t.classList.add('is-punched');
  const stub = t.querySelector('.ticket__count');
  if (stub && !stub.querySelector('.visually-hidden')) stub.insertAdjacentHTML('beforeend', '<span class="visually-hidden"> (visited)</span>');
}

export default function initTicket(t) {
  const id = t.dataset.ticket;
  // the ticket at the top of its own page: punched a moment after you arrive (once only)
  if (t.hasAttribute('data-here')) {
    if (before.includes(id) || reducedMotion()) t.classList.add('is-punched');
    else setTimeout(() => t.classList.add('is-punched', 'is-punching'), 1500);
    return;
  }
  if (read().includes(id)) punch(t);

  // The mystery stop deals a different photograph every time: swap in a random one just before
  // the viewer opens it (the viewer reads the link's href and title when it is clicked).
  const deck = (() => { try { return JSON.parse(t.dataset.deck || '[]'); } catch { return []; } })();
  t.addEventListener('click', () => {
    if (id !== 'mystery') return;
    recordVisit(id);
    if (deck.length) {
      const [src, title] = deck[Math.floor(Math.random() * deck.length)];
      t.href = src;
      t.dataset.title = title;
    }
  });

  // The tilt: the ticket leans toward the pointer and lifts, easing a little closer every frame,
  // and settles back the same way when the pointer leaves.
  if (reducedMotion() || !finePointer()) return;
  let tx = 0, ty = 0, tl = 0, x = 0, y = 0, l = 0, raf = 0, inside = false;
  const step = () => {
    x += (tx - x) * 0.12; y += (ty - y) * 0.12; l += (tl - l) * 0.12;
    t.style.setProperty('--ry', `${x.toFixed(3)}deg`);
    t.style.setProperty('--rx', `${y.toFixed(3)}deg`);
    t.style.setProperty('--lift', `${l.toFixed(2)}px`);
    if (!inside && Math.abs(x) < 0.02 && Math.abs(y) < 0.02 && Math.abs(l) < 0.05) {
      raf = 0;
      ['--rx', '--ry', '--lift'].forEach((v) => t.style.removeProperty(v));
      t.classList.remove('is-tilting');
      return;
    }
    raf = requestAnimationFrame(step);
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(step); };
  t.addEventListener('pointerenter', () => { inside = true; tl = -6; t.classList.add('is-tilting'); go(); });
  t.addEventListener('pointermove', (e) => {
    const r = t.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 9;
    ty = -((e.clientY - r.top) / r.height - 0.5) * 7;
    go();
  });
  t.addEventListener('pointerleave', () => { inside = false; tx = ty = tl = 0; go(); });
}
