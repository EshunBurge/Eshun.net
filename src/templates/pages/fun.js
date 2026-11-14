// Just for Fun — the photo collections as tickets, one stop each (each opens its own page of
// photographs, at the original /photography-<country>/ URLs), the CAD model, and the things I do
// away from a screen.
import { html, raw } from '../lib.js';
import { layout } from '../layout.js';
import { pageHead, secHead, btn, categoryTiles, projectCard, ticket, arrow, board, platformOf, city } from '../partials.js';
import { categoryById } from '../../data/site.js';
import { frames, sets, photoLinks } from '../../data/photos.js';
import { byDiscipline } from '../../data/projects.js';
import { roles } from '../../data/archive.js';

const cat = categoryById.fun;
// Piano and swimming, from her résumé and the old site's timeline.
const OFF = (() => {
  const piano = roles.find((r) => r.org === 'piano');
  const captain = roles.find((r) => r.org === 'school' && r.title === 'Varsity Swim Team Captain');
  const team = roles.find((r) => r.org === 'school' && r.title === 'Varsity Swim Team');
  return [
    { title: 'Piano', since: 'Since 2014', text: piano.text },
    { title: 'Swimming', since: 'Varsity team since 2024 · captain since 2025', text: captain.text, notes: [...(team.notes || []), ...(captain.notes || [])] },
  ];
})();
export const setHref = (s) => `/photography-${s.id}/`;
export const framesIn = (s) => frames.filter((f) => f.set === s.id);
const placeLine = (f) => [f.place, f.country].filter(Boolean).join(', ');
const countLine = (n) => (n ? `${n} ${n === 1 ? 'photo' : 'photos'}` : 'Photos coming soon');
const captionOf = (f) => [placeLine(f), f.subject].filter(Boolean).join(' — ');
/** Each collection is a stop, numbered in the original order. */
export const stopOf = (s) => `Stop ${sets.indexOf(s) + 1}`;

/** The collections in the order they're shown: the ones with photographs first. */
export const setsShown = () => [...sets.filter((s) => framesIn(s).length), ...sets.filter((s) => !framesIn(s).length)];

/** Every collection as a ticket, plus the mystery stop: a photograph from anywhere on the line,
 *  picked at random each time it's opened (without JavaScript it opens the first one). */
export function collectionTickets(ctx, list = setsShown(), { mystery = true } = {}) {
  const items = list.map((s) => ticket(ctx, { href: ctx.url(setHref(s)), scene: s.id, name: s.name, count: countLine(framesIn(s).length), label: stopOf(s) }));
  const pool = frames.filter((f) => sets.some((s) => s.id === f.set));
  if (mystery && pool.length) {
    const deck = pool.map((f) => [ctx.src(f.key, 2400), captionOf(f)]);
    items.push(ticket(ctx, { href: deck[0][0], scene: 'mystery', id: 'mystery', name: 'Mystery stop', count: 'A photo at random', label: 'Stop ?', viewer: 'mystery', title: deck[0][1], deck: JSON.stringify(deck) }));
  }
  return html`<ul class="tickets">${items.map((t) => html`<li>${t}</li>`)}</ul>`;
}

/** A photo that opens larger, with where it was taken underneath. */
function photo(ctx, f, group, sizes) {
  const where = placeLine(f);
  return html`<figure class="photo">
    <a class="photo__a" href="${ctx.src(f.key, 2400)}" data-viewer="${group}" data-title="${where || f.subject}">${ctx.img(f.key, { alt: where ? `${f.subject}. ${where}.` : `${f.subject}.`, sizes })}</a>
    <figcaption>${where ? html`<span class="photo__place">${where}</span>` : ''}<span class="photo__subject">${f.subject}</span></figcaption>
  </figure>`;
}

function followLinks(ctx) {
  return html`<p class="follow">${photoLinks.map((l) => btn(ctx, { href: l.href, label: l.label }))}</p>`;
}

