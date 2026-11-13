// src/data/site.js — site-wide settings, the menu, the four kinds of work, channels.
// Everything factual here comes from the previous eshun.net, its LinkedIn-sourced
// timeline, Eshun's résumé and CV, or project READMEs. Edit freely — the build picks it up.

export const site = {
  name: 'Eshun Burge',
  url: 'https://eshun.net',
  title: 'Eshun Burge — Engineering Digital Experiences',
  tagline: 'Engineering digital experiences.',
  description:
    'Eshun Burge builds software, researches fairness in machine learning, designs for print and photographs architecture and travel. Projects, research, design, photography and contact.',
  region: 'Florida, USA',
  // Email is assembled in the browser to keep it away from scrapers.
  email: { user: 'eshunburge', domain: 'gmail.com' },
  // Existing Formspree endpoint from the old contact page.
  formAction: 'https://formspree.io/f/xaewjpow',
  // Résumé / CV: links appear automatically once these files exist in public/docs/.
  documents: [
    { label: 'Résumé', file: 'docs/BurgeEshunResume.pdf' },
    { label: 'CV', file: 'docs/BurgeEshunCV.pdf' },
  ],
};

// The menu, exactly as the original site had it.
export const nav = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'software', label: 'Software Design', href: '/software-design/' },
  { id: 'design', label: 'Graphic Design', href: '/graphic-design/' },
  { id: 'research', label: 'Research', href: '/science-projects/' },
  { id: 'fun', label: 'Just for Fun', href: '/just-for-fun/' },
  { id: 'about', label: 'About Me', href: '/about/' },
  { id: 'links', label: 'Links', href: '/links/' },
  { id: 'contact', label: 'Contact', href: '/contact/' },
];
export const navById = Object.fromEntries(nav.map((n) => [n.id, n]));

// The four kinds of work. `filters` group a category's projects by their `kind`; `cover` is the
// picture on its tile and `focus` positions it there.
export const categories = [
  {
    id: 'software', label: 'Software Design', href: '/software-design/', discipline: 'software',
    intro: 'Websites, software and apps I’ve built over the past few years, each one designed and coded start to finish.',
    short: 'Websites, web apps and tools, designed and coded start to finish.',
    cover: 'work/greenerpick/categories', focus: '50% 0%',
    filters: [['Website development', 'Websites'], ['Software development', 'Software'], ['App development', 'Apps']],
  },
  {
    id: 'design', label: 'Graphic Design', href: '/graphic-design/', discipline: 'design',
    intro: 'Branding packages, event identities and printed marketing I’ve designed over the past few years, most of it for competition or for a real event.',
    short: 'Branding, event identities and print.',
    cover: 'print/fl-tsa-competition/informer-cover', focus: '50% 0%',
    filters: [['Branding package', 'Branding'], ['Event branding', 'Event branding'], ['Physical marketing', 'Print & campaign']],
  },
  {
    id: 'research', label: 'Research', href: '/science-projects/', discipline: 'research',
    intro: 'Research and experiments I’ve conducted over the past few years, from machine-learning fairness studies to work at the lab bench, with the posters and papers.',
    short: 'Machine-learning fairness, health and the lab bench.',
    cover: 'research/ped-poster', focus: '50% 30%',
    filters: [],
  },
  {
    id: 'fun', label: 'Just for Fun', href: '/just-for-fun/', discipline: 'fun',
    intro: 'The work with no deadline attached: photography from travel and competition.',
    short: 'Photography from travel and competition.',
    cover: 'photo/prague', focus: '50% 40%',
    filters: [],
  },
];
export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

// The numbers on the original home page, in Eshun's words.
export const stats = [
  { value: '15+', label: 'Projects' },
  { value: '10+', label: 'National awards' },
  { value: '2×', label: 'State officer' },
  { value: '14+', label: 'Leadership roles' },
];

export const channels = [
  { id: 'email', label: 'Email', handle: 'eshunburge@gmail.com', note: 'Fastest route' },
  { id: 'linkedin', label: 'LinkedIn', handle: '/in/eshunburge', href: 'https://www.linkedin.com/in/eshunburge' },
  { id: 'github', label: 'GitHub', handle: '@EshunBurge', href: 'https://github.com/EshunBurge' },
  { id: 'instagram', label: 'Instagram', handle: '@eshunburge', href: 'https://www.instagram.com/eshunburge' },
  { id: 'photo', label: 'Prof-eshun-al Photography', handle: '@profeshunal.photography', href: 'https://www.instagram.com/profeshunal.photography/' },
];

// The /links/ page (kept because it is likely linked from social bios).
export const linkGroups = [
  {
    title: 'Work',
    links: [
      { label: 'Personal portfolio', handle: 'eshun.net', href: '/' },
      { label: 'GitHub', handle: '@EshunBurge', href: 'https://github.com/EshunBurge' },
      { label: 'LinkedIn', handle: '/in/eshunburge', href: 'https://www.linkedin.com/in/eshunburge' },
    ],
  },
  {
    title: 'Creative',
    links: [
      { label: 'Prof-eshun-al Photography', handle: '@profeshunal.photography', href: 'https://www.instagram.com/profeshunal.photography/' },
      { label: 'VSCO', handle: 'Prof-eshun-al Pictures', href: 'https://vsco.co/eshunburge/' },
      { label: 'VSCO site', handle: 'eshunburge.vsco.site', href: 'https://eshunburge.vsco.site/' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'Instagram', handle: '@eshunburge', href: 'https://www.instagram.com/eshunburge' },
      { label: 'TikTok', handle: '@eshunburge', href: 'https://www.tiktok.com/@eshunburge' },
      { label: 'YouTube', handle: '@eshunburge', href: 'https://www.youtube.com/@eshunburge' },
      { label: 'Pinterest', handle: '@eshunburge', href: 'https://www.pinterest.com/eshunburge' },
    ],
  },
];

export const linksQuote = 'everyone is different, that means anyone can fit in';
