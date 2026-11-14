// src/templates/city.js — the city at night, and the platform the train stops at.
//
// Drawn at build time as three layers that share one frame (3000 × 800 units, tiling sideways),
// each with its own set of aircraft-warning lights (kept apart so they can blink in CSS without
// the city being redrawn):
//   line/city-far.svg    lights-far.svg    the far side of town, pale in the haze
//   line/city-mid.svg    lights-mid.svg    downtown: glass towers, stepped and spired, crowns lit
//   line/city-near.svg   lights-near.svg   the blocks just behind the platform, plant on the roofs
//   line/platform.svg                      the platform floor in perspective, with its edge strip
// Centred, the frame puts downtown to the right of the middle, with lower blocks to the left, so
// the words above it stay clear.
//
// The towers are lit the way real ones are at night. Each has a front (punched windows, a glass
// curtain wall or ribbon windows), a darker side that shows on the side facing the middle of the
// frame (as if seen from there), a lit corner and roof edge, and shading: dark toward the street,
// with the glow of the city at its foot. Their floors are dark, have a few lights on, are busy
// (lights in runs, like an office at night) or are fully lit, mostly in one colour of light per
// floor. The tops vary: spires, stepped setbacks, Art Deco crowns, floodlit crowns, slanted and
// pyramid tops, cylinders and masts; the near blocks carry plant, water tanks and masts.

/* ── a seeded pen ──────────────────────────────────────────────────── */
function pen(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const next = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const R = (a, b) => a + (b - a) * next();
  const pick = (a) => a[Math.floor(next() * a.length)];
  return { next, R, pick };
}
const n1 = (v) => String(Math.round(v * 10) / 10);
const W = 3000, H = 800;
/** A rise in the skyline, repeating with the frame so the tiles meet without a seam. */
const rise = (x, c, s) => [-W, 0, W].reduce((t, k) => t + Math.exp(-(((x - c - k) / s) ** 2)), 0);

/* Each layer: its window grid (column, floor, window size), its colours (front, side, lit
   corner, unlit window, glass top and foot), how its floors are lit (dark, a few lights, busy,
   full), how many towers are glass or ribbon-windowed, their widths and gaps, and the height of
   the skyline along the frame. */
const LAYERS = {
  far: {
    seed: 307, col: 3, floor: 5.4, win: [1.5, 3.1],
    front: ['#35324a', '#38354e', '#322f45'], side: '#2b2840', rim: '#5d5980', dark: '#3f3c55',
    glass: ['#34354f', '#40364f'], floors: [0.6, 0.3, 0.08, 0.02], tiles: 3,
    glassy: 0.2, ribbon: 0.12, width: [34, 84], gap: [-0.3, 0.16], vary: [0.72, 1.14],
    height: (x) => 235 + 115 * rise(x, 780, 360) + 205 * rise(x, 2250, 470),
    haze: [0.42, 0.34],
  },
  mid: {
    seed: 419, col: 4, floor: 7, win: [2.2, 4.3],
    front: ['#1a1c29', '#1e202e', '#26232b', '#1b1d25', '#232631', '#2a2629'], side: '#121320', rim: '#56608a', dark: '#282c3d',
    glass: ['#1e2338', '#2e2739'], floors: [0.4, 0.28, 0.23, 0.09], tiles: 5,
    glassy: 0.46, ribbon: 0.14, width: [46, 104], gap: [-0.24, 0.12], vary: [0.7, 1.1],
    height: (x) => 210 + 455 * rise(x, 1880, 290) + 150 * rise(x, 2640, 190) + 95 * rise(x, 380, 250) + 55 * rise(x, 1180, 140),
    haze: [0.3, 0.2],
  },
  near: {
    seed: 521, col: 5.6, floor: 9.6, win: [3.2, 5.9],
    front: ['#141419', '#17161c', '#131318', '#19181d'], side: '#0c0c10', rim: '#3a3a48', dark: '#202029',
    glass: ['#15161f', '#221b26'], floors: [0.4, 0.4, 0.15, 0.05], tiles: 4,
    glassy: 0.12, ribbon: 0.2, width: [62, 150], gap: [-0.14, 0.2], vary: [0.62, 1.38],
    height: (x) => 140 + 70 * rise(x, 1700, 700),
    haze: [0.16, 0.12],
  },
};
const LIGHT = { warm: '#ffcf8f', soft: '#f6efe6', cool: '#d3e2ff', pink: '#ffb6d3' };