/* ── /just-for-fun/ ────────────────────────────────────────────────── */
export function fun(ctx) {
  const others = byDiscipline('fun');
  const body = html`
${pageHead(ctx, { title: cat.label, intro: cat.intro, meta: `${sets.length} photo collections · ${others.length} CAD model`, station: true, platform: platformOf('fun'), visit: 'fun' })}

<section class="section section--tight" id="collections" aria-labelledby="sets-title">
  <div class="wrap">
    ${secHead({ id: 'sets-title', title: 'Photo collections' })}
    ${collectionTickets(ctx)}
    <h3 class="follow__h">Follow my photography</h3>
    ${followLinks(ctx)}
  </div>
</section>

<section class="section section--alt" aria-labelledby="other-title">
  <div class="wrap">
    ${secHead({ id: 'other-title', title: 'Other projects' })}
    <div class="cards cards--2">${others.map((p) => projectCard(ctx, p))}</div>
  </div>
</section>

<section class="section" aria-labelledby="off-title">
  <div class="wrap">
    ${secHead({ id: 'off-title', title: 'Off the clock' })}
    <div class="offclock">
      ${OFF.map((o) => html`<article class="offclock__item"><p class="offclock__since">${o.since}</p><h3 class="offclock__title">${o.title}</h3><p class="offclock__text">${o.text}</p>${o.notes ? html`<ul class="ticks">${o.notes.map((n) => html`<li>${n}</li>`)}</ul>` : ''}</article>`)}
    </div>
  </div>
</section>

${categoryTiles(ctx, { except: 'fun' })}`;

  return layout(ctx, {
    title: cat.label,
    description: `Photography and side projects by Eshun Burge. ${cat.intro}`,
    current: 'fun',
    page: 'fun',
    ogImage: cat.cover,
    body,
  });
}

/* ── /photography-<set>/ ───────────────────────────────────────────── */

/** The previous and next collections, as tickets. */
function nextStops(ctx, s) {
  const list = setsShown();
  const i = list.indexOf(s);
  const prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
  const t = (x, label) => ticket(ctx, { href: ctx.url(setHref(x)), scene: x.id, name: x.name, count: countLine(framesIn(x).length), label });
  return html`<nav class="stops" aria-labelledby="stops-title">
    <div class="sec-head"><h2 class="sec-title" id="stops-title">Next stops</h2></div>
    <ul class="tickets"><li>${t(prev, '← Previous stop')}</li><li>${t(next, 'Next stop →')}</li><li>${ticket(ctx, { href: ctx.url(`${cat.href}#collections`), scene: 'line', id: 'all', name: 'Every stop', count: `All ${sets.length} collections`, label: 'All stops' })}</li></ul>
  </nav>`;
}

export function photoSet(s) {
  return (ctx) => {
    const fs = framesIn(s);
    const intro = s.note || (fs.length ? `Photographs from ${s.name}.` : 'Photographs from this stop are on their way.');
    const body = html`
<header class="phead phead--board tone-dark">
  ${city('phead__city')}
  <div class="wrap phead__in phead__in--ticket">
    <div class="phead__text">
      <nav class="back" aria-label="Back to ${cat.label}"><a class="back__a" href="${ctx.url(cat.href)}">${arrow('left')} ${cat.label}</a></nav>
      <p class="board__label">Now arriving · ${stopOf(s)}</p>
      <h1 class="board" data-board>${board(s.name)}</h1>
      <p class="phead__intro">${intro}</p>
      <p class="phead__meta">${countLine(fs.length)} · Photo collection</p>
    </div>
    <div class="phead__ticket" aria-hidden="true">${ticket(ctx, { tag: 'div', scene: s.id, id: s.id, name: s.name, count: countLine(fs.length), label: stopOf(s), here: true })}</div>
  </div>
</header>
<section class="section section--tight" aria-label="Photos" data-visit="${s.id}">
  <div class="wrap">
    ${fs.length
      ? html`<div class="photos photos--set">${fs.map((f) => photo(ctx, f, s.id, '(max-width: 560px) 92vw, (max-width: 960px) 46vw, 31vw'))}</div>`
      : html`<div class="soon"><p class="soon__text">Photos from this collection are coming soon. In the meantime, more of my photography is on Instagram and VSCO.</p>${followLinks(ctx)}</div>`}
    ${nextStops(ctx, s)}
  </div>
</section>`;

    return layout(ctx, {
      title: `${s.name} — Photography`,
      description: `${s.name}: a photo collection by Eshun Burge.`,
      current: 'fun',
      page: 'photos',
      ogImage: fs[0]?.key || cat.cover,
      body,
    });
  };
}
