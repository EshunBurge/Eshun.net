// src/templates/partials.js — pieces shared by every page.
import { html, raw, arrow, pad } from './lib.js';
import { categories, categoryById, nav } from '../data/site.js';
import { projects, projectBySlug } from '../data/projects.js';
import { openSets } from '../data/photos.js';
import { ticketArt, CUTE_COUNT } from './tickets.js';
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

/**
 * The top of every page below the home page, the way a photo collection's page opens: the city at
 * night behind it, the way back up, a "Now arriving" sign, the title on a split-flap board, a line
 * or two about the page, and on the right a ticket with a picture for its poster, punched as you
 * arrive. Long titles get smaller flaps so they stay on two or three lines.
 *   back:     { href, label }            the way back up ("← Software Design")
 *   platform: n                          "Now arriving · Platform n", the number on a flap
 *   label:    text                       or any other line above the title
 *   ticket:   { img | scene, name, count, label }
 */
export function pageHead(ctx, { back = null, platform = 0, label = '', title, subtitle = '', intro = '', meta = '', actions = '', ticket: tk = null, visit = '', id = '' }) {
  const n = String(title).length;
  const size = n > 24 ? ' board--xs' : n > 16 ? ' board--s' : n > 10 ? ' board--m' : '';
  return html`<header class="bhead tone-dark"${visit ? html` data-visit="${visit}"` : ''}${id ? html` id="${id}"` : ''}>
  <div class="bhead__sky" aria-hidden="true"></div>
  ${city('bhead__city')}
  <div class="wrap bhead__in${tk ? '' : ' bhead__in--solo'}">
    <div class="bhead__text">
      ${back ? html`<nav class="back" aria-label="Back to ${back.label}"><a class="back__a" href="${ctx.url(back.href)}">${arrow('left')} ${back.label}</a></nav>` : ''}
      ${platform ? platformSign(platform) : label ? html`<p class="board__label">${label}</p>` : ''}
      <h1 class="board${size}" data-board>${board(title)}</h1>
      ${subtitle ? html`<p class="bhead__sub">${subtitle}</p>` : ''}
      ${intro ? html`<p class="bhead__intro">${intro}</p>` : ''}
      ${meta ? html`<p class="bhead__meta">${meta}</p>` : ''}
      ${actions ? html`<div class="bhead__actions">${actions}</div>` : ''}
    </div>
    ${tk ? html`<div class="bhead__ticket" aria-hidden="true">${ticket(ctx, { tag: 'div', here: true, ...tk })}</div>` : ''}
  </div>
</header>`;
}

/** A station sign above a main page's title: "Now arriving · Platform 2", the number on a flap. */
export function platformSign(n) {
  return html`<p class="platform" aria-hidden="true" data-board><span class="platform__now">Now arriving</span><span class="platform__sign">Platform <span class="flap" data-ch="${n}">${n}</span></span></p>`;
}

/** Facts printed like a boarding pass: label over value, in columns divided by dashed lines.
 *  Rows with an empty value are skipped. rows: [[label, value | [values]], …] */
export function pass(rows, { cls = '' } = {}) {
  const list = rows.filter(([, v]) => v && (!Array.isArray(v) || v.length));
  if (!list.length) return '';
  return html`<dl class="pass${cls ? ` ${cls}` : ''}" style="--n:${list.length}">${list.map(([k, v]) => html`<div class="pass__item"><dt>${k}</dt><dd>${Array.isArray(v) ? v.join(', ') : v}</dd></div>`)}</dl>`;
}

/** Onward from a page: the previous and next pages as tickets, and one back to the whole list.
 *  items: [{ href, name, count, img?, scene?, start? }] in order (`start` labels an item when the
 *  page itself isn't on the list); `all`: { href, name, count, img?, scene? } */
