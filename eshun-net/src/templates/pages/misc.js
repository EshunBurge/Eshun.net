// Contact, Links, the live-demo pages from the original site, and the 404 page.
import { html, raw } from '../lib.js';
import { layout } from '../layout.js';
import { pageHead, arrow, platformOf } from '../partials.js';
import { site, nav, channels, linkGroups, linksQuote } from '../../data/site.js';
import { board } from '../partials.js';

/* ── Contact ───────────────────────────────────────────────────────── */
export function contact(ctx) {
  const body = html`
${pageHead(ctx, {
    title: 'Contact',
    intro: 'Collaborations, internships, competition teams, speaking, or just a question about something on this site. Every channel below reaches me directly.',
    actions: html`<ul class="quick">
      <li><span class="quick__k">Fastest route</span><span class="quick__v">Email</span></li>
      <li><span class="quick__k">Based in</span><span class="quick__v">${site.region}</span></li>
      <li><span class="quick__k">Open to</span><span class="quick__v">Collaborations, internships, teams and speaking</span></li>
      <li><span class="quick__k">Replies</span><span class="quick__v">Usually within a day or two</span></li>
    </ul>`,
    station: true,
    platform: platformOf('contact'),
  })}
<section class="section section--tight" aria-label="Ways to reach me">
  <div class="wrap contact">
    <form class="form" action="${site.formAction}" method="POST" data-contact-form ${ctx.preview ? raw('data-preview') : ''} novalidate aria-labelledby="form-title">
      <h2 class="sub-title" id="form-title">Send a message</h2>
      <p class="form__lede">Fill this in and it lands in my inbox. I read everything and usually reply within a day or two.</p>
      <input type="hidden" name="_subject" value="New message from eshun.net">
      <div class="form__hp" aria-hidden="true"><label>Leave this empty <input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></div>
      <div class="form__row">
        <div class="field"><label for="f-name">Your name <span class="req">(required)</span></label><input id="f-name" name="name" type="text" autocomplete="name" required></div>
        <div class="field"><label for="f-email">Your email <span class="req">(required)</span></label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
      </div>
      <div class="field"><label for="f-subject">Subject</label><input id="f-subject" name="subject" type="text"></div>
      <div class="field"><label for="f-msg">Message <span class="req">(required)</span></label><textarea id="f-msg" name="message" rows="7" required></textarea></div>
      <div class="form__send">
        <button class="btn btn--pink" type="submit">Send message ${arrow()}</button>
        <p class="form__status" role="status" aria-live="polite" data-status></p>
      </div>
    </form>
    <aside class="contact__side" aria-labelledby="channels-title">
      <h2 class="sub-title" id="channels-title">Or pick a channel</h2>
      <p class="contact__lede">Email is the one I check most.</p>
      <ul class="connect">
        <li><a class="connect__a" data-email href="#f-name"><span>Email</span><span class="connect__h" data-email-text>Use the form</span></a></li>
        ${channels.filter((c) => c.href).map((c) => html`<li><a class="connect__a" href="${c.href}" target="_blank" rel="noopener me"><span>${c.label}</span><span class="connect__h">${c.handle} ${arrow('out')}</span></a></li>`)}
      </ul>
      <p class="contact__note">Student inquiries welcome. Working on a science fair project, a TSA or HOSA event, or a first website and want a second set of eyes? Say so in the subject line.</p>
    </aside>
  </div>
</section>`;
  return layout(ctx, {
    title: 'Contact',
    description: 'Get in touch with Eshun Burge about collaborations, internships, competition teams and speaking.',
    current: 'contact',
    page: 'contact',
    footerCta: false,
    body,
  });
}

/* ── Links (kept: it is probably in a bio somewhere) ───────────────── */
export function links(ctx) {
  const body = html`
<section class="linkpage" aria-labelledby="links-title">
  <div class="linkpage__in">
    ${ctx.img('people/eshun-portrait-blazer', { alt: '', cls: 'linkpage__face', sizes: '120px', eager: true })}
    <h1 class="linkpage__title" id="links-title">Eshun Burge</h1>
    <p class="linkpage__quote">“${linksQuote}”</p>
    ${linkGroups.map((g) => html`<section class="linkpage__group" aria-labelledby="lg-${g.title.toLowerCase()}">
      <h2 class="linkpage__h" id="lg-${g.title.toLowerCase()}">${g.title}</h2>
      <ul>${g.links.map((l) => {
        const internal = l.href.startsWith('/');
        return html`<li><a class="linkpage__a" href="${internal ? ctx.url(l.href) : l.href}"${internal ? '' : raw(' target="_blank" rel="noopener me"')}><span class="linkpage__l">${l.label}</span><span class="linkpage__hd">${l.handle}</span>${arrow(internal ? 'right' : 'out')}</a></li>`;
      })}</ul>
    </section>`)}
  </div>
</section>`;
  return layout(ctx, { title: 'Links', description: 'Every place to find Eshun Burge online.', current: 'links', page: 'links', footerCta: false, body });
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
export function notFound(ctx) {
  return layout(ctx, {
    title: 'Page not found',
    page: 'notfound',
    noindex: true,
    body: html`<section class="nf tone-dark" aria-labelledby="nf-title">
      <div class="wrap">
        <p class="board__label">Error 404 · Not in service</p>
        <h1 class="board" id="nf-title" data-board>${board('Wrong platform')}</h1>
        <p class="phead__intro">This train doesn’t stop here. The page may have moved when the site was rebuilt. Every stop on the line is below.</p>
        <ol class="departures">
          ${nav.map((n, i) => html`<li><a class="departures__a" href="${ctx.url(n.href)}"><span class="departures__to">${n.label}</span><span class="departures__plat">Platform ${i + 1}</span>${arrow()}</a></li>`)}
        </ol>
      </div>
      <div class="skyline skyline--nf" aria-hidden="true"></div>
    </section>`,
  });
}
