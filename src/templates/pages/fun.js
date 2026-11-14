// Just for Fun — the photo collections as tickets, one stop each (each opens its own page of
// photographs, at the original /photography-<country>/ URLs), then piano and swimming.
import { html, raw } from '../lib.js';
import { layout } from '../layout.js';
import { pageHead, secHead, btn, categoryTiles, ticket, platformOf, nextStops, arrow, catArt } from '../partials.js';
import { categoryById } from '../../data/site.js';
import { frames, sets, openSets, photoLinks } from '../../data/photos.js';
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
/** Each collection with photographs is a stop, numbered in the original order. */
export const stopOf = (s) => (openSets.includes(s) ? `Stop ${openSets.indexOf(s) + 1}` : 'Coming soon');

/** The collections that are shown: the ones with photographs. */
export const setsShown = () => openSets;

/** A collection's picture on its ticket: its first photograph, shown whole. */
export const setArt = (ctx, s) => (framesIn(s)[0] ? ctx.img(framesIn(s)[0].key, { alt: '', sizes: '(max-width: 760px) 80vw, 400px', cls: 'is-whole' }) : null);

/** Every collection as a ticket, plus the mystery stop: a photograph from anywhere on the line,
 *  picked at random each time it's opened (without JavaScript it opens the first one). */
export function collectionTickets(ctx, list = setsShown(), { mystery = true } = {}) {
  const items = list.map((s) => ticket(ctx, { href: ctx.url(setHref(s)), scene: s.id, img: setArt(ctx, s), name: s.name, count: countLine(framesIn(s).length), label: stopOf(s) }));
  const pool = frames.filter((f) => sets.some((s) => s.id === f.set));
  if (mystery && pool.length) {
    const deck = pool.map((f) => [ctx.src(f.key, 2400), captionOf(f)]);
    items.push(ticket(ctx, { href: deck[0][0], scene: 'mystery', id: 'mystery', name: 'Mystery stop', count: 'A photo at random', label: 'Stop ?', viewer: 'mystery', title: deck[0][1], deck: JSON.stringify(deck) }));
  }
  return html`<ul class="tickets">${items.map((t) => html`<li>${t}</li>`)}</ul>`;
}

/** A photo that opens larger (where it was taken is in the viewer). */
function photo(ctx, f, group, sizes) {
  const where = placeLine(f);
  return html`<figure class="photo">
    <a class="photo__a" href="${ctx.src(f.key, 2400)}" data-viewer="${group}" data-title="${where || f.subject}">${ctx.img(f.key, { alt: where ? `${f.subject}. ${where}.` : `${f.subject}.`, sizes })}</a>
  </figure>`;
}

function followLinks(ctx) {
  return html`<p class="follow">${photoLinks.map((l) => btn(ctx, { href: l.href, label: l.label }))}</p>`;
}

/* ── /just-for-fun/ ────────────────────────────────────────────────── */
export function fun(ctx) {
  const also = OFF;
  const body = html`
${pageHead(ctx, {
    platform: platformOf('fun'),
    title: cat.label,
    meta: `${openSets.length} photo collections`,
    ticket: { img: ctx.img('photo/prague', { alt: '', sizes: '400px', cls: 'is-whole' }), scene: 'fun', id: 'fun', name: cat.label, count: `${openSets.length} photo collections`, label: `Platform ${platformOf('fun')}` },
    visit: 'fun',
  })}

<section class="section section--first" id="collections" aria-labelledby="sets-title">
  <div class="wrap">
    ${secHead({ id: 'sets-title', title: 'Photo collections' })}
    ${collectionTickets(ctx)}
    <h3 class="follow__h">Follow my photography</h3>
    ${followLinks(ctx)}
  </div>
</section>

<section class="section section--alt" aria-labelledby="off-title">
  <div class="wrap">
    ${secHead({ id: 'off-title', title: 'Beyond the camera' })}
    <div class="offclock">
      ${also.map((o) => html`<article class="offclock__item"><p class="offclock__since">${o.since}</p><h3 class="offclock__title">${o.title}</h3><p class="offclock__text">${o.text}</p>${o.notes ? html`<ul class="ticks">${o.notes.map((n) => html`<li>${n}</li>`)}</ul>` : ''}${o.href ? html`<a class="more offclock__more" href="${ctx.url(o.href)}">${o.more} ${arrow()}</a>` : ''}</article>`)}
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

export function photoSet(s) {
  return (ctx) => {
    const fs = framesIn(s);
    const intro = s.note || (fs.length ? `Photographs from ${s.name}.` : 'Photographs from this stop are on their way.');
    const body = html`
${pageHead(ctx, {
  back: { href: cat.href, label: cat.label },
  label: fs.length ? `Now arriving · ${stopOf(s)}` : 'Coming soon',
  title: s.name,
  intro,
  meta: `${countLine(fs.length)} · Photo collection`,
  ticket: { img: setArt(ctx, s), scene: s.id, id: s.id, name: s.name, count: countLine(fs.length), label: stopOf(s) },
  visit: s.id,
})}
<section class="section section--first" aria-label="Photos">
  <div class="wrap">
    ${fs.length
      ? html`<div class="photos photos--set">${fs.map((f) => photo(ctx, f, s.id, '(max-width: 560px) 92vw, (max-width: 960px) 46vw, 31vw'))}</div>`
      : html`<div class="soon"><p class="soon__text">Photos from this collection are coming soon. In the meantime, more of my photography is on Instagram and VSCO.</p>${followLinks(ctx)}</div>`}
    ${nextStops(ctx, setsShown().map((x) => ({ href: setHref(x), img: setArt(ctx, x), scene: x.id, id: x.id, name: x.name, count: countLine(framesIn(x).length), start: stopOf(x) })), setHref(s), { href: `${cat.href}#collections`, scene: 'line', id: 'all', name: 'Every stop', count: `All ${openSets.length} collections`, label: 'All stops' })}
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
