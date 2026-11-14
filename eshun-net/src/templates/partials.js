// src/templates/partials.js — pieces shared by every page.
import { html, raw, arrow, pad } from './lib.js';
import { categories, categoryById, nav } from '../data/site.js';
import { projects } from '../data/projects.js';
import { sets } from '../data/photos.js';
import { ticketArt } from './tickets.js';
import { bigTrain } from './line-art.js';

/** Each top-level page's platform: its place in the menu (the 404's departure board agrees). */
export const platformOf = (id) => nav.findIndex((n) => n.id === id) + 1;

/** Words on a split-flap board: each letter in its own flap, words kept together, the plain
 *  text alongside for screen readers. The flaps spin into place when the page opens (board.js). */
export function board(text) {
  const words = String(text).toUpperCase().split(/\s+/).map((w) => `<span class="board__word">${[...w].map((ch) => `<span class="flap" data-ch="${ch}">${ch}</span>`).join('')}</span>`).join('');
  return raw(`<span class="visually-hidden">${text}</span><span class="board__cells" aria-hidden="true">${words}</span>`);
}

/** Where a project lives: its own page, or a card on its category page. */
export function projectHref(p) {
  if (p.layout) return `/${p.slug}/`;
  const cat = categories.find((c) => c.discipline === p.discipline);
  return `${cat.href}#${p.slug}`;
}

/** The way back up, shown above the title of every page below the top level. Given the trail
 *  Home → Section → Page, it links to the section: "← Software Design". */
export function crumbs(ctx, list) {
  const up = list[list.length - 2];
  if (!up) return '';
  return html`<nav class="back" aria-label="Back to ${up.label}"><a class="back__a" href="${ctx.url(up.href)}">${arrow('left')} ${up.label}</a></nav>`;
}

/** The city at night behind a scene: three layers of towers (drawn by city.js), each with its
 *  red lights, that drift apart as you scroll or move the mouse (modules/city.js). */
export function city(cls = '') {
  return raw(`<div class="city${cls ? ` ${cls}` : ''}" aria-hidden="true" data-city><div class="city__layer city__far"></div><div class="city__layer city__mid"></div><div class="city__layer city__near"></div></div>`);
}

/** The top of an inner page: where you are, a big title and a line or two about it.
 *  A `station` head is a night sky over the city, with the train pulling in to the platform
 *  underneath. */
export function pageHead(ctx, { trail = [], kicker = '', title, intro = '', meta = '', actions = '', station = false, platform = 0, visit = '' }) {
  return html`<header class="phead${station ? ' phead--station tone-dark' : ''}"${visit ? html` data-visit="${visit}"` : ''}>
  ${station ? html`<div class="phead__sky" aria-hidden="true"></div>${city('phead__city')}` : ''}
  <div class="wrap phead__in">
    ${trail.length ? crumbs(ctx, trail) : ''}
    ${platform ? platformSign(platform) : ''}
    ${kicker ? html`<p class="phead__kicker">${kicker}</p>` : ''}
    <h1 class="phead__title">${title}</h1>
    ${intro ? html`<p class="phead__intro">${intro}</p>` : ''}
    ${meta ? html`<p class="phead__meta">${meta}</p>` : ''}
    ${actions ? html`<div class="phead__actions">${actions}</div>` : ''}
  </div>
  ${station ? stationScene() : ''}
</header>`;
}

/** A station sign above a main page's title: "Now arriving · Platform 2", the number on a flap. */
export function platformSign(n) {
  return html`<p class="platform" aria-hidden="true" data-board><span class="platform__now">Now arriving</span><span class="platform__sign">Platform <span class="flap" data-ch="${n}">${n}</span></span></p>`;
}

/** The platform under a station head: the guideway, the platform and the train, arriving. */
export function stationScene() {
  return raw(`<div class="phead__scene" aria-hidden="true"><div class="guideway"></div><div class="phead__platform"></div><div class="bigtrain bigtrain--station"><div class="bigtrain__move"><div class="bigtrain__glow"></div>${bigTrain()}<div class="bigtrain__stripe"><i></i></div></div></div></div>`);
}

