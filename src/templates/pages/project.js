// One page per project, at the original URLs (/neuroassist/, /back-to-impact/, …).
//
// Every project page has the same parts, in the same order, whatever kind of project it is:
//   1. the head: the way back, what it is, its title and one line, its links, and a facts card
//   2. a big picture
//   3. four sections: Overview, Highlights, How I made it, What I learned
//      (plus a live demo, a results ladder or a note where a project has one)
//   4. a gallery
//   5. the version it grew from or into, if any; then previous / next
// A section with nothing in it yet says so, so every page keeps the same shape.
import { html, raw } from '../lib.js';
import { layout } from '../layout.js';
import { crumbs, btn, figure, facts, pager, arrow } from '../partials.js';
import { categories } from '../../data/site.js';
import { byDiscipline, projectBySlug } from '../../data/projects.js';

/** The facts card beside the title. Empty rows are skipped. */
const factRows = (p) => [
  ['Type', p.kind],
  ['Year', p.year],
  ['Role', p.role],
  ['Made for', p.context],
  ['Built with', p.medium],
  ['Format', p.dimensions],
  ['Status', p.status],
  ['Recognition', p.honors],
];

export default function project(p) {
  return (ctx) => {
    const cat = categories.find((c) => c.discipline === p.discipline);
    const siblings = byDiscipline(p.discipline).filter((x) => x.layout).map((x) => ({ href: `/${x.slug}/`, title: x.title }));
    const trail = [{ href: '/', label: 'Home' }, { href: cat.href, label: cat.label }, { href: `/${p.slug}/`, label: p.title }];
    const factList = facts(factRows(p));
    const studyNote = p.layout === 'research' && p.abstract
      ? raw(`The poster and full paper aren’t published here yet. For questions about the study, <a href="${ctx.url('/contact/')}">get in touch</a>.`)
      : '';

    const body = html`
<article class="proj proj--${p.layout}">
  <header class="proj__head">
    <div class="wrap proj__top">
      <div class="proj__intro">
        ${crumbs(ctx, trail)}
        <p class="proj__kind">${[p.kind, p.year].filter(Boolean).join(' · ')}</p>
        <h1 class="proj__title">${p.title}</h1>
        ${p.subtitle || p.fullTitle ? html`<p class="proj__subtitle">${p.fullTitle || p.subtitle}</p>` : ''}
        ${p.deck ? html`<p class="proj__deck">${p.deck}</p>` : ''}
        ${p.tags?.length ? html`<ul class="tags" aria-label="Topics">${p.tags.map((t) => html`<li>${t}</li>`)}</ul>` : ''}
        ${p.links?.length ? html`<p class="proj__actions">${p.links.map((l, i) => btn(ctx, { href: l.href, label: l.label, kind: i === 0 ? 'pink' : '' }))}</p>` : ''}
      </div>
      ${factList ? html`<aside class="proj__facts" aria-label="Project facts">${factList}</aside>` : ''}
    </div>
  </header>
  ${hero(ctx, p)}
  <div class="wrap proj__main">
    ${sec('overview', 'Overview', paras(overview(p)))}
    ${sec('highlights', 'Highlights', highlights(p))}
    ${sec('making', 'How I made it', making(p))}
    ${p.recognition ? sec('results', 'Results', html`<ul class="ladder ladder--big">${p.recognition.map((r) => html`<li><span class="ladder__level">${r.level}</span><span class="ladder__result">${r.result}</span></li>`)}</ul>`) : ''}
    ${p.demo ? sec('try', 'Try it', demo(ctx, p)) : ''}
    ${sec('learned', 'What I learned', p.learned?.length ? paras(p.learned) : soon('In my own words, coming soon.'))}
    ${p.note || studyNote ? html`<div class="proj__sec proj__sec--note"><div class="proj__sec-body"><p class="proj__note">${p.note || studyNote}</p></div></div>` : ''}
  </div>
  ${gallery(ctx, p)}
  ${related(ctx, p)}
  <footer class="proj__end">
    <div class="wrap">
      ${pager(ctx, siblings, `/${p.slug}/`, `More ${cat.label.toLowerCase()}`)}
      <p class="proj__all"><a class="more" href="${ctx.url(cat.href)}">All ${cat.label} ${arrow()}</a></p>
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
/** What a section shows until its content is added. */
const soon = (text) => html`<p class="soon-line">${text}</p>`;

function overview(p) {
  if (p.abstract) return [...p.abstract, ...(p.why || [])];
  return p.body || [p.summary];
}

function highlights(p) {
  if (p.highlights?.length) return html`<ul class="hl">${p.highlights.map((t) => html`<li>${t}</li>`)}</ul>`;
  if (p.findings?.length) return html`<ul class="hl">${p.findings.map((t) => html`<li>${t}</li>`)}</ul>`;
  if (p.pieces?.length) {
    return html`<ul class="hl">${p.pieces.map((pc) => html`<li>${pc.name}${pc.booklet ? (pc.pages && pc.pages > pc.booklet.length ? `, a ${pc.pages}-page booklet` : ', a booklet') : pc.back ? ', front and back' : ''}</li>`)}</ul>`;
  }
  return soon('Highlights coming soon.');
}

function making(p) {
  const notes = (list, cls = '') => html`<ul class="notes${cls}">${list.map((s) => html`<li class="note"><h3 class="note__title">${s.title}</h3><p>${s.text}</p></li>`)}</ul>`;
  if (p.loop) {
    return html`<ol class="steps">${p.loop.map((s, i) => html`<li class="step"><span class="step__no" aria-hidden="true">${i + 1}</span><h3 class="step__title">${s.title}</h3><p>${s.text}</p></li>`)}</ol>
      <p class="steps__then">Then answer the next question, and keep going until the board is full.</p>
      ${p.process ? notes(p.process, ' notes--after') : ''}`;
  }
  if (p.process?.length) return notes(p.process);
  if (p.method?.length) return paras(p.method);
  return soon('The making-of is coming soon.');
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

/* ── The big picture ───────────────────────────────────────────────── */

function hero(ctx, p) {
  const images = p.images || [];
  // A logo instead of screens (BlockSAT is still in development).
  if (p.coverFit === 'contain' && images[0]) {
    return html`<div class="wrap"><figure class="proj__hero proj__hero--logo tone-dark">${ctx.img(images[0].key, { alt: `The ${p.title} logo`, sizes: '(max-width: 760px) 80vw, 46vw', priority: true })}<figcaption>${images[0].caption} No public screenshots yet: the game is still in development.</figcaption></figure></div>`;
  }
  // Printed work: the cover piece, standing on a light table.
  if (p.layout === 'design' && p.cover) {
    const pc = (p.pieces || []).find((x) => x.key === p.cover);
    const name = pc ? pc.name : p.title;
    return html`<div class="wrap"><figure class="proj__hero proj__hero--piece">
      <a class="piece__a" href="${ctx.src(p.cover, 2400)}" data-viewer="${p.slug}-cover" data-title="${name}">${ctx.img(p.cover, { alt: `${p.title}: ${name}`, sizes: '(max-width: 760px) 80vw, 34vw', priority: true })}</a>
      <figcaption>${name}</figcaption>
    </figure></div>`;
  }
  if (p.slug === 'campaign-materials') {
    return html`<div class="wrap"><div class="identity" role="img" aria-label="The campaign name, Impression! with Eshun, set in black and gold"><span class="identity__name">Impression!</span><span class="identity__with">with Eshun</span></div></div>`;
  }
  const first = images[0];
  if (!first) {
    return html`<div class="wrap"><div class="proj__hero proj__hero--soon tone-dark"><p class="hero-soon__title" aria-hidden="true">${p.title}</p><p class="hero-soon__text">Pictures coming soon.</p></div></div>`;
  }
  const rest = images.slice(1);
  const phones = rest.filter((i) => i.phone);
  const shots = rest.filter((i) => !i.phone);
  // A desktop screen with a single phone screen: show them together, the phone in front.
  if (!shots.length && phones.length === 1 && !first.phone) {
    return html`<div class="wrap"><figure class="proj__hero">
      <div class="duo">
        <a class="shot" href="${ctx.src(first.key, 2400)}" data-viewer="${p.slug}" data-title="${first.caption}">${ctx.img(first.key, { alt: first.caption, sizes: '(max-width: 1440px) 82vw, 1180px', priority: true })}</a>
        <a class="duo__phone" href="${ctx.src(phones[0].key, 2400)}" data-viewer="${p.slug}" data-title="${phones[0].caption}">${ctx.img(phones[0].key, { alt: phones[0].caption, sizes: '(max-width: 760px) 30vw, 250px' })}</a>
      </div>
      <figcaption>${first.caption} ${phones[0].caption}</figcaption>
    </figure></div>`;
  }
  return html`<div class="wrap"><figure class="proj__hero">
    <a class="shot" href="${ctx.src(first.key, 2400)}" data-viewer="${p.slug}" data-title="${first.caption}">${ctx.img(first.key, { alt: first.caption, sizes: '(max-width: 1440px) 92vw, 1200px', priority: true })}</a>
    <figcaption>${first.caption}</figcaption>
  </figure></div>`;
}

/* ── The gallery ───────────────────────────────────────────────────── */

function gallery(ctx, p) {
  let content = '';
  if (p.layout === 'design' && p.pieces?.length) {
    content = html`<div class="pieces">${p.pieces.map((pc) => piece(ctx, p, pc))}</div>`;
  } else {
    const images = p.coverFit === 'contain' ? [] : (p.images || []).slice(1);
    // The duo picture at the top already shows a lone phone screen.
    const duo = images.length === 1 && images[0].phone;
    const shots = duo ? [] : images.filter((i) => !i.phone);
    const phones = duo ? [] : images.filter((i) => i.phone);
    if (shots.length || phones.length) {
      content = html`${shots.length ? html`<div class="gallery${shots.length === 1 ? ' gallery--one' : ''}">${shots.map((im) => figure(ctx, im.key, { caption: im.caption, sizes: '(max-width: 760px) 92vw, 46vw', viewer: p.slug, cls: p.layout === 'research' ? '' : 'shot-fig' }))}</div>` : ''}
        ${phones.length ? html`<div class="phones">${phones.map((im) => figure(ctx, im.key, { caption: im.caption, sizes: '(max-width: 760px) 60vw, 280px', viewer: p.slug, cls: 'phone-fig' }))}</div>` : ''}`;
    }
  }
  return html`<section class="section section--tight section--alt proj__gallery" aria-labelledby="gallery-title">
    <div class="wrap">
      <h2 class="proj__h" id="gallery-title">Gallery</h2>
      ${content ? html`<p class="proj__hint">Select any picture to see it larger.</p>${content}` : soon('More pictures coming soon.')}
    </div>
  </section>`;
}

function piece(ctx, p, pc) {
  const pages = pc.booklet
    ? pc.booklet.map((k, j) => ({ key: k, label: `page ${j + 1}` }))
    : pc.back
      ? [{ key: pc.key, label: 'front' }, { key: pc.back, label: 'back' }]
      : [{ key: pc.key, label: '' }];
  const caption = pc.booklet
    ? (pc.pages && pc.pages > pc.booklet.length ? `${pc.booklet.length} of its ${pc.pages} pages` : `${pc.booklet.length} pages`)
    : pc.back ? 'Front and back' : '';
  const wide = pc.size && pc.size[0] / pc.size[1] > 1.15;
  return html`<figure class="piece${pc.booklet ? ' piece--booklet' : ''}${pc.back ? ' piece--two' : ''}${wide ? ' piece--wide' : ''}">
    <div class="piece__imgs">${pages.map((pg) => {
      const label = pg.label ? `${pc.name}, ${pg.label}` : pc.name;
      return html`<a class="piece__a" href="${ctx.src(pg.key, 2400)}" data-viewer="${p.slug}" data-title="${label}">${ctx.img(pg.key, { alt: label, sizes: pc.booklet ? '(max-width: 760px) 44vw, 22vw' : pc.back ? '(max-width: 760px) 44vw, 23vw' : '(max-width: 760px) 92vw, 46vw' })}</a>`;
    })}</div>
    <figcaption><span class="piece__name">${pc.name}</span>${caption ? html`<span class="piece__note">${caption}</span>` : ''}</figcaption>
  </figure>`;
}

function related(ctx, p) {
  if (!p.related) return '';
  const r = projectBySlug[p.related.slug];
  return html`<div class="wrap"><aside class="related" aria-label="${p.related.label}: ${r.title}">
    <div class="related__media">${r.cover ? ctx.img(r.cover, { alt: '', sizes: '(max-width: 760px) 92vw, 30vw' }) : ''}</div>
    <div class="related__body">
      <p class="related__label">${p.related.label}</p>
      <p class="related__title">${r.title}</p>
      <p class="related__text">${p.related.text}</p>
      <a class="more" href="${ctx.url(`/${r.slug}/`)}">See ${r.title} ${arrow()}</a>
    </div>
  </aside></div>`;
}
