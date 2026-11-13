// One page per project, at the original URLs (/neuroassist/, /back-to-impact/, …).
//
// Every project page is built from the same parts, in the same order:
//   1. the head, the way a photo collection's page opens: the city behind, the way back, the
//      title on a split-flap board, one line, its links, and a ticket with its picture
//   2. its facts, printed like a boarding pass
//   3. the main picture: for software, the main screen in a browser window (a phone in front
//      when there is one); for research, the photograph; printed work goes straight to its pieces
//   4. the story: Overview, Highlights, How I made it (and Try it, Results, What I learned where a
//      project has them). Sections with nothing to say are left out rather than marked "soon".
//   5. the pictures: every printed piece, or the other screens
//   6. the version it grew from or into, if any; then the previous and next projects as tickets
import { html, raw } from '../lib.js';
import { layout } from '../layout.js';
import { pageHead, pass, nextStops, btn, figure, arrow, coverArt } from '../partials.js';
import { categories } from '../../data/site.js';
import { byDiscipline, projectBySlug } from '../../data/projects.js';

/** The boarding pass under the head. Empty rows are skipped. */
const passRows = (p) => [
  ['Type', p.kind],
  ['Year', p.year],
  ['Role', p.role],
  ['Made for', p.context],
  ['Built with', p.medium],
  ['Format', p.dimensions],
  ['Status', p.status],
  ['Recognition', p.honors],
];

/** The picture a project shows on tickets: its cover, or nothing (the ticket draws the line). */
export const coverOf = (p) => p.cover || null;

export default function project(p) {
  return (ctx) => {
    const cat = categories.find((c) => c.discipline === p.discipline);
    const siblings = byDiscipline(p.discipline).filter((x) => x.layout);
    const stops = siblings.map((x) => ({
      href: `/${x.slug}/`,
      name: x.title,
      count: [x.kind, x.year].filter(Boolean).join(' · '),
      img: coverArt(ctx, x),
    }));
    const all = { href: cat.href, name: `All ${cat.label}`, count: `${siblings.length} projects`, scene: cat.id, label: cat.label };
    const studyNote = '';

    // The story, said once. A first paragraph that only repeats the line under the title is
    // dropped; and when all there is to say is a sentence or two, it goes under the title instead
    // of into a section of its own.
    const lede = p.summary;
    let story = overview(p);
    if (story[0] === lede) story = story.slice(1);
    else if (story[0]?.startsWith(lede)) story = [story[0].slice(lede.length).trim(), ...story.slice(1)];
    const more = highlights(p) || making(p) || p.recognition || p.demo || p.learned?.length || p.note || studyNote;
    const thin = !more && story.join(' ').split(/\s+/).length <= 45;
    const intro = thin ? overview(p).join(' ') : lede;
    if (thin) story = [];

    const picture = mainPicture(ctx, p);
    const sections = [
      story.length ? sec('overview', 'Overview', paras(story)) : '',
      highlights(p) ? sec('highlights', 'Highlights', highlights(p)) : '',
      making(p) ? sec('making', 'How I made it', making(p)) : '',
      p.recognition ? sec('results', 'Results', html`<ul class="ladder ladder--big">${p.recognition.map((r) => html`<li><span class="ladder__level">${r.level}</span><span class="ladder__result">${r.result}</span></li>`)}</ul>`) : '',
      p.demo ? sec('try', 'Try it', demo(ctx, p)) : '',
      p.learned?.length ? sec('learned', 'What I learned', paras(p.learned)) : '',
      p.note || studyNote ? html`<div class="proj__sec proj__sec--note"><div class="proj__sec-body"><p class="proj__note">${p.note || studyNote}</p></div></div>` : '',
    ].filter(Boolean);

    const body = html`
<article class="proj proj--${p.layout}">
  ${pageHead(ctx, {
    back: { href: cat.href, label: cat.label },
    label: [p.kind, p.year].filter(Boolean).join(' · '),
    title: p.title,
    subtitle: p.fullTitle || p.subtitle || '',
    intro,
    actions: p.links?.length ? html`<p class="bhead__btns">${p.links.map((l, i) => btn(ctx, { href: l.href, label: l.label, kind: i === 0 ? 'pink' : '' }))}</p>` : '',
    ticket: {
      img: coverArt(ctx, p, { priority: true }),
      scene: 'line',
      id: p.slug,
      name: p.title,
      count: p.kind,
      label: cat.label,
    },
    visit: p.slug,
  })}
  <div class="wrap proj__pass">${pass(passRows(p))}</div>
  ${picture || sections.length ? html`<div class="section proj__body">
    ${picture}
    ${sections.length ? html`<div class="wrap proj__main">${sections}</div>` : ''}
  </div>` : ''}
  ${gallery(ctx, p)}
  <footer class="section proj__end">
    <div class="wrap">
      ${related(ctx, p)}
      ${nextStops(ctx, stops, `/${p.slug}/`, all, { title: `More ${cat.label.toLowerCase()}` })}
    </div>
  </footer>
</article>`;

    return layout(ctx, {
      title: p.title,
      description: `${p.fullTitle || p.title}: ${p.summary}`,
      current: cat.id,
      page: 'project',
      ogImage: p.cover || cat.cover,
      body,
    });
  };
}

