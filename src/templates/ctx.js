// src/templates/ctx.js — per-page rendering context: URLs and images.
import { html, raw, esc } from './lib.js';

/**
 * @param {object} o
 * @param {string} o.pagePath   e.g. '/' or '/neuroassist/'
 * @param {string} o.base       deploy base path, e.g. '/' or '/eshun-net/'
 * @param {boolean} o.relative  emit relative URLs (for file:// or artifact previews)
 * @param {object} o.manifest   public/img/manifest.json
 * @param {string} o.version    cache-busting token
 * @param {number[]} [o.widths] image widths a preview build ships (others are dropped)
 * @param {boolean} [o.preview] portable preview: demos link out and the form doesn't send
 */
export function makeCtx({ pagePath, base = '/', relative = false, manifest, version, site, widths: allowed = null, preview = false }) {
  const depth = pagePath.split('/').filter(Boolean).length;

  function url(p) {
    if (!p) return p;
    if (/^(https?:|mailto:|tel:|data:|#)/.test(p)) return p;
    let [path, hash] = p.split('#');
    hash = hash ? `#${hash}` : '';
    const clean = path.replace(/^\//, '');
    if (relative) {
      let rel = '../'.repeat(depth) + clean;
      if (rel === '' || rel.endsWith('/')) rel += 'index.html';
      return rel + hash;
    }
    return base + clean + hash;
  }

  const asset = (p) => url('/' + p.replace(/^\//, ''));

  function info(key) {
    const m = manifest[key];
    if (!m) throw new Error(`Image not in manifest: ${key} (run npm run images)`);
    if (!allowed) return m;
    // preview builds ship fewer renditions; keep the allowed ones (or the closest)
    let w = m.widths.filter((x) => allowed.includes(x));
    if (!w.length) w = [m.widths.find((x) => x >= allowed[0]) ?? m.widths.at(-1)];
    return { ...m, widths: w };
  }

  function src(key, w) {
    const m = info(key);
    const pick = w ? m.widths.find((x) => x >= w) ?? m.widths.at(-1) : m.widths.at(-1);
    return asset(`img/${key}-${pick}.webp`);
  }

  function srcset(key) {
    const m = info(key);
    return m.widths.map((w) => `${asset(`img/${key}-${w}.webp`)} ${w}w`).join(', ');
  }

  /**
   * Responsive <img>. opts: alt, sizes, cls, eager, priority, style, attrs, lqip
   */
  function img(key, opts = {}) {
    const m = info(key);
    const { alt = '', sizes = '100vw', cls = '', eager = false, priority = false, style = '', attrs = '', lqip = false, defer = false } = opts;
    const bg = lqip ? `background-image:url(${m.lqip});background-size:cover;` : '';
    const sources = defer
      ? `src="${m.lqip}" data-src="${esc(src(key, 960))}" data-srcset="${esc(srcset(key))}"`
      : `src="${esc(src(key, 960))}" srcset="${esc(srcset(key))}"`;
    return raw(
      `<img class="${esc(cls)}" ${sources} sizes="${esc(sizes)}" width="${m.w}" height="${m.h}" alt="${esc(alt)}"` +
        ` ${eager || priority ? 'loading="eager"' : 'loading="lazy"'} decoding="async"${priority ? ' fetchpriority="high"' : ''}` +
        ` style="--ph:${m.color};${bg}${esc(style)}" ${attrs}>`
    );
  }

  const ratio = (key) => {
    const m = info(key);
    return m.w / m.h;
  };

  return { pagePath, url, asset, img, src, srcset, info, ratio, version, site, relative, preview, html };
}
