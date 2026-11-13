// src/templates/layout.js — the document shell shared by every page: one menu bar with the
// original site's eight pages, a menu button on phones, and a plain footer.
import { html, raw, arrow } from './lib.js';
import { site, nav, channels } from '../data/site.js';
import { miniTrainSvg } from './tickets.js';

const FONTS = ['fonts/archivo.woff2'];

// Runs before anything else on every page. Besides marking that JavaScript is on, it makes a
// page opened from a link start at its top (or at its #anchor) even when the frame showing the
// site (a preview, an embed) puts the previous page's scroll position back. It lets go as soon
// as the reader scrolls, taps, clicks or types, and a few seconds after the page has loaded.
const INLINE = `(function(){var d=document.documentElement;d.classList.add('js');
try{var n=performance.getEntriesByType('navigation')[0];if(n&&n.type!=='navigate')return}catch(e){}
var end=Date.now()+4000,off=false,ev=['wheel','touchstart','keydown','pointerdown','mousedown'];
function stop(){if(off)return;off=true;ev.forEach(function(t){removeEventListener(t,stop,true)});removeEventListener('scroll',fix)}
function fix(){if(off)return;if(Date.now()>end)return stop();var y=0,h=location.hash.slice(1),el=null;
if(h){try{el=document.getElementById(decodeURIComponent(h))}catch(e){}}
if(el)y=Math.max(0,el.getBoundingClientRect().top+scrollY-(parseFloat(getComputedStyle(d).scrollPaddingTop)||0));
if(Math.abs(scrollY-y)>2)scrollTo(0,y)}
ev.forEach(function(t){addEventListener(t,stop,{capture:true,passive:true})});
addEventListener('scroll',fix);addEventListener('DOMContentLoaded',fix);
addEventListener('load',function(){fix();end=Date.now()+2500})})();`;

/** The résumé and CV, once the PDFs are in public/docs/ (the build drops missing files). */
export const documents = () => site.documents;

/** <head> + body chrome around page content. */
export function layout(ctx, o) {
  const {
    title,                 // page title (without site name)
    description = site.description,
    current = null,        // menu id of this page (or of the section it belongs to)
    page = 'page',         // data-page key (drives JS modules)
    body,                  // main content (Raw)
    ogImage = 'people/eshun-portrait-outdoor',
    canonical = ctx.pagePath,
    noindex = false,
    headExtra = '',
    footerCta = true,      // the "let's build something" band above the footer
  } = o;
  const fullTitle = title ? `${title} — Eshun Burge` : site.title;
  const canonicalUrl = site.url + canonical;
  const og = ctx.info(ogImage) ? site.url + '/img/' + ogImage + '-1600.webp' : '';

  return html`<!doctype html>
<html lang="en" data-page="${page}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${fullTitle}</title>
<meta name="description" content="${description}">
${noindex ? raw('<meta name="robots" content="noindex">') : ''}
<link rel="canonical" href="${canonicalUrl}">
<meta name="theme-color" content="#1a1a1d">
<meta name="color-scheme" content="light">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Eshun Burge">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:image" content="${og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${ctx.asset('favicon.svg')}" type="image/svg+xml">
<link rel="icon" href="${ctx.asset('favicon-32.png')}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${ctx.asset('apple-touch-icon.png')}">
${FONTS.map((f) => html`<link rel="preload" href="${ctx.asset(f)}" as="font" type="font/woff2" crossorigin>`)}
<link rel="stylesheet" href="${ctx.asset('assets/site.css')}?v=${ctx.version}">
<script>${raw(INLINE)}</script>
<script type="module" src="${ctx.asset('assets/js/main.js')}?v=${ctx.version}"></script>
${headExtra}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${header(ctx, current)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(ctx, current, footerCta)}
</body>
</html>
`;
}

