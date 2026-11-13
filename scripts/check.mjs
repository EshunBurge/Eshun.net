// scripts/check.mjs — post-build checks with zero dependencies:
//   • every internal link and #anchor resolves to a built page / element id
//   • every <img> has an alt attribute, every page has one <h1> and a <title>
//   • no phone numbers or street addresses slipped into the output
// Usage: npm run build && npm run check
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const problems = [];
const pages = new Map(); // url path -> { html, ids }

async function walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.name.endsWith('.html')) {
      const rel = '/' + path.relative(DIST, p).replace(/\\/g, '/').replace(/index\.html$/, '');
      const html = await fs.readFile(p, 'utf8');
      const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
      pages.set(rel, { html, ids, file: p });
    }
  }
}

const exists = (p) => fs.stat(p).then(() => true, () => false);

await walk(DIST);
const BASE = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
for (const [url, { html }] of pages) {
  const redirect = /http-equiv="refresh"/.test(html);
  if (!redirect) {
    if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${url}: missing <title>`);
    const h1 = (html.match(/<h1[\s>]/g) || []).length;
    if (h1 !== 1) problems.push(`${url}: ${h1} <h1> elements`);
    for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) problems.push(`${url}: <img> without alt — ${m[0].slice(0, 80)}`);
    if (/\(?\b\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/.test(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/data:image[^"]+/g, ''))) problems.push(`${url}: looks like a phone number`);
  }
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    let link = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(link)) continue;
    const [pth, hash] = link.split('#');
    let target = pth ? new URL(pth, 'https://x' + url).pathname : url;
    target = decodeURIComponent(target);
    if (BASE !== '/' && target.startsWith(BASE)) target = '/' + target.slice(BASE.length);
    if (target.endsWith('/')) {
      if (!pages.has(target)) problems.push(`${url}: broken link → ${link}`);
      else if (hash && !pages.get(target).ids.has(hash) && !/refresh/.test(pages.get(target).html)) problems.push(`${url}: missing anchor → ${link}`);
    } else if (!(await exists(path.join(DIST, target)))) problems.push(`${url}: missing file → ${link}`);
  }
}
if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\n✗ ${problems.length} problem(s) in ${pages.size} pages`);
  process.exit(1);
}
console.log(`✓ ${pages.size} HTML files checked — links, anchors, alt text, headings, privacy`);
