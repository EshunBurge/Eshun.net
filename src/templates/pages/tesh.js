// src/templates/pages/tesh.js — /tesh/ : the company itself (its website and identity are projects of their own).
import { html } from '../lib.js';
import { layout } from '../layout.js';
import { pageHead, secHead, btn, pass, projectCard, coverArt, categoryTiles } from '../partials.js';
import { venture } from '../../data/about.js';
import { projectBySlug } from '../../data/projects.js';

export default function tesh(ctx) {
  const site = projectBySlug['tesh-technology'];
  const brand = projectBySlug['tesh-technology-brand'];
  const body = html`
${pageHead(ctx, {
    label: 'My company',
    title: venture.name,
    subtitle: venture.motto,
    intro: venture.text,
    actions: html`<p class="bhead__btns">${btn(ctx, { href: venture.href, label: 'Visit teshtechnology.com', kind: 'pink' })}</p>`,
    ticket: { img: coverArt(ctx, site, { priority: true }), scene: 'line', id: 'tesh', name: venture.name, count: 'Founder & Owner', label: 'My company' },
    visit: 'tesh',
  })}
<div class="wrap proj__pass">${pass([['Role', 'Founder & Owner'], ['Founded', 'August 2026'], ['Website', 'teshtechnology.com'], ['Motto', venture.motto]])}</div>

<section class="section" aria-labelledby="services-title">
  <div class="wrap">
    ${secHead({ id: 'services-title', title: 'What Tesh builds' })}
    <ul class="tesh__services tesh__services--page">
      ${venture.services.map((v) => html`<li class="service"><h3 class="service__title">${v.title}</h3><p class="service__text">${v.text}</p></li>`)}
    </ul>
  </div>
</section>

<section class="section section--alt" aria-labelledby="made-title">
  <div class="wrap">
    ${secHead({ id: 'made-title', title: 'Made for Tesh' })}
    <div class="cards cards--2">${[site, brand].map((p) => projectCard(ctx, p, { sizes: '(max-width: 760px) 92vw, 46vw' }))}</div>
  </div>
</section>

${categoryTiles(ctx, { heading: 'More of my work' })}`;
  return layout(ctx, {
    title: venture.name,
    description: `${venture.name}, the digital software firm founded by Eshun Burge: websites, custom software and AI automation.`,
    page: 'tesh',
    body,
  });
}
