// Contact, Links, the live-demo pages from the original site, and the 404 page.
import { html, raw } from '../lib.js';
import { layout } from '../layout.js';
import { pageHead, pass, arrow, platformOf, city, board, countOf, categoryById } from '../partials.js';
import { site, nav, channels, linkGroups, linksQuote } from '../../data/site.js';

/* ── Contact ───────────────────────────────────────────────────────── */
export function contact(ctx) {
  const body = html`
${pageHead(ctx, {
    platform: platformOf('contact'),
    title: 'Contact',
    intro: 'Have a question, an idea or a project? Send me a message, or email me directly.',
    ticket: { scene: 'cute4', id: 'contact', name: 'Contact', count: 'Say hello', label: `Platform ${platformOf('contact')}` },
    visit: 'contact',
  })}
<section class="section section--first" aria-label="Ways to reach me">
  <div class="wrap contact">
    <aside class="contact__side" aria-labelledby="channels-title">
      <h2 class="contact__h" id="channels-title">Email</h2>
      <a class="contact__mail" data-email href="#f-name"><span data-email-text>Use the form</span> ${arrow()}</a>
      <h2 class="contact__h">Find me online</h2>
      <ul class="connect">
        ${channels.filter((c) => c.href).map((c) => html`<li><a class="connect__a" href="${c.href}" target="_blank" rel="noopener me"><span>${c.label}</span><span class="connect__h">${c.handle} ${arrow('out')}</span></a></li>`)}
      </ul>
    </aside>
    <form class="form" action="${site.formAction}" method="POST" data-contact-form ${ctx.preview ? raw('data-preview') : ''} novalidate aria-labelledby="form-title">
      <h2 class="contact__h" id="form-title">Send me a message</h2>
      <input type="hidden" name="_subject" value="New message from eshun.net">
      <div class="form__hp" aria-hidden="true"><label>Leave this empty <input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></div>
      <div class="form__row">
        <div class="field"><label for="f-name">Name</label><input id="f-name" name="name" type="text" autocomplete="name" required></div>
        <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
      </div>
      <div class="field"><label for="f-msg">Message</label><textarea id="f-msg" name="message" rows="7" required></textarea></div>
      <div class="form__send">
        <button class="btn btn--pink" type="submit">Send ${arrow()}</button>
        <p class="form__status" role="status" aria-live="polite" data-status></p>
      </div>
    </form>
  </div>
</section>`;
  return layout(ctx, {
    title: 'Contact',
    description: 'Get in touch with Eshun Burge.',
    current: 'contact',
    page: 'contact',
    footerCta: false,
    body,
  });
}

/* ── Links (kept: it is probably in a bio somewhere) ───────────────── */
// Every place to find me, each group a row of tickets: where it goes, the handle, and an arrow.
export function links(ctx) {
  const total = linkGroups.reduce((n, g) => n + g.links.length, 0);
  const body = html`
${pageHead(ctx, {
    platform: platformOf('links'),
    title: 'Links',
    intro: `“${linksQuote}”`,
    meta: `${total} places to find me`,
    ticket: { scene: 'cute2', id: 'links', name: 'Eshun Burge', count: `${total} places to find me`, label: `Platform ${platformOf('links')}` },
    visit: 'links',
  })}
<section class="section section--first" aria-label="All links">
  <div class="wrap linkgroups">
    ${linkGroups.map((g) => {
      const id = `lg-${g.title.toLowerCase()}`;
      return html`<section class="linkgroup" aria-labelledby="${id}">
      <div class="linkgroup__head"><h2 class="linkgroup__title" id="${id}">${g.title}</h2><p class="linkgroup__count">${g.links.length} ${g.links.length === 1 ? 'link' : 'links'}</p></div>
      <ul class="stubs">${g.links.map((l) => {
        const internal = l.href.startsWith('/');
        return html`<li><a class="stub" href="${internal ? ctx.url(l.href) : l.href}"${internal ? '' : raw(' target="_blank" rel="noopener me"')}>
          <span class="stub__label${internal ? ' stub__label--here' : ''}">${internal ? 'You are here' : new URL(l.href).hostname.replace(/^www\./, '')}</span>
          <span class="stub__to">${l.label}</span>
          <span class="stub__handle">${l.handle}</span>
          <span class="stub__go" aria-hidden="true">${arrow(internal ? 'right' : 'out')}</span>
        </a></li>`;
      })}</ul>
    </section>`;
    })}
  </div>
</section>`;
  return layout(ctx, { title: 'Links', description: 'Every place to find Eshun Burge online.', current: 'links', page: 'links', body });
}

/* ── Live-demo pages (the original site's URLs, kept working) ───────── */
export function demo({ title, src, back, backLabel, allow = '' }) {
  return (ctx) => layout(ctx, {
    title: `${title} live demo`,
    description: `A live demo of ${title}.`,
    page: 'demo',
    noindex: true,
    footerCta: false,
    body: html`<section class="demopage" aria-labelledby="demo-title">
      <div class="wrap demopage__bar">
        <a class="more more--back" href="${ctx.url(back)}">${arrow('left')} ${backLabel}</a>
        <h1 class="demopage__title" id="demo-title">${title}: live demo</h1>
        <a class="more" href="${src}" target="_blank" rel="noopener">Open in a new tab ${arrow('out')}</a>
      </div>
      ${ctx.preview
        ? html`<div class="wrap"><div class="soon"><p class="soon__text">This preview can’t show other websites inside it.</p><p class="follow"><a class="btn btn--pink" href="${src}" target="_blank" rel="noopener">Open the ${title} demo ${arrow('out')}</a></p></div></div>`
        : html`<iframe class="demopage__frame" src="${src}" title="${title} live demo" loading="lazy" ${allow ? raw(`allow="${allow}"`) : ''} referrerpolicy="no-referrer"></iframe>`}
    </section>`,
  });
}

/* ── 404 ───────────────────────────────────────────────────────────── */
/** What each stop on the line holds, for the departures board. */
function whatsThere(id) {
  const cat = categoryById[id];
  if (cat) return countOf(cat);
  const total = linkGroups.reduce((n, g) => n + g.links.length, 0);
  return { home: 'Where the line starts', about: 'My story, experience and awards', links: `${total} places to find me`, contact: 'Send me a message' }[id] || '';
}

export function notFound(ctx) {
  return layout(ctx, {
    title: 'Page not found',
    page: 'notfound',
    noindex: true,
    body: html`${pageHead(ctx, {
      label: 'Error 404 · Not in service',
      title: 'Wrong platform',
      intro: 'This train doesn’t stop here. The page may have moved when the site was rebuilt. Every stop on the line is below.',
      ticket: { scene: 'mystery', id: 'nf', name: 'Not in service', count: 'Every stop is below', label: 'Platform ?' },
    })}
    <section class="section section--first" aria-labelledby="dep-title">
      <div class="wrap">
        <div class="sec-head"><h2 class="sec-title" id="dep-title">Departures</h2></div>
        <ol class="departures">
          ${nav.map((n, i) => html`<li><a class="departures__a" href="${ctx.url(n.href)}"><span class="departures__plat">Platform ${i + 1}</span><span class="departures__to">${n.label}</span><span class="departures__what">${whatsThere(n.id)}</span>${arrow()}</a></li>`)}
        </ol>
      </div>
    </section>`,
  });
}
