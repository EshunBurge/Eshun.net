// The three project categories from the original menu: Software Design, Graphic Design and
// Research. Each lists its projects as cards (with filters when there are kinds to filter
// by), then what goes with that kind of work: the awards it has won, the tools, and for research
// the questions behind it and the science-fair record.
import { html } from '../lib.js';
import { layout } from '../layout.js';
import { pageHead, projectCard, filters, categoryTiles, secHead, facts, platformOf } from '../partials.js';
import { categoryById } from '../../data/site.js';
import { byDiscipline } from '../../data/projects.js';
import { awards, roles, scienceFair, tools } from '../../data/archive.js';
import { researchInterest } from '../../data/about.js';

// One award as a row: year, what it was and who gave it, and the level.
const honour = (ctx) => (a) => html`<li class="honour"><span class="honour__year">${a.year}</span><span class="honour__body"><span class="honour__title">${a.href ? html`<a href="${ctx.url(a.href)}">${a.title}</a>` : a.title}</span><span class="honour__org">${a.org}</span></span><span class="honour__level">${a.level}</span></li>`;
const toolList = (items) => html`<ul class="tools">${items.map((t) => html`<li>${t}</li>`)}</ul>`;

/** What follows the project cards on each category page. */
const EXTRAS = {
  software: (ctx) => {
    const won = awards.filter((a) => /Website Design|Webmaster|Software Development|Hackathon/.test(a.title));
    const programming = tools.find((g) => g.group === 'Programming').items;
    return html`<section class="section section--alt" aria-labelledby="rec-title">
  <div class="wrap">
    ${secHead({ id: 'rec-title', title: 'Awards' })}
    <ul class="honours honours--table">${won.map(honour(ctx))}</ul>
    <h3 class="sub-title">Languages & tools</h3>
    ${toolList([...programming, 'React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Leaflet', 'Firebase'])}
  </div>
</section>`;
  },
  design: (ctx) => {
    const won = awards.filter((a) => /Promotional Design/.test(a.title));
    const design = tools.find((g) => g.group === 'Design').items;
    return html`<section class="section section--alt" aria-labelledby="rec-title">
  <div class="wrap">
    ${secHead({ id: 'rec-title', title: 'Awards' })}
    <ul class="honours honours--table">
      ${won.map(honour(ctx))}
    </ul>
    <h3 class="sub-title">Tools</h3>
    ${toolList(design)}
  </div>
</section>`;
  },
  research: () => html`<section class="section section--alt" aria-labelledby="interest-title">
  <div class="wrap interest">
    <div>
      ${secHead({ id: 'interest-title', title: 'What I want to research' })}
      <p class="interest__title">${researchInterest.title}</p>
      <ul class="ticks interest__areas">${researchInterest.areas.map((t) => html`<li>${t}</li>`)}</ul>
    </div>
    <div class="prose interest__why">${researchInterest.why.map((t) => html`<p>${t}</p>`)}</div>
  </div>
</section>
<section class="section" aria-labelledby="fair-title">
  <div class="wrap">
    ${secHead({ id: 'fair-title', title: 'Science fair record' })}
    <div class="fairs">${scienceFair.map((s) => html`<div class="fair">
      <h3 class="records__h">${s.season}</h3>
      ${facts([['School', s.school], ['Regional', s.regional], ['State', s.state]])}
    </div>`)}</div>
  </div>
</section>`,
};

export default function category(id) {
  const cat = categoryById[id];
  const list = byDiscipline(cat.discipline);
  return (ctx) => {
    const n = list.length;
    const body = html`
${pageHead(ctx, {
    platform: platformOf(cat.id),
    title: cat.label,
    intro: cat.intro,
    meta: `${n} ${n === 1 ? 'project' : 'projects'}`,
    ticket: { scene: cat.id, id: cat.id, name: cat.label, count: `${n} ${n === 1 ? 'project' : 'projects'}`, label: `Platform ${platformOf(cat.id)}` },
    visit: cat.id,
  })}
<section class="section section--first" aria-labelledby="list-title">
  <div class="wrap">
    <h2 class="visually-hidden" id="list-title">${cat.label} projects</h2>
    ${filters(list, cat)}
    <div class="cards cards--2" data-filter-grid>${list.map((p, i) => projectCard(ctx, p, { eager: i < 2 }))}</div>
  </div>
</section>
${EXTRAS[id] ? EXTRAS[id](ctx) : ''}
${categoryTiles(ctx, { except: id })}`;

    return layout(ctx, {
      title: cat.label,
      description: `${cat.label} by Eshun Burge. ${cat.intro}`,
      current: id,
      page: 'category',
      ogImage: cat.cover,
      body,
    });
  };
}