/** A layer's window patterns: the unlit grid; several tiles of floors with their lights on;
 *  a row of lit windows, for whole floors lit; the mullions and floor edges of curtain-wall
 *  glass; and the band of ribbon windows. */
function patterns(id, L, p) {
  const [ww, wh] = L.win, ox = (L.col - ww) / 2, oy = (L.floor - wh) / 2;
  let s = `<pattern id="${id}d" width="${L.col}" height="${L.floor}" patternUnits="userSpaceOnUse"><rect x="${n1(ox)}" y="${n1(oy)}" width="${ww}" height="${wh}" fill="${L.dark}"/></pattern>`;
  const [dark, few, busy] = L.floors;
  for (let k = 0; k < L.tiles; k++) {
    const cols = 24 + k * 5, rows = 36 + k * 7, paths = {};
    for (let r = 0; r < rows; r++) {
      const q = p.next();
      const mode = q < dark ? 0 : q < dark + few ? 1 : q < dark + few + busy ? 2 : 3;
      const t = p.next();
      const tone = t < 0.42 ? 'warm' : t < 0.74 ? 'soft' : t < 0.98 ? 'cool' : 'pink';
      let on = false;
      for (let c = 0; c < cols; c++) {
        // busy floors light up in runs; full ones nearly all the way along
        on = mode === 0 ? p.next() < 0.015 : mode === 1 ? p.next() < 0.13 : mode === 2 ? p.next() < (on ? 0.8 : 0.3) : p.next() < 0.94;
        if (!on) continue;
        const key = `${p.next() < 0.1 ? (tone === 'warm' ? 'soft' : 'warm') : tone}${p.next() < 0.28 ? 0 : 1}`;
        paths[key] = (paths[key] || '') + `M${n1(c * L.col + ox)} ${n1(r * L.floor + oy)}h${ww}v${wh}h-${ww}z`;
      }
    }
    s += `<pattern id="${id}w${k}" width="${n1(cols * L.col)}" height="${n1(rows * L.floor)}" patternUnits="userSpaceOnUse">${Object.entries(paths).map(([key, d]) => `<path d="${d}" fill="${LIGHT[key.slice(0, -1)]}" opacity="${key.endsWith('1') ? 0.9 : 0.5}"/>`).join('')}</pattern>`;
  }
  for (const [t, c] of [['rs', LIGHT.soft], ['rc', LIGHT.cool], ['rw', LIGHT.warm]]) {
    s += `<pattern id="${id}${t}" width="${L.col}" height="${L.floor}" patternUnits="userSpaceOnUse"><rect x="${n1(ox - 0.3)}" y="${n1(oy)}" width="${n1(ww + 0.6)}" height="${wh}" fill="${c}"/></pattern>`;
  }
  s += `<pattern id="${id}m" width="${L.col}" height="${L.floor}" patternUnits="userSpaceOnUse"><rect width=".5" height="${L.floor}" fill="#8790b8" opacity=".2"/><rect width="${L.col}" height=".8" fill="#07070b" opacity=".4"/></pattern>`;
  s += `<pattern id="${id}r" width="${L.col}" height="${L.floor}" patternUnits="userSpaceOnUse"><rect y="${n1(oy)}" width="${L.col}" height="${wh}" fill="${L.dark}"/></pattern>`;
  return s;
}

/** The shapes of a layer's colour: glass (sky above, the city's glow below), the sun-less
 *  shading of a front and a side, the uplight on a crown, a reflection across glass, the haze. */
