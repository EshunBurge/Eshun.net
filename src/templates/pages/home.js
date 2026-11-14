// Home — the original home page's sections, in an order that reads from the top: who I am and
// the train at the platform in front of the city, a few numbers on a split-flap board, the four kinds of work as tickets, four
// projects, the research, a hello, leadership and awards, Tesh Technology, and the photo
// collections as tickets.
import { html, raw } from '../lib.js';
import { layout } from '../layout.js';
import { projectCard, categoryTiles, secHead, btn, ticket, arrow, board, city, figure } from '../partials.js';
import { bigTrain } from '../line-art.js';
import { stats } from '../../data/site.js';
import { projectBySlug } from '../../data/projects.js';
import { roles, organisations, awards } from '../../data/archive.js';
import { aspiration, venture, moments } from '../../data/about.js';
import { openSets, photoLinks } from '../../data/photos.js';
import { setsShown, framesIn, setHref, stopOf, setArt } from './fun.js';
import { when } from '../dates.js';

// What the home page shows from the longer lists (the rest lives on its own page).
const FEATURED = ['aflare', 'visit-shark-tooth-bay', 'verdurre', 'neuroassist'];
const NOW = [
  ['tsa', 'Florida TSA State Secretary, 2026–27'],
  ['tsa', 'Chapter Vice President, 2026–27'],
  ['nstem', 'Chapter Vice President, 2026–27'],
  ['nstem', 'National Student Advisory Council Board Member'],
  ['hosa', 'Chapter Founder & Co-President'],
  ['school', 'Varsity Swim Team Captain'],
];
const AWARDS = [
  'Office of Naval Research Science Award',
  'Recognition Award',
  'Conrad Challenge Innovator Award',
  '1st Place, Sunbeam Tampa Hackathon',
  '1st Place, Promotional Design|State',
  '1st Place, Website Design',
];

const orgName = Object.fromEntries(organisations.map((o) => [o.id, o.name]));

