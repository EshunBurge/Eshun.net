// src/templates/routes.js — every page the build writes, plus redirects for old URLs.
// The pages and their URLs are the original eshun.net's: the eight menu pages, a page per
// project (the CAD model included), a page per photo collection, and the three live-demo pages.
import home from './pages/home.js';
import category from './pages/category.js';
import project from './pages/project.js';
import about from './pages/about.js';
import { fun, photoSet } from './pages/fun.js';
import { contact, links, demo, notFound } from './pages/misc.js';
import { projects } from '../data/projects.js';
import { sets } from '../data/photos.js';

export const routes = [
  { path: '/', render: home },
  { path: '/software-design/', render: category('software') },
  { path: '/graphic-design/', render: category('design') },
  { path: '/science-projects/', render: category('research') },
  { path: '/just-for-fun/', render: fun },
  { path: '/about/', render: about },
  { path: '/links/', render: links },
  { path: '/contact/', render: contact },
  ...projects.filter((p) => p.layout).map((p) => ({ path: `/${p.slug}/`, render: project(p) })),
  ...sets.map((s) => ({ path: `/photography-${s.id}/`, render: photoSet(s) })),
  // live demos from the original site, at the same (sic) URLs so existing links keep working
  { path: '/neruoassistdemo/', noindex: true, render: demo({ title: 'NeuroAssist', src: 'https://eshunburge.github.io/Project.NeuroAssist/', back: '/neuroassist/', backLabel: 'NeuroAssist', allow: 'microphone' }) },
  { path: '/ecomatchdemo/', noindex: true, render: demo({ title: 'EcoMatch', src: 'https://eshunburge.github.io/Project.EcoMatch/', back: '/ecomatch/', backLabel: 'EcoMatch' }) },
  { path: '/rambleventuresmarketingdemo/', noindex: true, render: demo({ title: 'Ramble Ventures Marketing Dashboard', src: 'https://eshunburge.github.io/ramble-ventures-marketing/', back: '/ramble-ventures-marketing/', backLabel: 'Ramble Ventures Marketing Dashboard' }) },
  { path: '/404/', file: '404.html', noindex: true, render: notFound },
];

// Old URLs that pointed at duplicate or retired pages → where that content lives now
// (written as small static redirect pages).
export const redirects = {
  '/photography/': '/just-for-fun/',
  '/photography-italy-2/': '/photography-italy/',
  '/photography-tsa/': '/photography-other/',
  '/machine-learning/': '/pediatric-diabetes-ml/',
  '/featured-projects/': '/software-design/',
  '/software-projects/': '/software-design/',
  '/web-development/': '/software-design/',
  '/design/': '/graphic-design/',
  '/fl-tsa-conference/': '/fl-tsa-competition/',
  '/experience/': '/about/#experience',
  '/oldhome/': '/',
  '/698-2/': '/about/',
  // pages from earlier versions of this redesign
  '/work/': '/software-design/',
  '/leadership/': '/about/#experience',
  '/archive/': '/about/#experience',
};
