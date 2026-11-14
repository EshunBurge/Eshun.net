// About Me — the story, then the full record: experience, awards, skills, résumé and CV.
import { html } from '../lib.js';
import { layout } from '../layout.js';
import { pageHead, secHead, categoryTiles, facts, arrow, platformOf, figure } from '../partials.js';
import { about, aspiration, education, moments, strips } from '../../data/about.js';
import { organisations, roles, awards, tsaRecord, scienceFair, otherHonours, toolkit, tools } from '../../data/archive.js';
import { channels } from '../../data/site.js';
import { when } from '../dates.js';

// Organisations in the order they're listed (the biggest commitments first).
const ORG_ORDER = ['tsa', 'tesh', 'school', 'nstem', 'hosa', 'swe', 'chamber', 'manatee', 'gwc', 'racing', 'piano'];
const SECTIONS = [
  ['story', 'My story'],
  ['education', 'Education'],
  ['experience', 'Experience'],
  ['moments', 'In pictures'],
  ['awards', 'Awards'],
  ['skills', 'Skills'],
  ['resume', 'Résumé & CV'],
];

/** A strip of pictures of me between sections: opens in the viewer, nothing written under them. */
const strip = (ctx, list, group) => html`<div class="moments moments--strip" style="--n:${list.length}">${list.map((m) => figure(ctx, m.key, { caption: m.caption, sizes: '(max-width: 760px) 92vw, 380px', viewer: group, cls: 'moment' }))}</div>`;