/** A ticket: a little poster above (a drawing from tickets.js, or a picture), the stub below with
 *  where it's for, a line about it and a punch that's made once you've been there. A link by
 *  default; `tag: 'div'` makes a still one (the ticket at the top of a collection's own page). */
export function ticket(ctx, { href = '', scene = '', img = null, name, count, label = '', viewer = '', title = '', id = '', deck = '', tag = 'a', here = false }) {
  const art = img ? html`<span class="ticket__art ticket__art--photo">${img}</span>` : html`<span class="ticket__art">${raw(ticketArt(scene))}</span>`;
  const stub = html`<span class="ticket__stub">
      ${label ? html`<span class="ticket__plat" aria-hidden="true">${label}</span>` : ''}
      <span class="ticket__to">${name}</span>
      <span class="ticket__count">${count}</span>
      <span class="ticket__punch" aria-hidden="true"></span>
    </span>`;
  if (tag !== 'a') return html`<div class="ticket ticket--still" data-ticket="${id || scene}"${here ? raw(' data-here') : ''}>${art}${stub}</div>`;
  return html`<a class="ticket" href="${href}" data-ticket="${id || scene}"${viewer ? html` data-viewer="${viewer}" data-title="${title}"` : ''}${deck ? html` data-deck="${deck}"` : ''}>${art}${stub}</a>`;
}

/** How much a kind of work holds, for its ticket. */
function countOf(c) {
  if (c.id === 'fun') return `${sets.length} photo collections`;
  const n = projects.filter((p) => p.discipline === c.discipline).length;
  return `${n} ${n === 1 ? 'project' : 'projects'}`;
}

/** A section heading, and optionally a link on the right. */
export function secHead({ id, title, link = null, ctx = null }) {
  return html`<div class="sec-head">
  <h2 class="sec-title" id="${id}">${title}</h2>
  ${link ? html`<a class="more" href="${ctx.url(link.href)}">${link.label} ${arrow()}</a>` : ''}
</div>`;
}

/** A button-style link. External links open in a new tab and say so with an arrow. */
export function btn(ctx, { href, label, kind = '', external = /^https?:/.test(href) }) {
  return html`<a class="btn${kind ? ` btn--${kind}` : ''}" href="${external ? href : ctx.url(href)}"${external ? raw(' target="_blank" rel="noopener"') : ''}>${label} ${arrow(external ? 'out' : 'right')}</a>`;
}

/** One project as a card: picture, what it is, one line, and a link to its page. */
export function projectCard(ctx, p, { sizes = '(max-width: 760px) 92vw, 44vw', headingLevel = 3, eager = false } = {}) {
  const href = p.layout ? ctx.url(projectHref(p)) : '';
  const contain = p.cover && (p.coverFit === 'contain' || ctx.ratio(p.cover) < 1);
  const H = `h${headingLevel}`;
  const meta = [p.kind, p.year].filter(Boolean).join(' · ');
  const media = p.cover
    ? ctx.img(p.cover, { alt: '', sizes, eager })
    : raw(`<span class="card__word${p.slug === 'campaign-materials' ? ' card__word--gold' : ''}">${p.slug === 'campaign-materials' ? 'Impression!' : p.title}</span>`);
  const soon = !p.cover && p.slug !== 'campaign-materials';
  return html`<article class="card${contain ? ' card--contain' : ''}${href ? '' : ' card--static'}" id="${p.slug}" data-kind="${p.kind}">
  <div class="card__media${soon ? ' card__media--soon' : ''}">${media}</div>
  <div class="card__body">
    <p class="card__meta">${meta}</p>
    ${raw(`<${H} class="card__title">`)}${href ? html`<a href="${href}">${p.title}</a>` : p.title}${raw(`</${H}>`)}
    <p class="card__text">${p.summary}</p>
    ${p.status || p.honors?.length ? html`<p class="card__status">${p.status || p.honors[0]}</p>` : ''}
    ${href ? html`<p class="card__more" aria-hidden="true">View project ${arrow()}</p>` : ''}
  </div>
</article>`;
}

