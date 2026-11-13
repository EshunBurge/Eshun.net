// A long page's section bar (About): it marks the section you're reading as you scroll. The
// section you're in is the last one whose top has passed a line a third of the way down the
// window; above the first section (in the page's head) nothing is marked.
import { rafThrottle } from '../core/util.js';

export default function initSubnav(nav) {
  const list = nav.querySelector('.subnav__list');
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const pairs = links
    .map((a) => [a, document.getElementById(decodeURIComponent(a.hash.slice(1)))])
    .filter(([, s]) => s);
  if (!pairs.length) return;
  let current = null;
  const mark = (a) => {
    if (a === current) return;
    current = a;
    links.forEach((x) => (x === a ? x.setAttribute('aria-current', 'true') : x.removeAttribute('aria-current')));
    // keep the marked link in view inside the bar (on a phone the bar scrolls sideways); only the
    // bar moves, never the page
    if (list && list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: a ? a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2 : 0, behavior: 'smooth' });
    }
  };
  const update = rafThrottle(() => {
    const line = innerHeight / 3;
    let here = null;
    for (const [a, s] of pairs) if (s.getBoundingClientRect().top <= line) here = a;
    // at the very bottom, the last section is the one being read even if it's short
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) here = pairs.at(-1)[0];
    mark(here);
  });
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}