export default function aboutPage(ctx) {
  const docs = ctx.site.documents;
  const byOrg = ORG_ORDER.map((id) => ({ org: organisations.find((o) => o.id === id), list: roles.filter((r) => r.org === id) })).filter((g) => g.list.length);

  const roleLink = (r) => {
    if (!r.href) return '';
    if (/^https?:/.test(r.href)) return html`<a class="more" href="${r.href}" target="_blank" rel="noopener">${r.href.replace(/^https?:\/\/|\/$/g, '')} ${arrow('out')}</a>`;
    return html`<a class="more" href="${ctx.url(r.href)}">${r.href === '/southeast-nstem/' ? 'See the chapter website' : 'See my science projects'} ${arrow()}</a>`;
  };

  const body = html`
${pageHead(ctx, {
    platform: platformOf('about'),
    title: 'About me',
    intro: about.standfirst,
    ticket: { scene: 'cute1', id: 'about', name: 'Eshun Burge', count: 'About me', label: `Platform ${platformOf('about')}` },
    visit: 'about',
  })}
<nav class="subnav" aria-label="On this page">
  <div class="wrap"><ul class="subnav__list">${SECTIONS.map(([id, label]) => html`<li><a class="subnav__a" href="#${id}">${label}</a></li>`)}</ul></div>
</nav>

<section class="section section--first" id="story" aria-labelledby="story-title">
  <div class="wrap split split--solo">
    <div class="split__media split__media--solo">
      ${ctx.img('people/eshun-portrait-outdoor', { alt: 'Portrait of Eshun Burge outdoors, by a lake', sizes: '(max-width: 860px) 92vw, 34vw', priority: true, style: 'object-position:50% 30%' })}
    </div>
    <div class="split__text">
      <h2 class="sec-title" id="story-title">Hi, I’m Eshun.</h2>
      <div class="prose">${about.paragraphs.map((p) => html`<p>${p}</p>`)}</div>
      <blockquote class="aspire"><p>${aspiration}</p></blockquote>
      <h3 class="sub-title">Currently</h3>
      ${facts(about.currently.map((r) => [r.label, r.value]), 'facts--wide')}
    </div>
  </div>
</section>

<section class="section section--alt" id="education" aria-labelledby="education-title">
  <div class="wrap">
    ${secHead({ id: 'education-title', title: 'Education' })}
    <div class="school">
      <div class="school__card">
        <h3 class="school__name">${education.school}</h3>
        <p class="school__prog">${education.programme}</p>
        <p class="school__when">${education.years} · ${education.grade}</p>
        <ul class="school__gpa">${education.gpa.map((g) => html`<li><span class="school__value">${g.value}</span><span class="school__label">${g.label}</span></li>`)}</ul>
      </div>
      <div class="school__courses">${education.courses.map((c) => html`<div><h3 class="records__h">${c.group}</h3><ul class="skills__list">${c.items.map((t) => html`<li>${t}</li>`)}</ul></div>`)}</div>
    </div>
    ${strip(ctx, strips.education, 'edu')}
  </div>
</section>

<section class="section" id="experience" aria-labelledby="experience-title">
  <div class="wrap">
    ${secHead({ id: 'experience-title', title: 'Experience & leadership' })}
    ${strip(ctx, strips.experience, 'exp')}
    <div class="orgs">
      ${byOrg.map(({ org, list }) => html`<section class="org" aria-labelledby="org-${org.id}">
        <div class="org__head"><h3 class="org__name" id="org-${org.id}">${org.name}</h3><p class="org__since">Since ${org.since}</p></div>
        <ol class="org__roles">${list.map((r) => html`<li class="xp">
          <h4 class="xp__title">${r.title}</h4>
          <p class="xp__when">${when(r)}</p>
          <p class="xp__text">${r.text}</p>
          ${r.notes?.length ? html`<ul class="xp__notes">${r.notes.map((n) => html`<li>${n}</li>`)}</ul>` : ''}
          ${roleLink(r)}
        </li>`)}</ol>
      </section>`)}
    </div>
  </div>
</section>

<section class="section section--alt" id="moments" aria-labelledby="moments-title">
  <div class="wrap">
    ${secHead({ id: 'moments-title', title: 'In pictures' })}
    <div class="moments">${moments.map((m) => figure(ctx, m.key, { caption: m.caption, sizes: '(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 380px', viewer: 'moments', cls: 'moment' }))}</div>
  </div>
</section>

<section class="section" id="awards" aria-labelledby="awards-title">
  <div class="wrap">
    ${secHead({ id: 'awards-title', title: 'Awards' })}
    ${strip(ctx, strips.awards, 'awd')}
    <ul class="honours honours--table">
      ${awards.map((a) => html`<li class="honour"><span class="honour__year">${a.year}</span><span class="honour__body"><span class="honour__title">${a.href ? html`<a href="${ctx.url(a.href)}">${a.title}</a>` : a.title}</span><span class="honour__org">${a.org}</span></span><span class="honour__level">${a.level}</span></li>`)}
    </ul>

    <div class="records">
      <section class="records__block" aria-labelledby="tsa-title">
        <h3 class="sub-title" id="tsa-title">TSA competition record</h3>
        <p class="bignum"><span class="bignum__value">${tsaRecord.total}</span><span class="bignum__label">${tsaRecord.totalNote}</span></p>
        <div class="records__cols">
          <div><h4 class="records__h">High school</h4><ul class="ticks">${tsaRecord.high.map((t) => html`<li>${t}</li>`)}</ul></div>
          <div><h4 class="records__h">Middle school</h4><ul class="ticks">${tsaRecord.middle.map((t) => html`<li>${t}</li>`)}</ul></div>
        </div>
      </section>
      <section class="records__block" aria-labelledby="fair-title">
        <h3 class="sub-title" id="fair-title">Science and engineering fairs</h3>
        <div class="fairs">${scienceFair.map((s) => html`<div class="fair">
          <h4 class="records__h">${s.season}</h4>
          ${facts([['School', s.school], ['Regional', s.regional], ['State', s.state]])}
        </div>`)}</div>
      </section>
      <section class="records__block" aria-labelledby="other-title">
        <h3 class="sub-title" id="other-title">Also</h3>
        <div class="records__cols records__cols--3">${otherHonours.map((g) => html`<div><h4 class="records__h">${g.group}</h4><ul class="ticks">${g.items.map((t) => html`<li>${t}</li>`)}</ul></div>`)}</div>
      </section>
    </div>
  </div>
</section>

<section class="section section--alt" id="skills" aria-labelledby="skills-title">
  <div class="wrap">
    ${secHead({ id: 'skills-title', title: 'Skills' })}
    <div class="kit">${tools.map((g) => html`<div class="kit__tools"><h3 class="records__h">${g.group}</h3><ul class="tools">${g.items.map((t) => html`<li>${t}</li>`)}</ul></div>`)}</div>
    <div class="skills skills--home">${toolkit.map((g) => html`<div class="skills__group"><h3 class="records__h">${g.group}</h3><ul class="skills__list">${g.items.map((t) => html`<li>${t}</li>`)}</ul></div>`)}</div>
  </div>
</section>

<section class="section" id="resume" aria-labelledby="resume-title">
  <div class="wrap resume">
    <div>
      ${secHead({ id: 'resume-title', title: 'Résumé & CV' })}
      <p class="resume__docs">${docs.length
        ? docs.map((d, i) => html`<a class="btn${i === 0 ? ' btn--pink' : ''}" href="${ctx.asset(d.file)}">${d.label} (PDF) ${arrow()}</a>`)
        : html`<span class="muted">My résumé is available on request.</span>`}</p>
    </div>
    <div>
      <h3 class="sub-title" id="connect-title">Connect</h3>
      <ul class="connect" aria-labelledby="connect-title">
        <li><a class="connect__a" data-email href="${ctx.url('/contact/')}"><span>Email</span><span class="connect__h" data-email-text>Contact form</span></a></li>
        ${channels.filter((c) => ['linkedin', 'github'].includes(c.id)).map((c) => html`<li><a class="connect__a" href="${c.href}" target="_blank" rel="noopener me"><span>${c.label}</span><span class="connect__h">${c.handle} ${arrow('out')}</span></a></li>`)}
        <li><a class="connect__a" href="${ctx.url('/links/')}"><span>Everything else</span><span class="connect__h">All links ${arrow()}</span></a></li>
      </ul>
    </div>
  </div>
</section>

${categoryTiles(ctx, { heading: 'My work', id: 'what' })}`;

  return layout(ctx, {
    title: 'About me',
    description: 'About Eshun Burge: IB student, Florida TSA State Secretary and founder of Tesh Technology. Experience, awards, skills, résumé and CV.',
    current: 'about',
    page: 'about',
    ogImage: 'people/eshun-portrait-blazer',
    body,
  });
}