export function nextStops(ctx, items, href, all, { title = 'Next stops', id = 'stops-title' } = {}) {
  const i = items.findIndex((x) => x.href === href);
  const cards = [];
  if (items.length > 1 && i >= 0) {
    const prev = items[(i - 1 + items.length) % items.length];
    const next = items[(i + 1) % items.length];
    cards.push([prev, '← Previous']);
    if (next !== prev) cards.push([next, 'Next →']);
  } else if (i < 0) {
    // a page that isn't on the list itself (a collection still waiting for its photos): the
    // first stops on the line instead
    items.slice(0, 2).forEach((x) => cards.push([x, x.start || 'Start here']));
  }
  if (all) cards.push([all, 'All']);
  const t = (x, label) => ticket(ctx, { href: ctx.url(x.href), img: x.img || null, scene: x.scene || 'line', id: x.id || '', name: x.name, count: x.count, label: x.label || label });
  return html`<nav class="stops" aria-labelledby="${id}">
    <div class="sec-head"><h2 class="sec-title" id="${id}">${title}</h2></div>
    <ul class="tickets tickets--stops">${cards.map(([x, l]) => html`<li>${t(x, l)}</li>`)}</ul>
  </nav>`;
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
export function countOf(c) {
  if (c.id === 'fun') return `${openSets.length} photo collections`;
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

/* ── Covers ────────────────────────────────────────────────────────── */
// Every project and every kind of work has a cover made for it (never a raw crop): software in
// a little browser window (a phone beside it when it has one) over a soft scene with the train; printed work as a
// fan of its pieces; research as its documents; the kinds of work as a mosaic of pictures.
/** The pictures that stand for a printed or research project on its cover. */
function sheetsOf(ctx, p) {
  const pieces = p.groups ? p.groups.flatMap((g) => g.pieces) : p.pieces || [];
  let keys = p.collage || (p.layout === 'research'
    ? [p.cover, ...(p.images || []).filter((i) => i.key.startsWith('research/')).map((i) => i.key)]
    : [p.cover, ...pieces.map((pc) => pc.key)]);
  keys = [...new Set(keys.filter(Boolean))];
  const fits = keys.filter((k) => { const r = ctx.ratio(k); return r > 0.45 && r < 1.9; });
  return (fits.length >= 2 ? fits : keys).slice(0, 3);
}

/** A project's cover. */
export function coverArt(ctx, p, { sizes = '(max-width: 760px) 70vw, 340px', priority = false } = {}) {
  const c = '#e9e4f0';
  const deco = raw(`<span class="cover__scene">${ticketArt(`cute${Math.max(0, projects.indexOf(p)) % CUTE_COUNT}`)}</span>`);
  if (p.layout === 'software' || p.discipline === 'software') {
    const imgs = p.images || [];
    const screen = p.coverFit === 'contain' ? null : imgs.find((i) => i.key === p.cover && !i.phone && !i.asset) || imgs.find((i) => !i.phone && !i.asset);
    const phone = screen ? imgs.find((i) => i.phone) : null;
    const mark = screen ? null : imgs.find((i) => i.asset) || (p.coverFit === 'contain' ? imgs[0] : null);
    if (screen) {
      return html`<span class="cover cover--sw${phone ? ' has-phone' : ''}" style="--c:${c}">${deco}<span class="cover__win"><span class="cover__bar" aria-hidden="true"><i></i><i></i><i></i></span>${ctx.img(screen.key, { alt: '', sizes, priority })}</span>${phone ? html`<span class="cover__phone">${ctx.img(phone.key, { alt: '', sizes: '160px' })}</span>` : ''}</span>`;
    }
    if (mark) return html`<span class="cover cover--mark" style="--c:${c}">${deco}<span class="cover__tile">${ctx.img(mark.key, { alt: '', sizes: '240px', priority })}</span></span>`;
    return html`<span class="cover cover--sw cover--word" style="--c:${c}">${deco}<span class="cover__win"><span class="cover__bar" aria-hidden="true"><i></i><i></i><i></i></span><span class="cover__name">${p.title}</span></span></span>`;
  }
  const keys = sheetsOf(ctx, p);
  if (!keys.length) return html`<span class="cover cover--sw cover--word" style="--c:${c}">${deco}<span class="cover__win"><span class="cover__bar" aria-hidden="true"><i></i><i></i><i></i></span><span class="cover__name">${p.title}</span></span></span>`;
  return html`<span class="cover cover--fan cover--${keys.length}" style="--c:${c}">${deco}${keys.map((k, i) => html`<span class="cover__sheet cover__sheet--${i}">${ctx.img(k, { alt: '', sizes: '(max-width: 760px) 40vw, 200px', priority: priority && i === 0 })}</span>`)}</span>`;
}

/** One project as a card: picture, what it is, one line, and a link to its page. */
export function projectCard(ctx, p, { sizes = '(max-width: 760px) 92vw, 44vw', headingLevel = 3, eager = false } = {}) {
  const href = p.layout ? ctx.url(projectHref(p)) : '';
  const H = `h${headingLevel}`;
  const meta = [p.kind, p.year].filter(Boolean).join(' · ');
  const media = coverArt(ctx, p, { sizes: '(max-width: 760px) 80vw, 40vw', priority: eager });
  return html`<article class="card${href ? '' : ' card--static'}" id="${p.slug}" data-kind="${p.kind}">
  <div class="card__media">${media}</div>
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
  return html`<section class="section tiles-sec" id="${id}" aria-labelledby="${id}-title">
  <div class="wrap">
    ${secHead({ id: `${id}-title`, title: heading })}
    <ul class="tickets${list.length > 3 ? ' tickets--4' : ''}">
      ${list.map((c) => html`<li>${ticket(ctx, { href: ctx.url(c.href), id: c.id, scene: c.id, name: c.label, count: countOf(c), label: `Platform ${platformOf(c.id)}` })}</li>`)}
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
export function figure(ctx, key, { caption = '', sizes = '100vw', cls = '', viewer = '', alt = '', title = '', style = '' } = {}) {
  const im = ctx.img(key, { sizes, alt: alt || caption });
  const inner = viewer
    ? html`<a class="fig__a" href="${ctx.src(key, 2400)}" data-viewer="${viewer}" data-title="${title || caption}">${im}</a>`
    : im;
  return html`<figure class="fig${cls ? ` ${cls}` : ''}"${style ? html` style="${style}"` : ''}>${inner}</figure>`;
}

/** A list of facts (label → value). Rows with an empty value are skipped. */
export function facts(rows, cls = '') {
  const list = rows.filter(([, v]) => v && (!Array.isArray(v) || v.length));
  if (!list.length) return '';
  return html`<dl class="facts${cls ? ` ${cls}` : ''}">${list.map(([k, v]) => html`<div class="facts__row"><dt>${k}</dt><dd>${Array.isArray(v) ? v.join(', ') : v}</dd></div>`)}</dl>`;
}

export { arrow, pad, raw, categoryById };