/* ── Shared pieces ─────────────────────────────────────────────────── */

/** A section of the story: its title in the left column, the content on the right. */
function sec(id, title, content) {
  return html`<section class="proj__sec" aria-labelledby="${id}-title"><h2 class="proj__h" id="${id}-title">${title}</h2><div class="proj__sec-body">${content}</div></section>`;
}
const paras = (list) => html`<div class="prose">${list.map((t) => html`<p>${t}</p>`)}</div>`;

function overview(p) {
  if (p.abstract) return [...p.abstract, ...(p.why || [])];
  return p.body || [p.summary];
}

function highlights(p) {
  const list = p.highlights?.length ? p.highlights : p.findings?.length ? p.findings : null;
  if (list) return html`<ul class="hl">${list.map((t) => html`<li>${t}</li>`)}</ul>`;
  if (p.pieces?.length) {
    return html`<ul class="hl">${p.pieces.map((pc) => html`<li>${pc.name}${pc.booklet ? (pc.pages && pc.pages > pc.booklet.length ? `, a ${pc.pages}-page booklet` : `, ${pc.booklet.length} ${pc.unit || 'pages'}`) : pc.back ? ', front and back' : ''}</li>`)}</ul>`;
  }
  return '';
}

/** How it was made: the notes on how it's built, then what it's built with. */
function making(p) {
  const notes = (list) => html`<ul class="notes">${list.map((s) => html`<li class="note"><h3 class="note__title">${s.title}</h3><p>${s.text}</p></li>`)}</ul>`;
  const kit = p.medium?.length && p.layout === 'software' ? html`<div class="kit-row"><h3 class="kit-row__h">Built with</h3><ul class="tools">${p.medium.map((t) => html`<li>${t}</li>`)}</ul></div>` : '';
  if (p.loop) {
    return html`<ol class="steps">${p.loop.map((s, i) => html`<li class="step"><span class="step__no" aria-hidden="true">${i + 1}</span><h3 class="step__title">${s.title}</h3><p>${s.text}</p></li>`)}</ol>
      <p class="steps__then">Then answer the next question, and keep going until the board is full.</p>
      ${p.process ? notes(p.process) : ''}${kit}`;
  }
  if (p.process?.length) return html`${notes(p.process)}${kit}`;
  if (p.method?.length) return paras(p.method);
  return kit;
}

function demo(ctx, p) {
  return html`<div class="demo" data-demo="${p.demo.src}" data-demo-title="${p.demo.title}" data-demo-allow="${p.demo.allow || ''}">
    <div class="demo__poster">
      <p class="demo__text">${ctx.preview
        ? `${p.demo.note ? p.demo.note + ' ' : ''}The live demo opens in a new tab.`
        : `Load the live demo right here on the page. ${p.demo.note || ''} It only loads from GitHub Pages when you press the button.`}</p>
      <p class="demo__actions">
        ${ctx.preview ? '' : html`<button class="btn btn--pink" type="button" data-demo-load hidden>Load the demo ${arrow('down')}</button>`}
        <a class="btn" href="${p.demo.src}" target="_blank" rel="noopener">Open in a new tab ${arrow('out')}</a>
      </p>
    </div>
  </div>`;
}

/* ── The main picture ──────────────────────────────────────────────── */