export default function home(ctx) {
  const featured = FEATURED.map((s) => projectBySlug[s]);
  const ml = projectBySlug['pediatric-diabetes-ml'];
  const now = NOW.map(([org, title]) => roles.find((r) => r.org === org && r.title === title));
  const honours = AWARDS.map((a) => {
    const [title, level] = a.split('|');
    return awards.find((x) => x.title === title && (!level || x.level === level));
  });
  // the collections with photographs, as tickets, and a pass for the whole line
  const stops = setsShown().slice(0, 3);

  const body = html`
<section class="hero tone-dark" aria-labelledby="hero-title">
  <div class="hero__stars" aria-hidden="true"></div>
  ${city('hero__city')}
  <div class="wrap hero__text">
    <h1 class="hero__title" id="hero-title">Eshun Burge</h1>
    <p class="hero__tagline">Engineering digital experiences.</p>
    <p class="hero__actions">
      <a class="btn btn--pink" href="#work">See my work ${arrow('down')}</a>
      <a class="btn" href="${ctx.url('/about/')}">About me ${arrow()}</a>
    </p>
  </div>
  <div class="hero__scene">
    <div class="guideway" aria-hidden="true"></div>
    <div class="hero__platform" aria-hidden="true"></div>
    <div class="bigtrain" data-train aria-hidden="true">
      <div class="bigtrain__move"><div class="bigtrain__pool"></div><div class="bigtrain__glow"></div>${raw(bigTrain())}<div class="bigtrain__stripe"><i></i></div><div class="bigtrain__beam"></div><div class="bigtrain__spot"></div></div>
    </div>
  </div>
</section>

<section class="stats" aria-label="At a glance">
  <div class="wrap">
    <ul class="stats__list">
      ${stats.map((s) => html`<li class="stat"><span class="stat__value board board--stat" data-board="view">${board(s.value)}</span> <span class="stat__label">${s.label}</span></li>`)}
    </ul>
  </div>
</section>

${categoryTiles(ctx, { heading: 'My work', id: 'work' })}

<section class="section section--alt" aria-labelledby="built-title">
  <div class="wrap">
    ${secHead({ id: 'built-title', title: 'Featured projects', link: { href: '/software-design/', label: 'All software' }, ctx })}
    <div class="cards cards--2">${featured.map((p) => projectCard(ctx, p, { sizes: '(max-width: 760px) 92vw, 46vw' }))}</div>
  </div>
</section>

<section class="section" aria-labelledby="research-title">
  <div class="wrap split split--flip">
    <div class="split__media split__media--flow">
      ${ctx.img('people/eshun-science-fair', { alt: 'Eshun beside a research poster at a science fair', sizes: '(max-width: 860px) 92vw, 46vw' })}
      ${ctx.img('people/eshun-research-poster', { alt: 'Eshun presenting a research poster on the science-fair floor', sizes: '(max-width: 860px) 92vw, 46vw' })}
    </div>
    <div class="split__text">
      <p class="kicker">Research</p>
      <h2 class="sec-title" id="research-title">${ml.title}</h2>
      <p class="split__lede">${ml.summary}</p>
      <ul class="ladder">
        ${ml.recognition.map((r) => html`<li><span class="ladder__level">${r.level}</span><span class="ladder__result">${r.result}</span></li>`)}
      </ul>
      <p class="split__actions">${btn(ctx, { href: `/${ml.slug}/`, label: 'Read about the research', kind: 'pink' })} ${btn(ctx, { href: '/science-projects/', label: 'All research' })}</p>
    </div>
  </div>
</section>

<section class="section section--alt" aria-labelledby="hi-title">
  <div class="wrap split">
    <div class="split__media split__media--flow">
      ${ctx.img('people/eshun-portrait-outdoor', { alt: 'Portrait of Eshun Burge outdoors, by a lake', sizes: '(max-width: 860px) 92vw, 46vw' })}
    </div>
    <div class="split__text">
      <h2 class="sec-title" id="hi-title">Hi, I’m Eshun.</h2>
      <div class="prose">
        <p>I’m an International Baccalaureate Diploma Programme student, and I’m interested in computer science, engineering and technology. Through middle and high school my experience has centered on STEM, through leadership, competition and research, with the Technology Student Association, HOSA–Future Health Professionals, the National STEM Honor Society and varsity swimming.</p>
        <p>Through my school’s Research Program I conduct independent STEM research and compete in science and engineering fairs. My research has advanced to the State Science and Engineering Fair and received state-level recognition.</p>
      </div>
      <blockquote class="aspire"><p>${aspiration}</p></blockquote>
      <p class="split__actions">${btn(ctx, { href: '/about/', label: 'More about me' })}</p>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="lead-title">
  <div class="wrap">
    ${secHead({ id: 'lead-title', title: 'Leadership & awards', link: { href: '/about/#moments', label: 'More pictures' }, ctx })}
    <div class="moments moments--strip lead-photos">${moments.slice(0, 3).map((m) => figure(ctx, m.key, { caption: m.caption, sizes: '(max-width: 760px) 92vw, 380px', viewer: 'lead', cls: 'moment', style: `--r:${ctx.ratio(m.key).toFixed(3)}` }))}</div>
    <div class="duo-lists">
      <div class="duo-lists__col">
        <div class="list-head"><h3 class="list-head__title">Leadership now</h3><a class="more" href="${ctx.url('/about/#experience')}">All experience ${arrow()}</a></div>
        <ul class="rows">
          ${now.map((r) => html`<li class="row"><span class="row__title">${r.title}</span><span class="row__meta">${orgName[r.org]} · ${when(r)}</span></li>`)}
        </ul>
      </div>
      <div class="duo-lists__col">
        <div class="list-head"><h3 class="list-head__title">Selected awards</h3><a class="more" href="${ctx.url('/about/#awards')}">All awards ${arrow()}</a></div>
        <ul class="rows">
          ${honours.map((a) => html`<li class="row"><span class="row__title">${a.title}</span><span class="row__meta">${a.org} · ${a.level} · ${a.year}</span></li>`)}
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt tesh tone-dark" aria-labelledby="tesh-title">
  <div class="wrap tesh__grid">
    <div class="tesh__copy">
      <p class="kicker">My company</p>
      <h2 class="tesh__title" id="tesh-title">${venture.name}</h2>
      <p class="tesh__motto">${venture.motto}</p>
      <p class="tesh__lede">${venture.text}</p>
      <p class="tesh__role">${venture.role}</p>
      <p class="split__actions">${btn(ctx, { href: venture.href, label: 'Visit teshtechnology.com', kind: 'pink' })} ${btn(ctx, { href: '/tesh/', label: 'About Tesh Technology' })}</p>
    </div>
    <div class="tesh__art" aria-hidden="true">
      <span class="tesh__win"><span class="cover__bar"><i></i><i></i><i></i></span>${ctx.img('work/tesh-technology/home', { alt: '', sizes: '(max-width: 860px) 92vw, 640px' })}</span>
      <span class="tesh__phone">${ctx.img('work/tesh-technology/mobile-home', { alt: '', sizes: '200px' })}</span>
    </div>
  </div>
  <div class="wrap">
    <ul class="tesh__services">
      ${venture.services.map((v) => html`<li class="service"><h3 class="service__title">${v.title}</h3><p class="service__text">${v.text}</p></li>`)}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="lens-title">
  <div class="wrap">
    ${secHead({ id: 'lens-title', title: 'Photography', link: { href: '/just-for-fun/', label: 'Just for Fun' }, ctx })}
    <ul class="tickets tickets--4">
      ${stops.map((st) => html`<li>${ticket(ctx, { href: ctx.url(setHref(st)), scene: st.id, img: setArt(ctx, st), name: st.name, count: `${framesIn(st).length} ${framesIn(st).length === 1 ? 'photo' : 'photos'}`, label: stopOf(st) })}</li>`)}
      <li>${ticket(ctx, { href: ctx.url('/just-for-fun/#collections'), scene: 'line', id: 'all', img: raw('<span class="mystery-q mystery-q--word" aria-hidden="true">All</span>'), name: 'Every stop', count: `All ${openSets.length} collections`, label: 'All stops' })}</li>
    </ul>
    <p class="lens__links">${btn(ctx, { href: photoLinks[0].href, label: 'Instagram' })} ${btn(ctx, { href: photoLinks[1].href, label: 'VSCO' })}</p>
  </div>
</section>`;

  return layout(ctx, { title: '', current: 'home', page: 'home', body });
}