/** Filter buttons for a grid of cards (shown only when JavaScript is running). */
export function filters(list, cat) {
  if (!cat.filters.length) return '';
  const groups = cat.filters.map(([kind, label]) => ({ kind, label, n: list.filter((p) => p.kind === kind).length })).filter((g) => g.n);
  if (groups.length < 2) return '';
  return html`<div class="filters" role="group" aria-label="Show projects" data-filters hidden>
  <button type="button" class="chip" aria-pressed="true" data-filter="">All <span class="chip__n">${list.length}</span></button>
  ${groups.map((g) => html`<button type="button" class="chip" aria-pressed="false" data-filter="${g.kind}">${g.label} <span class="chip__n">${g.n}</span></button>`)}
</div>
<p class="visually-hidden" role="status" data-filter-status></p>`;
}

/** The kinds of work as tickets, each to its own platform: the easiest way onward from any page.
 *  A ticket is punched once you've visited that page. */
export function categoryTiles(ctx, { except = '', heading = 'More of my work', id = 'more' } = {}) {
  const list = categories.filter((c) => c.id !== except);
  const sizes = list.length > 3 ? '(max-width: 960px) 46vw, 23vw' : '(max-width: 960px) 46vw, 30vw';
  return html`<section class="section tiles-sec" id="${id}" aria-labelledby="${id}-title">
  <div class="wrap">
    ${secHead({ id: `${id}-title`, title: heading })}
    <ul class="tickets${list.length > 3 ? ' tickets--4' : ''}">
      ${list.map((c) => html`<li>${ticket(ctx, { href: ctx.url(c.href), id: c.id, img: ctx.img(c.cover, { alt: '', sizes, style: c.focus ? `object-position:${c.focus}` : '' }), name: c.label, count: countOf(c), label: `Platform ${platformOf(c.id)}` })}</li>`)}
    </ul>
  </div>
</section>`;
}

/** Previous / next within a list of pages. items: [{ href, title }] */
export function pager(ctx, items, href, label = 'More projects') {
  const i = items.findIndex((x) => x.href === href);
  if (items.length < 2 || i < 0) return '';
  const prev = items[(i - 1 + items.length) % items.length];
  const next = items[(i + 1) % items.length];
  // with only two pages, previous and next are the same page: show it once
  if (prev === next) {
    return html`<nav class="pager pager--one" aria-label="${label}">
  <a class="pager__link pager__link--next" href="${ctx.url(next.href)}"><span class="pager__dir">Next ${arrow()}</span><span class="pager__title">${next.title}</span></a>
</nav>`;
  }
  return html`<nav class="pager" aria-label="${label}">
  <a class="pager__link" href="${ctx.url(prev.href)}" rel="prev"><span class="pager__dir">${arrow('left')} Previous</span><span class="pager__title">${prev.title}</span></a>
  <a class="pager__link pager__link--next" href="${ctx.url(next.href)}" rel="next"><span class="pager__dir">Next ${arrow()}</span><span class="pager__title">${next.title}</span></a>
</nav>`;
}

/** An image that opens larger in the viewer, with an optional caption. */
export function figure(ctx, key, { caption = '', sizes = '100vw', cls = '', viewer = '', alt = '', title = '' } = {}) {
  const im = ctx.img(key, { sizes, alt: alt || caption });
  const inner = viewer
    ? html`<a class="fig__a" href="${ctx.src(key, 2400)}" data-viewer="${viewer}" data-title="${title || caption}">${im}</a>`
    : im;
  return html`<figure class="fig${cls ? ` ${cls}` : ''}">${inner}${caption ? html`<figcaption>${caption}</figcaption>` : ''}</figure>`;
}

/** A list of facts (label → value). Rows with an empty value are skipped. */
export function facts(rows, cls = '') {
  const list = rows.filter(([, v]) => v && (!Array.isArray(v) || v.length));
  if (!list.length) return '';
  return html`<dl class="facts${cls ? ` ${cls}` : ''}">${list.map(([k, v]) => html`<div class="facts__row"><dt>${k}</dt><dd>${Array.isArray(v) ? v.join(', ') : v}</dd></div>`)}</dl>`;
}

export { arrow, pad, raw, categoryById };
