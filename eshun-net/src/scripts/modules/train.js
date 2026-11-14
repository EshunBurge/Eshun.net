// The big train on the home page. CSS brings it in to the platform when the page opens; this
// opens its doors once it has stopped, closes them and pulls it away to the right as you scroll
// down (the reflections on its sides sliding the other way), and brings it back as you return.
// Nothing moves for people who ask for reduced motion.
import { reducedMotion, rafThrottle } from '../core/util.js';

const DRAWING_H = 190; // the train drawing's viewBox height

export default function initTrain(el) {
  // With reduced motion nothing moves: the train simply waits at the platform, doors open.
  if (reducedMotion()) { el.classList.add('is-open'); return; }
  const hero = el.closest('.hero') || document.body;
  const sheen = el.querySelector('.bt-sheen-depart');
  const move = el.querySelector('.bigtrain__move');

  // The doors open once the train has stopped, and close again when it starts to leave.
  let arrived = false, leaving = false;
  const doors = () => el.classList.toggle('is-open', arrived && !leaving);
  const arrive = () => { if (!arrived) { arrived = true; setTimeout(doors, 300); } };
  move?.addEventListener('animationend', (e) => { if (e.animationName === 'train-arrive') arrive(); });
  setTimeout(arrive, 3600); // in case the animation's end isn't reported

  const update = rafThrottle(() => {
    const h = hero.offsetHeight || 1;
    const p = Math.min(1, Math.max(0, window.scrollY / h));
    const x = p * p * window.innerWidth * 1.15; // eases away, then speeds up
    el.style.transform = x ? `translate3d(${x.toFixed(1)}px, 0, 0)` : '';
    if (sheen) {
      const scale = el.offsetHeight / DRAWING_H || 1;
      sheen.style.transform = x ? `translateX(${(-x * 0.35 / scale).toFixed(1)}px)` : '';
    }
    const wasLeaving = leaving;
    leaving = window.scrollY > 8;
    if (leaving !== wasLeaving) doors();
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}