function gradients(id, L) {
  const [gTop, gFoot] = L.glass;
  return `<linearGradient id="${id}gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${gTop}"/><stop offset=".6" stop-color="${gTop}"/><stop offset="1" stop-color="${gFoot}"/></linearGradient>
<linearGradient id="${id}gs" x1="0" y1="0" x2="1" y2=".55"><stop offset=".3" stop-color="#c9d4ff" stop-opacity="0"/><stop offset=".42" stop-color="#c9d4ff" stop-opacity=".07"/><stop offset=".5" stop-color="#c9d4ff" stop-opacity="0"/></linearGradient>
<linearGradient id="${id}sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".045"/><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset=".86" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#ff7aa0" stop-opacity=".16"/></linearGradient>
<linearGradient id="${id}vl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
<linearGradient id="${id}vr" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
<linearGradient id="${id}sd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient>
<linearGradient id="${id}up" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd49a" stop-opacity=".8"/><stop offset="1" stop-color="#ffd49a" stop-opacity=".06"/></linearGradient>
<linearGradient id="${id}uk" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff8fbc" stop-opacity=".7"/><stop offset="1" stop-color="#ff8fbc" stop-opacity=".05"/></linearGradient>
<linearGradient id="${id}hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6f9c" stop-opacity="0"/><stop offset="1" stop-color="#ff6f9c" stop-opacity="${L.haze[0]}"/></linearGradient>
<filter id="${id}bl" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${id === 'near' ? 9 : 7}"/></filter>`;
}

/** The blocks a tower is built from, bottom up: one for most, two to four for a stepped one. */
function blocksOf(kind, x, w, h, p) {
  if (kind === 'stepped') {
    const steps = 2 + Math.floor(p.next() * 3);
    const out = [];
    let bx = x, bw = w, by = H, left = h;
    for (let i = 0; i < steps; i++) {
      const bh = i === steps - 1 ? left : left * p.R(0.55, 0.72);
      out.push({ x: bx, y: by - bh, w: bw, h: bh });
      by -= bh; left -= bh;
      const cut = bw * p.R(0.1, 0.18);
      bx += cut; bw -= cut * 2;
    }
    return out;
  }
  if (kind === 'setback') {
    const bh = h * p.R(0.06, 0.09), cut = w * p.R(0.12, 0.2);
    return [{ x, y: H - h + bh, w, h: h - bh }, { x: x + cut, y: H - h, w: w - cut * 2, h: bh }];
  }
  return [{ x, y: H - h, w, h }];
}