/** A screen in a browser window: three dots and the address, then the picture. */
function browser(ctx, p, im, sizes, { priority = false } = {}) {
  return html`<div class="browser${p.frame === 'plain' ? ' browser--plain' : ''}">
    <div class="browser__bar" aria-hidden="true"><i></i><i></i><i></i><span class="browser__url">${p.url || p.title}</span></div>
    <a class="browser__shot" href="${ctx.src(im.key, 2400)}" data-viewer="${p.slug}" data-title="${im.caption}">${ctx.img(im.key, { alt: im.caption, sizes, priority })}</a>
  </div>`;
}

function phoneFrame(ctx, p, im, sizes, cls = '') {
  return html`<a class="phone${cls ? ` ${cls}` : ''}" href="${ctx.src(im.key, 2400)}" data-viewer="${p.slug}" data-title="${im.caption}">${ctx.img(im.key, { alt: im.caption, sizes })}</a>`;
}

/** Which pictures the main picture uses: the first screen, the first phone screen, or — when
 *  there are no screens yet — the project's mark. The gallery shows everything else. */
function staged(p) {
  const images = p.images || [];
  if (p.layout === 'software') {
    const logoOnly = p.coverFit === 'contain';
    const first = logoOnly ? null : images.find((i) => !i.phone && !i.asset) || null;
    const phone = first ? images.find((i) => i.phone) || null : null;
    const mark = first ? null : (logoOnly ? images[0] : images.find((i) => i.asset)) || null;
    return { first, phone, mark };
  }
  if (p.layout === 'design') return { first: null, phone: null, mark: null };
  // research: the first picture, when it is wide enough to stand alone (a poster); pages of a paper sit in the gallery
  return { first: null, phone: null, mark: null };
}

function mainPicture(ctx, p) {
  const { first, phone, mark } = staged(p);
  // Software: always a browser window, with the phone standing in front when there is one.
  if (p.layout === 'software') {
    let inner;
    if (first) {
      inner = html`<div class="stage__screens">${browser(ctx, p, first, '(max-width: 1440px) 82vw, 1060px', { priority: true })}${phone ? phoneFrame(ctx, p, phone, '(max-width: 760px) 30vw, 230px', 'stage__phone') : ''}</div>`;
    } else if (mark) {
      // No screens to show yet: the window shows the project's mark.
      inner = html`<div class="browser">
        <div class="browser__bar" aria-hidden="true"><i></i><i></i><i></i><span class="browser__url">${p.url || p.title}</span></div>
        <div class="browser__blank"><span class="browser__mark">${ctx.img(mark.key, { alt: mark.caption, sizes: '(max-width: 760px) 60vw, 420px', priority: true })}</span>${p.stageNote ? html`<p class="browser__note">${p.stageNote}</p>` : ''}</div>
      </div>`;
    } else {
      // Nothing to show yet: no empty window. The facts and the story carry the page.
      return '';
    }
    return html`<div class="stage">
      <div class="wrap"><figure class="stage__fig${phone ? ' stage__fig--phone' : ''}">${inner}</figure></div>
    </div>`;
  }
  // Research and the rest: the first photograph, large.
  if (first) {
    return html`<div class="stage">
      <div class="wrap"><figure class="stage__fig stage__fig--photo">
        <a class="stage__photo" href="${ctx.src(first.key, 2400)}" data-viewer="${p.slug}" data-title="${first.caption}">${ctx.img(first.key, { alt: first.caption, sizes: '(max-width: 1440px) 92vw, 1200px', priority: true })}</a>
        <figcaption>${first.caption}</figcaption>
      </figure></div>
    </div>`;
  }
  return '';
}

/* ── The pictures ──────────────────────────────────────────────────── */
// Pictures sit in rows that share one height, the way a contact sheet lines up: each one's width
// follows its proportions (--r, width over height), plus any frame around it (--x), so every row
// runs edge to edge with nothing left hanging.

