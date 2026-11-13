// Split-flap boards: the collection names, the 404, the platform numbers and the numbers on the
// home page. Each flap spins through a few letters (or digits) before it lands, left to right,
// like a station's departure board. A board marked data-board="view" waits until it scrolls into
// view. Nothing moves with reduced motion.
import { reducedMotion } from '../core/util.js';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const poolFor = (ch) => (/[0-9]/.test(ch) ? DIGITS : /[A-Z]/.test(ch) ? LETTERS : '');
const any = (pool) => pool[Math.floor(Math.random() * pool.length)];

function flip(f, ch) {
  f.textContent = ch;
  f.classList.remove('is-flip');
  void f.offsetWidth; // restart the flap's animation
  f.classList.add('is-flip');
}

function spin(el) {
  [...el.querySelectorAll('.flap[data-ch]')].forEach((f, i) => {
    const target = f.dataset.ch;
    const pool = poolFor(target);
    const start = 160 + i * 42;
    if (!pool) { setTimeout(() => flip(f, target), start + 260); return; }
    let n = 2 + Math.min(6, Math.floor(i / 2)) + Math.floor(Math.random() * 3);
    f.textContent = any(pool);
    const tick = () => {
      if (n-- <= 0) { flip(f, target); return; }
      flip(f, any(pool));
      setTimeout(tick, 95);
    };
    setTimeout(tick, start);
  });
}

export default function initBoard(el) {
  if (reducedMotion()) return;
  if (el.dataset.board === 'view' && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      spin(el);
    }, { threshold: 0.6 });
    io.observe(el);
  } else spin(el);
}