/** One block: side, front, windows, lit floors, shading, and the lit corner and roof edge. */
function block(id, L, p, b, o) {
  const { x, y, w } = b;
  const h = H - y; // every block runs down to the street (its lower part is hidden by those below)
  const { lean, face, front, tile, gx, gy } = o;
  let s = '';
  // the side, on the side facing the middle of the frame
  const sw = Math.abs(lean) * w * 0.42 + (face === 'round' ? 0 : 2.5);
  const sx = lean > 0 ? x - sw : x + w;
  const shift = (inner) => `<g transform="translate(${n1(gx)} ${n1(gy)})">${inner}</g>`;
  const box = (bx, by, bw, bh, fill, extra = '') => `<rect x="${n1(bx - gx)}" y="${n1(by - gy)}" width="${n1(bw)}" height="${n1(bh)}" fill="${fill}"${extra}/>`;
  if (face !== 'round' && sw > 0.6) {
    s += `<rect x="${n1(sx)}" y="${n1(y + 1)}" width="${n1(sw)}" height="${n1(h)}" fill="${L.side}"/>`;
    s += shift(box(sx, y + L.floor * 1.5, sw, h, `url(#${tile})`, ' opacity=".26"'));
    s += `<rect x="${n1(sx)}" y="${n1(y + 1)}" width="${n1(sw)}" height="${n1(h)}" fill="url(#${id}sd)"/>`;
  }
  // the front
  s += `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" fill="${face === 'glass' ? `url(#${id}gl)` : face === 'round' ? `url(#${id}cy)` : front}"/>`;
  const wy = y + L.floor * (face === 'glass' ? 0.8 : 1.6);
  const inner = [];
  if (face === 'glass') inner.push(box(x, wy, w, H - wy, `url(#${tile})`, ' opacity=".55"'));
  else if (face === 'ribbon') inner.push(box(x + 1, wy, w - 2, H - wy, `url(#${id}r)`), box(x + 1, wy, w - 2, H - wy, `url(#${tile})`, ' opacity=".85"'));
  else inner.push(box(x + 1, wy, w - 2, H - wy, `url(#${id}d)`), box(x + 1, wy, w - 2, H - wy, `url(#${tile})`));
  // whole floors lit, in runs of a floor or a few, the way offices look at night
  if (h > 80 && p.next() < (id === 'far' ? 0.3 : 0.62)) {
    const runs = 1 + Math.floor(p.next() * (id === 'mid' ? 4 : 2));
    for (let i = 0; i < runs; i++) {
      const n = 1 + Math.floor(p.next() * (face === 'glass' ? 4 : 2));
      const f0 = Math.ceil((wy - gy) / L.floor) + Math.floor(p.R(0.05, 0.8) * (H - wy) / L.floor);
      const tone = p.pick(['rs', 'rs', 'rc', 'rw']);
      for (let f = 0; f < n; f++) {
        const fy = gy + (f0 + f) * L.floor;
        if (fy > H - L.floor) break;
        inner.push(face === 'glass'
          ? box(x, fy + 0.8, w, L.floor - 1.6, LIGHT[{ rs: 'soft', rc: 'cool', rw: 'warm' }[tone]], ` opacity="${p.R(0.22, 0.42).toFixed(2)}"`)
          : box(x + 1, fy, w - 2, L.floor, `url(#${id}${tone})`, ` opacity="${p.R(0.55, 0.95).toFixed(2)}"`));
      }
    }
  }
  if (face === 'glass') inner.push(box(x, y, w, h, `url(#${id}m)`));
  s += shift(inner.join(''));
  if (face === 'glass') s += `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" fill="url(#${id}gs)"/>`;
  // shading: darker toward the street, the city's glow at the foot, and one edge in the light
  s += `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" fill="url(#${id}sh)"/>`;
  if (face !== 'round') s += `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" fill="url(#${id}${lean > 0 ? 'vl' : 'vr'})"/>`;
  // the lit corner, and the roof edge
  const cx = lean > 0 ? x : x + w;
  if (face !== 'round') s += `<rect x="${n1(cx - 0.6)}" y="${n1(y)}" width="1.2" height="${n1(h)}" fill="${L.rim}" opacity=".6"/>`;
  s += `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="1.4" fill="${L.rim}" opacity=".9"/>`;
  return s;
}

/**
 * One tower: its blocks, then its top. Returns its SVG and where its red lights are.
 */
function tower(id, L, p, b) {
  const { x, w, h, kind } = b;
  const lean = (x + w / 2 - W / 2) / (W / 2); // −1 … 1: which side shows, and how much
  const o = {
    lean,
    face: kind === 'cylinder' ? 'round' : b.face,
    front: p.pick(L.front),
    tile: `${id}w${Math.floor(p.next() * L.tiles)}`,
    gx: p.R(0, L.col), gy: p.R(0, L.floor), // so neighbouring towers' floors don't line up
  };
  const blocks = blocksOf(kind, x, w, h, p);
  let g = blocks.map((bk) => block(id, L, p, bk, o)).join('');
  const lights = [];
  const red = (cx, cy, r = 2.4) => lights.push([cx, cy, r]);
  const glowAt = (cx, cy, rx, ry, c, op = 0.5) => `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${c}" opacity="${op}" filter="url(#${id}bl)"/>`;
  const topB = blocks[blocks.length - 1];
  const tx = topB.x, ty = topB.y, tw = topB.w, mx = tx + tw / 2;
  const fill = o.face === 'glass' ? `url(#${id}gl)` : o.front;
  const room = ty - 24; // never above the frame
  switch (kind) {
    case 'spire': {
      // a pointed roof and a needle, lit at the top
      const sh = Math.min(h * p.R(0.18, 0.27), room);
      g += `<path d="M${n1(tx + tw * 0.18)} ${n1(ty)}L${n1(mx - 2.5)} ${n1(ty - sh * 0.34)}H${n1(mx + 2.5)}L${n1(tx + tw * 0.82)} ${n1(ty)}Z" fill="${o.front}"/>`;
      g += `<path d="M${n1(tx + tw * 0.18)} ${n1(ty)}L${n1(mx - 2.5)} ${n1(ty - sh * 0.34)}" stroke="#dfe8ff" stroke-width="1.2" opacity=".55"/>`;
      g += `<rect x="${n1(mx - 1)}" y="${n1(ty - sh)}" width="2" height="${n1(sh * 0.7)}" fill="${L.rim}"/>`;
      g += glowAt(mx, ty + 3, tw * 0.5, 9, '#cfe0ff', 0.45) + `<rect x="${n1(tx)}" y="${n1(ty)}" width="${n1(tw)}" height="2" fill="#e4ecff" opacity=".8"/>`;
      red(mx, ty - sh, 2.8);
      break;
    }
    case 'deco': {
      // an Art Deco crown: three steps and a point, lit from below
      let cw = tw, cy = ty;
      for (let i = 0; i < 3; i++) {
        cw *= 0.72; const ch = Math.min(h * 0.045, room / 5);
        g += `<rect x="${n1(mx - cw / 2)}" y="${n1(cy - ch)}" width="${n1(cw)}" height="${n1(ch + 1)}" fill="${o.front}"/><rect x="${n1(mx - cw / 2)}" y="${n1(cy - ch)}" width="${n1(cw)}" height="${n1(ch + 1)}" fill="url(#${id}up)"/>`;
        cy -= ch;
      }
      const ph = Math.min(h * 0.12, cy - 24);
      const d = `M${n1(mx - cw * 0.3)} ${n1(cy)}L${n1(mx)} ${n1(cy - ph)}L${n1(mx + cw * 0.3)} ${n1(cy)}Z`;
      g += `<path d="${d}" fill="${o.front}"/><path d="${d}" fill="url(#${id}up)"/>` + glowAt(mx, cy + 4, tw * 0.36, h * 0.04, '#ffd49a', 0.32);
      red(mx, cy - ph);
      break;
    }
    case 'crown': {
      // a floodlit crown: the top floors lit from below, warm or pink
      const ch = Math.min(h * p.R(0.05, 0.08), 40), k = p.next() < 0.65 ? 'up' : 'uk';
      g += `<rect x="${n1(tx)}" y="${n1(ty)}" width="${n1(tw)}" height="${n1(ch)}" fill="url(#${id}${k})"/>`;
      g += `<rect x="${n1(tx + tw * 0.15)}" y="${n1(ty - 6)}" width="${n1(tw * 0.7)}" height="6" fill="${o.front}"/>`;
      g += glowAt(mx, ty + ch * 0.3, tw * 0.5, ch * 0.6, k === 'up' ? '#ffd49a' : '#ff8fbc', 0.26);
      red(mx, ty - 8);
      break;
    }
    case 'slant': {
      // a slanted glass top, its edge lit pink
      const sh = Math.min(tw * p.R(0.45, 0.75), room);
      const d = lean > 0 ? `M${n1(tx)} ${n1(ty)}L${n1(tx + tw)} ${n1(ty - sh)}V${n1(ty)}Z` : `M${n1(tx)} ${n1(ty - sh)}L${n1(tx + tw)} ${n1(ty)}H${n1(tx)}Z`;
      g += `<path d="${d}" fill="url(#${id}gl)"/><path d="${d}" fill="url(#${id}m)"/>`;
      g += `<path d="${lean > 0 ? `M${n1(tx)} ${n1(ty)}L${n1(tx + tw)} ${n1(ty - sh)}` : `M${n1(tx)} ${n1(ty - sh)}L${n1(tx + tw)} ${n1(ty)}`}" stroke="#ff8fbc" stroke-width="1.8" opacity=".85"/>`;
      red(lean > 0 ? tx + tw - 3 : tx + 3, ty - sh - 1);
      break;
    }
    case 'pyramid': {
      const ph = Math.min(tw * p.R(0.38, 0.6), room);
      g += `<path d="M${n1(tx)} ${n1(ty)}L${n1(mx)} ${n1(ty - ph)}L${n1(tx + tw)} ${n1(ty)}Z" fill="${fill}"/>`;
      g += `<path d="M${n1(tx)} ${n1(ty)}L${n1(mx)} ${n1(ty - ph)}L${n1(tx + tw)} ${n1(ty)}" fill="none" stroke="#ffe3b0" stroke-width="1.4" opacity=".75"/>`;
      g += glowAt(mx, ty - ph * 0.35, tw * 0.32, ph * 0.4, '#ffd49a', 0.28);
      red(mx, ty - ph - 2);
      break;
    }
    case 'cylinder': {
      g += `<ellipse cx="${n1(mx)}" cy="${n1(ty)}" rx="${n1(tw / 2)}" ry="${n1(tw * 0.09)}" fill="${o.front}"/><ellipse cx="${n1(mx)}" cy="${n1(ty)}" rx="${n1(tw / 2)}" ry="${n1(tw * 0.09)}" fill="none" stroke="${L.rim}" stroke-width="1.2"/>`;
      g += `<rect x="${n1(tx)}" y="${n1(ty + 9)}" width="${n1(tw)}" height="2.2" fill="#ff8fbc" opacity=".8"/>`;
      red(mx, ty - 3);
      break;
    }
    case 'masts': {
      for (const f of [0.28, 0.72]) {
        const mh = Math.min(h * p.R(0.1, 0.18), room);
        g += `<rect x="${n1(tx + tw * f - 0.8)}" y="${n1(ty - mh)}" width="1.6" height="${n1(mh)}" fill="${L.rim}"/>`;
        red(tx + tw * f, ty - mh);
      }
      break;
    }
    default: {
      // on the roof: plant, a water tank, or a mast
      const k = p.next();
      if (k < 0.32 && tw > 26) {
        const bw = p.R(tw * 0.25, tw * 0.55), bh = p.R(3, id === 'near' ? 12 : 8);
        g += `<rect x="${n1(tx + p.R(2, tw - bw - 2))}" y="${n1(ty - bh)}" width="${n1(bw)}" height="${n1(bh)}" fill="${o.front}"/>`;
      } else if (k < 0.5 && id === 'near' && tw > 44) {
        const wx = tx + p.R(4, tw - 24);
        g += `<g fill="${o.front}"><rect x="${n1(wx)}" y="${n1(ty - 19)}" width="18" height="13" rx="2"/><path d="M${n1(wx - 1)} ${n1(ty - 19)}h20l-10-6z"/><rect x="${n1(wx + 2)}" y="${n1(ty - 6)}" width="2" height="6"/><rect x="${n1(wx + 14)}" y="${n1(ty - 6)}" width="2" height="6"/></g>`;
      } else if (k < 0.66) {
        const mh = p.R(10, id === 'far' ? 22 : 34);
        g += `<rect x="${n1(mx - 0.7)}" y="${n1(ty - mh)}" width="1.4" height="${n1(mh)}" fill="${L.rim}"/>`;
        if (id !== 'near' || p.next() < 0.5) red(mx, ty - mh, 2);
      }
    }
  }
  return { g, lights };
}

/** What a tower's top is, by layer and height. */
function kindOf(id, h, p) {
  if (id === 'mid') {
    if (h > 500) return p.pick(['spire', 'stepped', 'deco', 'crown', 'slant', 'pyramid', 'stepped', 'masts', 'crown']);
    if (h > 370) return p.pick(['stepped', 'setback', 'crown', 'slant', 'cylinder', 'masts', 'flat', 'flat']);
    return p.pick(['flat', 'flat', 'flat', 'setback', 'masts', 'cylinder']);
  }
  if (id === 'far') return h > 380 ? p.pick(['setback', 'stepped', 'masts', 'flat', 'spire', 'flat']) : p.pick(['flat', 'flat', 'setback', 'masts']);
  return p.pick(['flat', 'flat', 'flat', 'setback']);
}

/** A layer's towers, left to right; then the tallest first, so the lower ones stand in front. */
function plan(id, L, p) {
  const list = [];
  for (let x = -30; x < W + 30;) {
    let w = p.R(...L.width);
    let h = L.height(x + w / 2) * p.R(...L.vary);
    if (p.next() < 0.07) h *= 1.16; // now and then one stands out
    h = Math.min(h, H - 130);
    if (h > 430 && w > 92) w *= 0.8; // the tall ones are slender
    const kind = kindOf(id, h, p);
    const face = p.next() < L.glassy ? 'glass' : p.next() < L.ribbon ? 'ribbon' : 'punched';
    list.push({ x, w, h, kind, face });
    x += w * (1 + p.R(...L.gap));
  }
  list.sort((a, b) => b.h - a.h);
  // downtown's landmarks: the tallest towers each get a different top
  if (id === 'mid') {
    const marks = ['spire', 'stepped', 'crown', 'deco', 'slant', 'pyramid', 'stepped', 'masts', 'crown', 'cylinder'];
    list.filter((b) => b.h > 400).slice(0, marks.length).forEach((b, i) => { b.kind = marks[i]; if (b.kind === 'cylinder') b.h *= 0.9; });
  }
  return list;
}

function layer(id) {
  const L = LAYERS[id];
  const p = pen(L.seed);
  let art = '';
  const lights = [];
  plan(id, L, p).forEach((b, i) => {
    // each tower has its own pen, so its copies across the seams (where the frame tiles) match it
    const draw = (bb) => { const t = tower(id, L, pen(L.seed * 1000 + i), bb); art += t.g; lights.push(...t.lights); };
    draw(b);
    if (b.x + b.w > W - 60) draw({ ...b, x: b.x - W });
    if (b.x < 60) draw({ ...b, x: b.x + W });
  });
  const cyl = `<linearGradient id="${id}cy" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#101320"/><stop offset=".35" stop-color="#2b3048"/><stop offset=".55" stop-color="#3a4060"/><stop offset="1" stop-color="#0e101a"/></linearGradient>`;
  // the air: the city's glow rising from the streets, thickest far away
  const depth = L.haze[1];
  const haze = `<rect y="${n1(H * (1 - depth))}" width="${W}" height="${n1(H * depth)}" fill="url(#${id}hz)"/>`;
  const city = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMax slice"><defs>${patterns(id, L, p)}${gradients(id, L)}${cyl}</defs>${art}${haze}</svg>`;
  // the red lights, with a soft halo each
  const dots = lights.filter(([cx]) => cx > -10 && cx < W + 10).map(([cx, cy, r]) => `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r * 3.2)}" fill="url(#h)"/><circle cx="${n1(cx)}" cy="${n1(cy)}" r="${n1(r * (id === 'far' ? 0.85 : 1))}" fill="#ff4b5c"/>`).join('');
  const glow = `<radialGradient id="h"><stop offset="0" stop-color="#ff4b5c" stop-opacity=".45"/><stop offset="1" stop-color="#ff4b5c" stop-opacity="0"/></radialGradient>`;
  const red = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMax slice"${id === 'far' ? ' opacity=".7"' : ''}><defs>${glow}</defs>${dots}</svg>`;
  return { city, red };
}

/** The platform floor: tiles in perspective, fading into the distance, and the edge strip. */
function platform() {
  const PW = 1200, PH = 240, vx = PW / 2, vy = -300;
  let lines = '';
  for (let x = -3000; x <= PW + 3000; x += 150) lines += `M${vx} ${vy}L${x} ${PH}`;
  for (let k = 1; k < 14; k++) {
    const y = PH * (1 - 1 / (1 + k * 0.32));
    lines += `M0 ${n1(y + 14)}H${PW}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}" preserveAspectRatio="none"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".15"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="m"><rect width="${PW}" height="${PH}" fill="url(#f)"/></mask><pattern id="t" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="4" height="4" fill="#fff" opacity=".18"/></pattern></defs>
<g mask="url(#m)"><path d="${lines}" stroke="#fff" stroke-opacity=".11" stroke-width="1" vector-effect="non-scaling-stroke" fill="none"/></g>
<rect y="3" width="${PW}" height="10" fill="url(#t)"/><rect y="0" width="${PW}" height="1.5" fill="#ff5c9d" opacity=".5"/></svg>`;
}

/** Every file, keyed by its path under img/. */
export function cityFiles() {
  const out = {};
  for (const id of ['far', 'mid', 'near']) {
    const { city, red } = layer(id);
    out[`line/city-${id}.svg`] = city;
    out[`line/lights-${id}.svg`] = red;
  }
  out['line/platform.svg'] = platform();
  return out;
}
