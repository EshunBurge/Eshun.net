// scripts/build.mjs — zero-dependency static site build.
//
//   node scripts/build.mjs                 → dist/ (root-relative URLs, for eshun.net)
//   node scripts/build.mjs --base=/repo/   → dist/ for a GitHub Pages project URL
//   node scripts/build.mjs --relative --out=preview
//                                          → portable copy that works from any folder
//
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v ?? true];
}));
const OUT = path.join(ROOT, args.out || 'dist');
const BASE = (args.base || process.env.BASE_PATH || '/').replace(/\/?$/, '/');
const PREVIEW = !!args.preview;           // portable preview: relative URLs, fewer image sizes, no redirects
const RELATIVE = !!args.relative || PREVIEW;
const WIDTHS = PREVIEW ? [960, 1600] : null;
const t0 = Date.now();

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  for (const e of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else if (e.name !== '.DS_Store' && e.name !== 'README.md' && e.name !== 'manifest.json') await fs.copyFile(s, d);
  }
}

async function readAll(dir, ext) {
  const out = [];
  for (const e of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await readAll(p, ext)));
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
}

/** Very small CSS minifier: comments + redundant whitespace. */
function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

async function main() {
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });

  // 1. static files (fonts, images, favicons, docs) — previews copy only the images they use (step 7)
  if (PREVIEW) {
    for (const e of await fs.readdir(path.join(ROOT, 'public'), { withFileTypes: true })) {
      if (e.name === 'img') continue;
      const s = path.join(ROOT, 'public', e.name), d = path.join(OUT, e.name);
      if (e.isDirectory()) await copyDir(s, d); else if (e.name !== 'README.md') await fs.copyFile(s, d);
    }
    await fs.mkdir(path.join(OUT, 'img'), { recursive: true });
  } else {
    await copyDir(path.join(ROOT, 'public'), OUT);
  }

  // 1b. line art — the city behind the home page's train, drawn at build time
  const { lineArtFiles } = await import(pathToFileURL(path.join(ROOT, 'src/templates/line-art.js')));
  for (const [rel, svg] of Object.entries(lineArtFiles())) {
    const dst = path.join(OUT, 'img', rel);
    await fs.mkdir(path.dirname(dst), { recursive: true });
    await fs.writeFile(dst, svg);
  }

  // 2. CSS — numbered partials concatenated in order
  const cssFiles = await readAll(path.join(ROOT, 'src', 'styles'), '.css');
  let css = '';
  for (const f of cssFiles) css += `\n/* ${path.basename(f)} */\n` + (await fs.readFile(f, 'utf8'));
  // font URLs are written root-relative in CSS; rewrite for base / relative builds
  css = css.replace(/url\(\/(fonts|img)\//g, RELATIVE ? 'url(../$1/' : `url(${BASE}$1/`);
  css = minifyCss(css);

  // 3. JS — copied as native ES modules
  const jsFiles = await readAll(path.join(ROOT, 'src', 'scripts'), '.js');
  const hash = crypto.createHash('sha1').update(css);
  for (const f of jsFiles) hash.update(await fs.readFile(f));
  const version = hash.digest('hex').slice(0, 8);

  await fs.mkdir(path.join(OUT, 'assets', 'js'), { recursive: true });
  await fs.writeFile(path.join(OUT, 'assets', 'site.css'), css);
  for (const f of jsFiles) {
    const rel = path.relative(path.join(ROOT, 'src', 'scripts'), f);
    const dst = path.join(OUT, 'assets', 'js', rel);
    await fs.mkdir(path.dirname(dst), { recursive: true });
    let code = await fs.readFile(f, 'utf8');
    // cache-bust module imports so a deploy never mixes old and new modules
    code = code.replace(/from '(\.{1,2}\/[^']+\.js)'/g, `from '$1?v=${version}'`).replace(/import\('(\.{1,2}\/[^']+\.js)'\)/g, `import('$1?v=${version}')`);
    await fs.writeFile(dst, code);
  }

  // 4. pages
  const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'public', 'img', 'manifest.json'), 'utf8'));
  const { makeCtx } = await import(pathToFileURL(path.join(ROOT, 'src/templates/ctx.js')));
  const { routes, redirects } = await import(pathToFileURL(path.join(ROOT, 'src/templates/routes.js')));
  const { site } = await import(pathToFileURL(path.join(ROOT, 'src/data/site.js')));
  // only link documents that actually exist in public/
  site.documents = site.documents.filter((d) => existsSync(path.join(ROOT, 'public', d.file)));

  const written = [];
  for (const r of routes) {
    // a page written to a top-level file (404.html) links relative to the top level
    const pagePath = RELATIVE && r.file && !r.file.includes('/') ? '/' : r.path;
    const ctx = makeCtx({ pagePath, base: BASE, relative: RELATIVE, manifest, version, site, widths: WIDTHS, preview: PREVIEW });
    const htmlOut = String(r.render(ctx));
    const file = r.file ? path.join(OUT, r.file) : path.join(OUT, r.path, 'index.html');
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, htmlOut);
    if (!r.noindex) written.push(r.path);
  }

  // 5. redirects for retired WordPress URLs (static meta-refresh pages)
  for (const [from, to] of Object.entries(PREVIEW ? {} : redirects)) {
    const ctx = makeCtx({ pagePath: from, base: BASE, relative: RELATIVE, manifest, version, site });
    const target = ctx.url(to);
    const file = path.join(OUT, from, 'index.html');
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved — Eshun Burge</title><meta name="robots" content="noindex"><link rel="canonical" href="${site.url}${to.split('#')[0]}"><meta http-equiv="refresh" content="0; url=${target}"><script>location.replace(${JSON.stringify(target)}+location.search)</script></head><body><p>This page has moved: <a href="${target}">continue</a>.</p></body></html>\n`);
  }

  // 6. sitemap, robots, misc
  if (!RELATIVE) {
    const today = new Date().toISOString().slice(0, 10);
    await fs.writeFile(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${written.map((p) => `  <url><loc>${site.url}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
    await fs.writeFile(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
    await fs.writeFile(path.join(OUT, '.nojekyll'), '');
    if (process.env.CNAME) await fs.writeFile(path.join(OUT, 'CNAME'), process.env.CNAME + '\n');
  }

  // 7. previews: copy just the image files the pages reference
  if (PREVIEW) {
    const used = new Set();
    const scan = async (dir) => {
      for (const e of await fs.readdir(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) await scan(p);
        else if (e.name.endsWith('.html')) for (const m of (await fs.readFile(p, 'utf8')).matchAll(/img\/([\w\-./]+?\.webp)/g)) used.add(m[1]);
      }
    };
    await scan(OUT);
    for (const rel of used) {
      const src = path.join(ROOT, 'public', 'img', rel);
      if (!existsSync(src)) continue;
      await fs.mkdir(path.dirname(path.join(OUT, 'img', rel)), { recursive: true });
      await fs.copyFile(src, path.join(OUT, 'img', rel));
    }
    console.log(`preview: ${used.size} image files`);
  }

  console.log(`built ${routes.length} pages + ${Object.keys(redirects).length} redirects → ${path.relative(ROOT, OUT)}/  (v${version}, ${Date.now() - t0} ms${RELATIVE ? ', relative URLs' : `, base ${BASE}`})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
