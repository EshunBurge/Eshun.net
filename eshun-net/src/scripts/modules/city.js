// The city behind the big train, in three layers: far towers, the middle of town and the ones
// close to the platform. As you scroll the far ones drift slowest, and with a mouse the layers
// shift a little against the pointer, so the city has depth. It only works while the city is on
// screen, and nothing moves for people who ask for reduced motion.
import { reducedMotion, finePointer, onReducedMotionChange } from '../core/util.js';

// [layer, how far it lags the page as you scroll, how far it drifts with the pointer (px)]
const DEPTH = [
  ['.city__far', 0.24, 10],
  ['.city__mid', 0.13, 18],
  ['.city__near', 0.05, 28],
];

export default function initCity(el) {
  const layers = DEPTH.map(([sel, lag, drift]) => ({ el: el.querySelector(sel), lag, drift })).filter((l) => l.el);
  if (!layers.length) return;
  let px = 0, tx = 0, raf = 0, onScreen = true;

  const reset = () => layers.forEach((l) => { l.el.style.transform = ''; });
  const paint = () => {
    raf = 0;
    if (reducedMotion()) return reset();
    px += (tx - px) * 0.075; // ease toward the pointer
    const y = Math.max(0, window.scrollY);
    for (const l of layers) l.el.style.transform = `translate3d(${(-px * l.drift).toFixed(2)}px, ${(y * l.lag).toFixed(2)}px, 0)`;
    if (Math.abs(tx - px) > 0.001) raf = requestAnimationFrame(paint);
  };
  const kick = () => { if (!raf && onScreen) raf = requestAnimationFrame(paint); };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); }).observe(el);
  }
  window.addEventListener('scroll', kick, { passive: true });
  if (finePointer()) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
      kick();
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { tx = 0; kick(); });
  }
  onReducedMotionChange(() => (reducedMotion() ? reset() : kick()));
  kick();
}