function gallery(ctx, p) {
  let content = '';
  let title = 'Gallery';
  const photo = (im) => figure(ctx, im.key, { caption: im.caption, sizes: '(max-width: 760px) 92vw, 46vw', viewer: p.slug, cls: 'photo-fig', style: `--r:${ctx.ratio(im.key).toFixed(3)}` });
  if (p.layout === 'design') {
    const groups = p.groups || [{ pieces: p.pieces || [], photos: p.photos || [] }];
    if (!groups.some((g) => g.pieces.length || g.photos?.length)) return '';
    title = 'The pieces';
    content = groups.map((g) => html`<div class="proj__group">
      ${g.title ? html`<h3 class="group-title">${g.title}</h3>${g.text ? html`<p class="group-text">${g.text}</p>` : ''}` : ''}
      ${g.pieces.length ? html`<div class="flow pieces">${g.pieces.map((pc) => piece(ctx, p, pc))}</div>` : ''}
      ${g.photos?.length ? html`<div class="flow">${g.photos.map(photo)}</div>` : ''}
    </div>`);
  } else {
    const used = Object.values(staged(p)).filter(Boolean);
    const rest = (p.images || []).filter((i) => !used.includes(i));
    if (!rest.length) return '';
    title = p.layout === 'software' ? 'More screens' : p.layout === 'research' ? 'Poster, paper and photos' : 'More pictures';
    // screens first, then phone screens, then the marks and mockups
    const order = (i) => (i.phone ? 1 : i.asset ? 2 : 0);
    const items = [...rest].sort((a, b) => order(a) - order(b));
    content = html`<div class="flow">${items.map((im) => {
      const r = `--r:${ctx.ratio(im.key).toFixed(3)}`;
      if (im.phone) return html`<figure class="fig phone-fig" style="${r}">${phoneFrame(ctx, p, im, '(max-width: 760px) 46vw, 280px')}</figure>`;
      if (im.asset) return figure(ctx, im.key, { caption: im.caption, sizes: '(max-width: 760px) 92vw, 30vw', viewer: p.slug, cls: 'asset-fig', style: r });
      if (p.layout === 'software') return html`<figure class="fig shot-fig" style="${r}">${browser(ctx, p, im, '(max-width: 760px) 92vw, 46vw')}</figure>`;
      if (im.doc) return figure(ctx, im.key, { caption: im.caption, sizes: '(max-width: 760px) 92vw, 46vw', viewer: p.slug, cls: 'doc-fig', style: r });
      return photo(im);
    })}</div>`;
  }
  return html`<section class="section section--alt proj__gallery" aria-labelledby="gallery-title">
    <div class="wrap">
      <div class="sec-head"><h2 class="sec-title" id="gallery-title">${title}</h2><p class="sec-head__note">Select a picture to see it whole, then zoom and move around it.</p></div>
      ${content}
    </div>
  </section>`;
}

function piece(ctx, p, pc) {
  const pages = pc.booklet
    ? pc.booklet.map((k, j) => ({ key: k, label: `${pc.unit === 'posts' ? 'post' : pc.unit === 'panels' ? 'panel' : pc.unit === 'slides' ? 'slide' : pc.unit === 'stories' ? 'story' : 'page'} ${j + 1}` }))
    : pc.back
      ? [{ key: pc.key, label: 'front' }, { key: pc.back, label: 'back' }]
      : [{ key: pc.key, label: '' }];
  // a booklet of four or more keeps a row of its own; everything else takes its share of a row
  const r = pages.reduce((n, pg) => n + ctx.ratio(pg.key), 0);
  const full = pc.booklet?.length > 3;
  return html`<figure class="piece${pc.booklet ? ' piece--booklet' : ''}${pc.back ? ' piece--two' : ''}${full ? ' flow__full' : ''}" style="--r:${r.toFixed(3)};--n:${pages.length}">
    <div class="piece__imgs">${pages.map((pg) => {
      const label = pg.label ? `${pc.name}, ${pg.label}` : pc.name;
      return html`<a class="piece__a" href="${ctx.src(pg.key, 2400)}" data-viewer="${p.slug}" data-title="${label}">${ctx.img(pg.key, { alt: label, sizes: pc.booklet ? '(max-width: 760px) 44vw, 22vw' : full ? '(max-width: 1440px) 92vw, 1200px' : '(max-width: 760px) 92vw, 46vw' })}</a>`;
    })}</div>
  </figure>`;
}

function related(ctx, p) {
  if (!p.related) return '';
  const r = projectBySlug[p.related.slug];
  return html`<aside class="related" aria-label="${p.related.label}: ${r.title}">
    <div class="related__media">${coverArt(ctx, r)}</div>
    <div class="related__body">
      <p class="related__label">${p.related.label}</p>
      <p class="related__title">${r.title}</p>
      <p class="related__text">${p.related.text}</p>
      <a class="more" href="${ctx.url(`/${r.slug}/`)}">See ${r.title} ${arrow()}</a>
    </div>
  </aside>`;
}