function header(ctx, current) {
  const links = (cls) => nav.map((n) => html`<li><a class="${cls}${n.id === 'contact' ? ` ${cls}--contact` : ''}" href="${ctx.url(n.href)}"${n.id === current ? raw(' aria-current="page"') : ''}>${n.label}</a></li>`);
  return html`<header class="hdr tone-dark" id="top">
  <div class="hdr__rail" aria-hidden="true"><span class="hdr__train"></span></div>
  <div class="hdr__in">
    <a class="hdr__brand" href="${ctx.url('/')}">Eshun Burge</a>
    <nav class="hdr__nav" aria-label="Main">
      <ul class="hdr__list">${links('hdr__link')}</ul>
    </nav>
    <details class="mnu" data-menu>
      <summary class="mnu__btn"><span class="mnu__bars" aria-hidden="true"><i></i><i></i></span><span class="mnu__open">Menu</span><span class="mnu__shut">Close</span></summary>
      <div class="mnu__panel">
        <nav aria-label="Menu">
          <ul class="mnu__list">${nav.map((n) => html`<li><a class="mnu__link" href="${ctx.url(n.href)}"${n.id === current ? raw(' aria-current="page"') : ''}>${n.label}${n.id === current ? raw('<span class="mnu__here" aria-hidden="true">You are here</span>') : arrow()}</a></li>`)}</ul>
        </nav>
        <p class="mnu__foot">${documents().map((d) => html`<a class="btn" href="${ctx.asset(d.file)}">${d.label} (PDF)</a>`)}<a class="btn" data-email href="${ctx.url('/contact/')}"><span data-email-text>Email me</span></a></p>
      </div>
    </details>
  </div>
</header>`;
}

function footer(ctx, current, cta) {
  const docs = documents();
  return html`${cta ? html`<section class="cta" aria-labelledby="cta-title">
  <div class="wrap">
    <div class="cta__in">
      <div class="cta__copy">
        <h2 class="cta__title" id="cta-title">Let’s build something.</h2>
        <p class="cta__text">Collaborations, internships, competition teams and speaking, or a question about something on this site.</p>
      </div>
      <p class="cta__actions">
        <a class="btn btn--pink" href="${ctx.url('/contact/')}">Contact me ${arrow()}</a>
        <a class="btn" data-email href="${ctx.url('/contact/')}"><span data-email-text>Email</span></a>
      </p>
    </div>
  </div>
</section>` : ''}
<footer class="ftr tone-dark" id="footer">
  <div class="wrap ftr__in">
    <div class="ftr__about">
      <a class="ftr__brand" href="${ctx.url('/')}">Eshun Burge</a>
      <p class="ftr__line">${site.tagline} ${site.region}.</p>
      ${docs.length ? html`<p class="ftr__docs">${docs.map((d) => html`<a href="${ctx.asset(d.file)}">${d.label} (PDF)</a>`)}</p>` : ''}
    </div>
    <nav class="ftr__nav" aria-label="Footer">
      <h2 class="ftr__h">Pages</h2>
      <ul>${nav.map((n) => html`<li><a href="${ctx.url(n.href)}"${n.id === current ? raw(' aria-current="page"') : ''}>${n.label}</a></li>`)}</ul>
    </nav>
    <div>
    <h2 class="ftr__h" id="ftr-elsewhere">Elsewhere</h2>
    <ul class="ftr__social" aria-labelledby="ftr-elsewhere">
      ${channels.filter((c) => c.href).map((c) => html`<li><a href="${c.href}" rel="me noopener" target="_blank">${c.label} ${arrow('out')}</a></li>`)}
    </ul>
    </div>
  </div>
  <div class="wrap ftr__bottom">
    <p class="ftr__copy">© 2026 Eshun Burge · ${site.region}</p>
    <a class="ftr__top" href="#top" data-top>Back to top ${arrow('up')}</a>
  </div>
  <template data-express-train>${raw(miniTrainSvg('express', { night: true }))}</template>
</footer>`;
}
