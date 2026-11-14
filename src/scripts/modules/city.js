// The city behind the big train, in three layers: far towers, the middle of town and the ones
// close to the platform. As you scroll the far ones drift slowest, so the city has depth (nothing follows the mouse). It only works while the city is on
// screen, and nothing moves for people who ask for reduced motion.
import { reducedMotion, onReducedMotionChange } from '../core/util.js';

// [layer, how far it lags the page as you scroll, how far it drifts with the pointer (px)]
const DEPTH = [
  ['.city__far', 0.24],
  ['.city__mid', 0.13],
  ['.city__near', 0.05],
];

export default function initCity(el) {
  const layers = DEPTH.map(([sel, lag]) => ({ el: el.querySelector(sel), lag })).filter((l) => l.el);
  if (!layers.length) return;
  let raf = 0, onScreen = true;

  const reset = () => layers.forEach((l) => { l.el.style.transform = ''; });
  const paint = () => {
    raf = 0;
    if (reducedMotion()) return reset();
    const y = Math.max(0, window.scrollY);
    for (const l of layers) l.el.style.transform = `translate3d(0, ${(y * l.lag).toFixed(2)}px, 0)`;
  };
  const kick = () => { if (!raf && onScreen) raf = requestAnimationFrame(paint); };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); }).observe(el);
  }
  window.addEventListener('scroll', kick, { passive: true });
  onReducedMotionChange(() => (reducedMotion() ? reset() : kick()));
  kick();
}
