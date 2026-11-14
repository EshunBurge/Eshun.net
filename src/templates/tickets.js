// src/templates/tickets.js — the photo collections as tickets: a little poster of each destination.
//
// Each collection gets its own cover: a rail ticket whose top half is a little travel poster of
// the destination, with the silver maglev crossing it. The real photographs stay on each
// collection's own page. Everything is drawn here at build time, as inline SVG (viewBox 400×300),
// from a seeded pen so the drawings never change between builds.

/* ── a seeded pen and a few drawing helpers ────────────────────────── */
function pen(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const next = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const R = (a, b) => a + (b - a) * next();
  const pick = (a) => a[Math.floor(next() * a.length)];
  return { next, R, pick };
}
const n = (v) => String(Math.round(v * 10) / 10);
const W = 400, H = 300;
const stops = (list) => list.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`).join('');
const lin = (id, list, [x1, y1, x2, y2] = [0, 0, 0, 1]) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(list)}</linearGradient>`;
const rad = (id, list) => `<radialGradient id="${id}">${stops(list)}</radialGradient>`;

/** A smooth line through points (Catmull–Rom as cubic Béziers). */
function smooth(pts) {
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${n(c1[0])} ${n(c1[1])} ${n(c2[0])} ${n(c2[1])} ${n(p2[0])} ${n(p2[1])}`;
  }
  return d;
}
/** Rolling hills: a smooth top edge, filled down to `bottom`. */
function hills(p, { y, amp, step = 70, bottom = H }) {
  const pts = [];
  for (let x = -40; x <= W + 40; x += step) pts.push([x, y + p.R(-amp, amp)]);
  return `${smooth(pts)}L${W + 40} ${bottom}L-40 ${bottom}Z`;
}
/** A jagged ridge (midpoint displacement), filled down to `bottom`. */
function ridge(p, { y, amp, rough = 0.52, steps = 6, bottom = H, x0 = -10, x1 = W + 10, y0, y1 }) {
  let pts = [[x0, y0 ?? y + p.R(-amp, amp) * 0.3], [x1, y1 ?? y + p.R(-amp, amp) * 0.3]];
  let d = amp;
  for (let i = 0; i < steps; i++) {
    const next = [];
    for (let k = 0; k < pts.length - 1; k++) {
      const [ax, ay] = pts[k], [bx, by] = pts[k + 1];
      next.push(pts[k], [(ax + bx) / 2, (ay + by) / 2 + p.R(-d, d)]);
    }
    next.push(pts[pts.length - 1]);
    pts = next;
    d *= rough;
  }
  return `M${pts.map(([x, yy]) => `${n(x)} ${n(yy)}`).join('L')}L${x1} ${bottom}L${x0} ${bottom}Z`;
}
/** Stars: small dots, a few of them twinkling. */
function stars(p, count, { top = 0, bottom = 150, color = '#fff' } = {}) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const r = p.R(0.5, 1.4);
    s += `<circle${p.next() > 0.7 ? ' class="tk-twinkle"' : ''} cx="${n(p.R(4, W - 4))}" cy="${n(p.R(top, bottom))}" r="${n(r)}" fill="${color}" opacity="${n(p.R(0.45, 0.95))}"/>`;
  }
  return s;
}
/** A soft sun or moon: a disc and its glow. */
const glowDisc = (id, cx, cy, r, color, glow = 3.2) =>
  `<circle cx="${cx}" cy="${cy}" r="${r * glow}" fill="url(#${id}-glow)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;
/** Lit windows scattered over a set of blocks. */
function windows(p, blocks, { chance = 0.3, colors = ['#ffd38a', '#ffb3cf'], w = 2.6, h = 3.6, gx = 6, gy = 7 } = {}) {
  let s = '';
  for (const [x, top, bw, bottom] of blocks) {
    for (let wx = x + 3; wx < x + bw - 4; wx += gx) for (let wy = top + 4; wy < bottom - 4; wy += gy) {
      if (p.next() < chance) s += `<rect x="${n(wx)}" y="${n(wy)}" width="${w}" height="${h}" fill="${p.pick(colors)}" opacity="${n(p.R(0.55, 1))}"/>`;
    }
  }
  return s;
}
/** A row of flat-topped blocks; returns the shapes and the boxes (for windows). */
function blocks(p, { x0 = -10, x1 = W + 10, base, minH, maxH, minW = 14, maxW = 34, fill, spires = 0 }) {
  const boxes = [];
  let s = '';
  for (let x = x0; x < x1;) {
    const w = p.R(minW, maxW), h = p.R(minH, maxH), top = base - h;
    s += `<rect x="${n(x)}" y="${n(top)}" width="${n(w)}" height="${n(h + 2)}" fill="${fill}"/>`;
    if (spires && p.next() < spires) s += `<path d="M${n(x + w / 2 - 1)} ${n(top)}V${n(top - p.R(8, 18))}h2V${n(top)}Z" fill="${fill}"/>`;
    boxes.push([x, top, w, base]);
    x += w + p.R(-2, 2);
  }
  return { s, boxes };
}

/* ── the maglev, small: two cars, nose to the right, 172 × 27 ──────── */
function miniTrain(id, { night = false } = {}) {
  const rear = 'M2 4Q2 1 5 1H72Q75 1 75 4V21Q75 23 73 23H4Q2 23 2 21Z';
  const lead = 'M79 4Q79 1 82 1H136C152 1 164 7 170 15C172 18 171 22 167 23H81Q79 23 79 21Z';
  const cabin = night ? '#ffe2b8' : '#ffe9d6';
  return `<g class="tk-train"><rect x="6" y="24" width="160" height="2.6" rx="1.3" fill="#ff5c9d" opacity=".75" filter="url(#${id}-soft)"/>
<rect x="75" y="5" width="4" height="16" fill="#26262c"/>
<g fill="url(#${id}-body)"><path d="${rear}"/><path d="${lead}"/></g>
<g clip-path="url(#${id}-car)"><rect x="0" y="13.2" width="172" height="1.8" fill="#ff5c9d"/><rect x="0" y="13.4" width="172" height=".5" fill="#ffd3e4"/></g>
<rect x="7" y="5" width="63" height="5.6" rx="2.8" fill="#1b1b21"/><rect x="85" y="5" width="48" height="5.6" rx="2.8" fill="#1b1b21"/>
<rect x="9" y="7.4" width="59" height="2.4" rx="1.2" fill="${cabin}" opacity="${night ? '.85' : '.45'}"/><rect x="87" y="7.4" width="44" height="2.4" rx="1.2" fill="${cabin}" opacity="${night ? '.85' : '.45'}"/>
<path d="M137 3.2C150 4 160 9 165 14L161.5 15C155.5 10.4 147.5 7.4 137 6.6Z" fill="#1b1b21"/>
<g stroke="#9a9ca4" stroke-width=".6"><path d="M24 2.5V21M52 2.5V21M98 2.5V21M120 2.5V21"/></g>
<circle cx="168" cy="18.6" r="7" fill="url(#${id}-lamp)"/><circle cx="168" cy="18.6" r="1.5" fill="#fff"/></g>`;
}
function trainDefs(id) {
  return `${lin(`${id}-body`, [[0, '#fbfbfc'], [0.4, '#d5d7dc'], [0.48, '#f7f7f9'], [0.55, '#bfc1c8'], [0.6, '#43434b'], [1, '#1c1c21']])}
${rad(`${id}-lamp`, [[0, '#fff', 0.9], [0.4, '#fff6ea', 0.35], [1, '#fff', 0]])}
<clipPath id="${id}-car"><path d="M2 4Q2 1 5 1H72Q75 1 75 4V21Q75 23 73 23H4Q2 23 2 21Z"/><path d="M79 4Q79 1 82 1H136C152 1 164 7 170 15C172 18 171 22 167 23H81Q79 23 79 21Z"/></clipPath>
<filter id="${id}-soft" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="1.4"/></filter>`;
}
/** The train in place: its rails at y = 236 by default. */
const placeTrain = (id, x, opts = {}, railY = 236) =>
  `<g transform="translate(${x} ${railY - 27})">${miniTrain(id, opts)}</g>`;
/** A deck the train runs on, with its rail. */
const deck = (y, fill, rail = '#ff5c9d') =>
  `<rect x="-5" y="${y}" width="${W + 10}" height="7" fill="${fill}"/><rect x="-5" y="${y}" width="${W + 10}" height="1.4" fill="${rail}" opacity=".85"/>`;
/** A viaduct: the deck, round arches below it, and piers to the ground. */
function viaduct(y, { span = 44, fill, ground = H, x0 = -20 }) {
  let s = `<rect x="-5" y="${y}" width="${W + 10}" height="9" fill="${fill}"/>`;
  const r = span / 2 - 4;
  for (let x = x0; x < W + span; x += span) {
    const a = x + 4, b = x + span - 4;
    s += `<path d="M${x} ${y + 8}H${x + span}V${ground}H${b}V${y + 12 + r}A${r} ${r} 0 0 0 ${a} ${y + 12 + r}V${ground}H${x}Z" fill="${fill}"/>`;
  }
  return s;
}
/** Slim pylons under an elevated guideway. */
function pylons(y, { every = 64, fill, x0 = 20, ground = H }) {
  let s = '';
  for (let x = x0; x < W; x += every) s += `<path d="M${x - 4} ${y + 6}h8l2 ${ground - y}h-12z" fill="${fill}"/>`;
  return s;
}
/** Water with soft ripples and an optional column of reflected light. */
function water(p, id, { y, top, bottom, ripple = '#fff', light, lightX = 200, lightW = 40 }) {
  let s = `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="url(#${id}-water)"/>`;
  for (let i = 0; i < 26; i++) {
    const wy = p.R(y + 4, H - 2), wx = p.R(-10, W), w = p.R(14, 46);
    s += `<rect x="${n(wx)}" y="${n(wy)}" width="${n(w)}" height=".9" rx=".45" fill="${ripple}" opacity="${n(p.R(0.12, 0.3))}"/>`;
  }
  if (light) {
    for (let wy = y + 3, k = 0; wy < H; wy += p.R(4, 7), k++) {
      const w = lightW * (1 - k * 0.04) * p.R(0.5, 1.1);
      s += `<rect x="${n(lightX - w / 2 + p.R(-4, 4))}" y="${n(wy)}" width="${n(Math.max(4, w))}" height="1.6" rx=".8" fill="${light}" opacity="${n(p.R(0.45, 0.85))}"/>`;
    }
  }
  return { s, def: lin(`${id}-water`, [[0, top], [1, bottom]]) };
}
/** Palm tree silhouette: a leaning trunk and a crown of fronds. */
function palm(x, base, h, lean, fill) {
  const tx = x + lean, ty = base - h;
  let s = `<path d="M${x - 3} ${base}C${x - 2} ${base - h * 0.4} ${tx - 3} ${ty + h * 0.3} ${tx - 1.6} ${ty}H${tx + 1.6}C${tx + 1} ${ty + h * 0.3} ${x + 2} ${base - h * 0.4} ${x + 3} ${base}Z" fill="${fill}"/>`;
  const fronds = [[-34, 10], [-26, -2], [-12, -12], [8, -13], [24, -4], [34, 9], [16, 14], [-18, 15]];
  for (const [dx, dy] of fronds) {
    const ex = tx + dx, ey = ty + dy + 6;
    const cx = tx + dx * 0.55, cy = ty + Math.min(dy, 0) - 9;
    s += `<path d="M${tx} ${ty}Q${n(cx)} ${n(cy)} ${n(ex)} ${n(ey)}Q${n(cx + 1)} ${n(cy + 6)} ${tx} ${ty + 2}Z" fill="${fill}"/>`;
  }
  return s;
}
/** Cypress: a tall dark flame. */
const cypress = (x, base, h, fill) =>
  `<path d="M${x} ${base - h}C${x + 5} ${base - h * 0.7} ${x + 6} ${base - h * 0.25} ${x + 3} ${base}H${x - 3}C${x - 6} ${base - h * 0.25} ${x - 5} ${base - h * 0.7} ${x} ${base - h}Z" fill="${fill}"/>`;
/** Pine: stacked triangles. */
const pine = (x, base, h, fill) =>
  `<path d="M${x} ${base - h}L${x + h * 0.22} ${base - h * 0.55}H${x + h * 0.12}L${x + h * 0.3} ${base - h * 0.15}H${x + 1.2}V${base}H${x - 1.2}V${base - h * 0.15}H${x - h * 0.3}L${x - h * 0.12} ${base - h * 0.55}H${x - h * 0.22}Z" fill="${fill}"/>`;

/* ── the destinations ──────────────────────────────────────────────── */
// Each returns { defs, art, night }.
const SCENES = {
  // France: a pink sunset over the rooftops, the tower, and a bridge over the Seine.
  france(id) {
    const p = pen(57);
    const roofs = (base, fill, minH, maxH) => {
      let s = '';
      for (let x = -10; x < W + 10;) {
        const w = p.R(22, 44), h = p.R(minH, maxH), top = base - h;
        s += `<path d="M${n(x)} ${base + 2}V${n(top + 7)}L${n(x + 5)} ${n(top)}H${n(x + w - 5)}L${n(x + w)} ${n(top + 7)}V${base + 2}Z" fill="${fill}"/>`;
        for (let c = x + 6; c < x + w - 6; c += p.R(9, 16)) s += `<rect x="${n(c)}" y="${n(top - 5)}" width="3" height="6" fill="${fill}"/>`;
        x += w;
      }
      return s;
    };
    const tower = `<g fill="#7a365c"><path d="M72 214L93 165H99L109 116H111L118 64H122L129 116H131L141 165H147L168 214H147Q120 178 93 214Z"/><rect x="88" y="161" width="64" height="5" rx="1"/><rect x="104" y="112" width="32" height="4" rx="1"/><rect x="119" y="50" width="2" height="15"/></g>
<g stroke="#9c4a76" stroke-width=".8" opacity=".7"><path d="M97 170L143 204M143 170L97 204M101 124L139 158M139 124L101 158M112 76L128 108M128 76L112 108"/></g>`;
    const river = water(p, id, { y: 250, top: '#d98aa3', bottom: '#8c4a79', ripple: '#ffe6d6', light: '#ffe2c4', lightX: 300, lightW: 50 });
    let bridge = `<rect x="-5" y="236" width="${W + 10}" height="9" fill="#6b2f55"/>`;
    for (const [a, b] of [[-30, 90], [90, 210], [210, 330], [330, 450]]) bridge += `<path d="M${a} 244H${b}V258Q${(a + b) / 2} 246 ${a} 258Z" fill="#6b2f55"/>`;
    for (const x of [90, 210, 330]) bridge += `<rect x="${x - 6}" y="244" width="12" height="18" fill="#6b2f55"/>`;
    return {
      defs: `${lin(`${id}-sky`, [[0, '#ff98b8'], [0.55, '#ffc4a8'], [1, '#ffe6c6']])}${rad(`${id}-glow`, [[0, '#fff3dc', 0.95], [0.35, '#ffe6c8', 0.45], [1, '#ffe6c8', 0]])}${river.def}`,
      art: `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${glowDisc(id, 300, 176, 40, '#fff4df', 2.6)}
<ellipse cx="90" cy="70" rx="80" ry="5" fill="#ffd9d2" opacity=".55"/><ellipse cx="300" cy="96" rx="96" ry="4" fill="#ffe2d6" opacity=".5"/>
${roofs(214, '#d98aa0', 22, 52)}${tower}${roofs(240, '#a8517c', 14, 36)}${river.s}${bridge}<rect x="-5" y="236" width="${W + 10}" height="1.4" fill="#ff5c9d" opacity=".85"/>${placeTrain(id, 128)}`,
    };
  },

  // Switzerland: snow peaks, pine slopes and a blue lake.
  switzerland(id) {
    const p = pen(77);
    const far = ridge(p, { y: 150, amp: 60, bottom: 230 });
    const peak = 'M150 214L214 118L236 82L250 66L258 70L268 94L290 118L330 160L372 214Z';
    const lake = water(p, id, { y: 222, top: '#4c97d4', bottom: '#245a8e', ripple: '#e8f6ff' });
    let trees = '';
    for (let i = 0; i < 26; i++) trees += pine(p.R(-10, W + 10), p.R(222, 236), p.R(16, 30), '#2c5b44');
    return {
      defs: `${lin(`${id}-sky`, [[0, '#6fbaf5'], [0.6, '#c6e7ff'], [1, '#f2fbff']])}${rad(`${id}-glow`, [[0, '#fffbe8', 0.95], [0.4, '#fffbe8', 0.35], [1, '#fff', 0]])}${lake.def}
<clipPath id="${id}-snow"><path d="M0 0H${W}V128Q340 136 300 126T220 132T140 124T60 134T0 126Z"/></clipPath>
${lin(`${id}-rock`, [[0, '#8aa3c2'], [1, '#6c86a8']], [0, 0, 1, 0])}`,
      art: `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${glowDisc(id, 330, 62, 13, '#fffdf0')}
<path d="${far}" fill="#a9bfd8"/><path d="${far}" fill="#fff" opacity=".9" clip-path="url(#${id}-snow)"/>
<path d="${peak}" fill="url(#${id}-rock)"/><path d="M250 66L258 70L268 94L290 118L330 160L372 214H262Z" fill="#5b7598" opacity=".55"/>
<path d="M214 118L236 82L250 66L258 70L268 94L290 118L278 124L262 112L250 122L238 110L224 124Z" fill="#fff"/>
<path d="${hills(p, { y: 222, amp: 10, step: 90 })}" fill="#3f7a52"/>${trees}${lake.s}
<rect x="-5" y="236" width="${W + 10}" height="5" fill="#1d3a55"/><rect x="-5" y="236" width="${W + 10}" height="1.3" fill="#ff5c9d" opacity=".85"/>
${[40, 130, 220, 310, 400].map((x) => `<path d="M${x - 2} 241L${x - 12} 300H${x - 7}L${x} 252L${x + 7} 300H${x + 12}L${x + 2} 241Z" fill="#1d3a55"/>`).join('')}
${placeTrain(id, 110)}`,
    };
  },

  // Italy: golden hills, cypresses, a hill town, and a Roman arched viaduct.
  italy(id) {
    const p = pen(91);
    let town = '';
    for (const [x, w, h] of [[226, 16, 14], [242, 14, 18], [256, 18, 12], [274, 14, 16], [288, 16, 10]]) town += `<rect x="${x}" y="${150 - h}" width="${w}" height="${h + 6}" fill="#c9875a"/><path d="M${x - 2} ${150 - h}L${x + w / 2} ${143 - h}L${x + w + 2} ${150 - h}Z" fill="#b5653f"/>`;
    town += `<rect x="262" y="104" width="12" height="44" fill="#c9875a"/><path d="M260 104L268 92L276 104Z" fill="#b5653f"/><rect x="265" y="110" width="2.4" height="5" fill="#8a4f2f"/><rect x="269" y="110" width="2.4" height="5" fill="#8a4f2f"/>`;
    let trees = '';
    for (const [x, b, h] of [[40, 214, 40], [56, 216, 32], [150, 202, 30], [164, 204, 24], [330, 208, 34], [346, 210, 28], [362, 212, 36]]) trees += cypress(x, b, h, '#3e5132');
    return {
      defs: `${lin(`${id}-sky`, [[0, '#ffe4a6'], [0.55, '#ffc07c'], [1, '#f39a6e']])}${rad(`${id}-glow`, [[0, '#fff3d0', 0.95], [0.4, '#ffe2a8', 0.4], [1, '#ffe2a8', 0]])}`,
      art: `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${glowDisc(id, 96, 132, 26, '#fff4d6', 3)}
<path d="${hills(p, { y: 156, amp: 12, step: 110, bottom: 260 })}" fill="#e3a676"/>${town}
<path d="${hills(p, { y: 190, amp: 16, step: 90, bottom: 270 })}" fill="#c68049"/>
<path d="${hills(p, { y: 214, amp: 12, step: 80, bottom: 280 })}" fill="#9b6236"/>${trees}
${viaduct(236, { span: 46, fill: '#c2603f' })}<rect x="-5" y="236" width="${W + 10}" height="1.4" fill="#ff5c9d" opacity=".85"/>
<rect x="0" y="286" width="${W}" height="14" fill="#7d4a28"/>${placeTrain(id, 190)}`,
    };
  },

  // Austria: a river bending through a green valley, vineyards and an onion-domed church.
  austria(id) {
    const p = pen(113);
    const far = ridge(p, { y: 132, amp: 46, bottom: 220 });
    let vines = '';
    for (let y = 186; y < 230; y += 6) vines += `<path d="M-10 ${y}Q120 ${y - 12} 230 ${y + 4}" stroke="#4f8a4a" stroke-width="1.2" fill="none" opacity=".55"/>`;
    const church = `<g><rect x="286" y="168" width="40" height="30" fill="#f4f1ea"/><path d="M282 168L306 152L330 168Z" fill="#c45a3c"/>
<rect x="296" y="128" width="14" height="44" fill="#f4f1ea"/><rect x="301" y="138" width="4" height="7" rx="2" fill="#6d8fb2"/>
<path d="M303 92C306 100 314 104 313 114C312 121 308 124 303 128C298 124 294 121 293 114C292 104 300 100 303 92Z" fill="#3f6ea6"/>
<rect x="302" y="82" width="2" height="12" fill="#3f6ea6"/><rect x="295" y="126" width="16" height="3" fill="#e2ddd2"/></g>`;
    let houses = '';
    for (const [x, w] of [[236, 18], [256, 14], [336, 16], [354, 20]]) houses += `<rect x="${x}" y="186" width="${w}" height="14" fill="#f6f2ea"/><path d="M${x - 2} 186L${x + w / 2} 178L${x + w + 2} 186Z" fill="#c45a3c"/>`;
    return {
      defs: `${lin(`${id}-sky`, [[0, '#9fd2ff'], [0.6, '#dcf0ff'], [1, '#fff2d8']])}${rad(`${id}-glow`, [[0, '#fffbe8', 0.95], [0.4, '#fff4d6', 0.4], [1, '#fff', 0]])}
<clipPath id="${id}-snow"><path d="M0 0H${W}V106Q330 114 270 104T150 110T40 102T0 108Z"/></clipPath>
<clipPath id="${id}-vines"><path d="${hills(p, { y: 190, amp: 10, step: 100 })}"/></clipPath>`,
      art: `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${glowDisc(id, 82, 66, 14, '#fffdf0')}
<path d="${far}" fill="#98b0c8"/><path d="${far}" fill="#fff" opacity=".85" clip-path="url(#${id}-snow)"/>
<path d="${hills(p, { y: 176, amp: 14, step: 100, bottom: 260 })}" fill="#8fbf7a"/>${houses}${church}
<path d="${hills(p, { y: 196, amp: 10, step: 100 })}" fill="#6ea862"/><g clip-path="url(#${id}-vines)">${vines}</g>
<path d="M-10 226C80 210 150 232 230 222S350 204 410 214V246H-10Z" fill="#5aa8de"/><path d="M-10 228C80 214 150 236 230 226S350 208 410 218" stroke="#e8f6ff" stroke-width="1.2" fill="none" opacity=".7"/>
<path d="M-10 236H410V300H-10Z" fill="#4e8f52"/>${deck(236, '#3e7444')}${placeTrain(id, 150)}
<path d="${hills(p, { y: 272, amp: 6, step: 120 })}" fill="#3f7a45"/>`,
    };
  },

  // Czechia: Prague at dusk, copper domes and red roofs over the river, and a stone bridge.
  czechia(id) {
    const p = pen(137);
    const castle = `<path d="${ridge(p, { y: 168, amp: 10, bottom: 240, x0: -10, x1: 180 })}" fill="#3e3358"/>
<g fill="#3e3358"><rect x="40" y="128" width="90" height="40"/><path d="M62 128V96L66 72L70 96V128Z"/><path d="M84 128V102L89 64L94 102V128Z"/><path d="M104 128V106L108 86L112 106V128Z"/></g>`;
    const dome = (x, base, s, fill) => `<rect x="${x - 12 * s}" y="${base - 20 * s}" width="${24 * s}" height="${20 * s}" fill="#4a3456"/><path d="M${x - 13 * s} ${base - 20 * s}C${x - 13 * s} ${base - 38 * s} ${x + 13 * s} ${base - 38 * s} ${x + 13 * s} ${base - 20 * s}Z" fill="${fill}"/><rect x="${x - 2.5 * s}" y="${base - 44 * s}" width="${5 * s}" height="${8 * s}" fill="${fill}"/><rect x="${x - 0.6 * s}" y="${base - 52 * s}" width="${1.2 * s}" height="${8 * s}" fill="${fill}"/>`;
    const bell = (x, base, s, fill) => `<rect x="${x - 6 * s}" y="${base - 46 * s}" width="${12 * s}" height="${46 * s}" fill="#4a3456"/><path d="M${x} ${base - 66 * s}C${x + 6 * s} ${base - 58 * s} ${x + 9 * s} ${base - 52 * s} ${x + 6 * s} ${base - 46 * s}H${x - 6 * s}C${x - 9 * s} ${base - 52 * s} ${x - 6 * s} ${base - 58 * s} ${x} ${base - 66 * s}Z" fill="${fill}"/><rect x="${x - 0.6 * s}" y="${base - 76 * s}" width="${1.2 * s}" height="${11 * s}" fill="${fill}"/>`;
    let roofs = '';
    for (let x = -10; x < W + 10;) {
      const w = p.R(18, 32), h = p.R(16, 30), top = 228 - h;
      roofs += `<rect x="${n(x)}" y="${n(top)}" width="${n(w)}" height="${n(h)}" fill="#5a3a52"/><path d="M${n(x - 1)} ${n(top)}L${n(x + w / 2)} ${n(top - 9)}L${n(x + w + 1)} ${n(top)}Z" fill="#c25a42"/>`;
      x += w + p.R(-1, 2);
    }
    const river = water(p, id, { y: 250, top: '#3a4f80', bottom: '#1e2a4c', ripple: '#ffd9b5', light: '#ffb88a', lightX: 280, lightW: 30 });
    let bridge = `<rect x="-5" y="236" width="${W + 10}" height="9" fill="#2c2238"/>`;
    for (let a = -20; a < W + 40; a += 56) bridge += `<path d="M${a} 244H${a + 56}V262Q${a + 28} 242 ${a} 262Z" fill="#2c2238"/>`;
    let statues = '';
    for (let x = 18; x < W; x += 56) statues += `<path d="M${x - 2} 236V229Q${x} 225 ${x + 2} 229V236Z" fill="#2c2238"/>`;
    const gate = `<g fill="#2c2238"><rect x="356" y="196" width="30" height="42"/><path d="M352 196L371 168L390 196Z"/><rect x="369" y="160" width="4" height="10"/></g>`;
    return {
      defs: `${lin(`${id}-sky`, [[0, '#2b3a6e'], [0.55, '#8a5a8c'], [1, '#f39b78']])}${river.def}`,
      art: `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${stars(p, 12, { bottom: 80 })}${castle}
${dome(214, 214, 1.15, '#5aa58a')}${bell(262, 214, 1, '#5aa58a')}${bell(170, 214, 0.85, '#5aa58a')}${roofs}
${windows(p, [[-10, 206, 420, 228]], { chance: 0.12, colors: ['#ffd38a'] })}${river.s}${bridge}${statues}${gate}<rect x="-5" y="236" width="${W + 10}" height="1.4" fill="#ff5c9d" opacity=".85"/>${placeTrain(id, 160, { night: true })}`,
    };
  },

  // Germany: Munich at twilight, the town hall's spires and the twin domed towers, all lit.
  germany(id) {
    const p = pen(151);
    const far = blocks(p, { base: 214, minH: 20, maxH: 54, minW: 20, maxW: 36, fill: '#1b2449' });
    const twin = (x) => `<rect x="${x}" y="102" width="20" height="116" fill="#1f2853"/><path d="M${x - 1} 104C${x - 1} 84 ${x + 21} 84 ${x + 21} 104Z" fill="#3e7c71"/><rect x="${x + 8.5}" y="74" width="3" height="14" fill="#3e7c71"/>`;
    const hall = `<g fill="#232c58"><rect x="196" y="150" width="150" height="70"/>${[200, 222, 244, 296, 318, 340].map((x) => `<path d="M${x - 3} 150L${x} 132L${x + 3} 150Z"/>`).join('')}
<rect x="256" y="78" width="26" height="74"/><path d="M252 80L269 26L286 80Z"/>${[252, 286].map((x) => `<path d="M${x - 3} 82L${x} 62L${x + 3} 82Z"/>`).join('')}</g>`;
    const lit = windows(p, [[196, 150, 150, 220], [256, 84, 26, 150]], { chance: 0.45, colors: ['#ffd38a', '#ffe7b5'] });
    return {
      night: true,
      defs: `${lin(`${id}-sky`, [[0, '#0e1633'], [0.6, '#23397a'], [1, '#5b6fb4']])}${rad(`${id}-glow`, [[0, '#fff6d8', 0.8], [0.35, '#fff6d8', 0.25], [1, '#fff', 0]])}${lin(`${id}-street`, [[0, '#ffb86b', 0], [1, '#ffb86b', 0.35]])}`,
      art: `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${stars(p, 30, { bottom: 130 })}
${glowDisc(id, 336, 54, 13, '#fff6d8')}<circle cx="342" cy="50" r="12" fill="#18234a"/>
${far.s}${windows(p, far.boxes, { chance: 0.2 })}${twin(70)}${twin(98)}${hall}${lit}
<rect x="0" y="216" width="${W}" height="84" fill="#141b3a"/><rect x="0" y="236" width="${W}" height="64" fill="url(#${id}-street)"/>
${pylons(236, { fill: '#0c1230', every: 70, x0: 30 })}${deck(236, '#0c1230')}${placeTrain(id, 120, { night: true })}`,
    };
  },

  // Florida: home. A gulf sunset, palms, pelicans and a causeway across the water.
  florida(id) {
    const p = pen(173);
    const sea = water(p, id, { y: 208, top: '#e0718f', bottom: '#6e3a76', ripple: '#ffd9c2', light: '#ffe08a', lightX: 210, lightW: 64 });
    let piles = '';
    for (let x = 6; x < W; x += 26) piles += `<rect x="${x}" y="242" width="4" height="16" fill="#4a2347"/>`;
    const birds = `<g stroke="#5a2a4f" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M86 86q6-6 12 0q6-6 12 0"/><path d="M118 104q4-4 8 0q4-4 8 0"/></g>`;
    return {
      defs: `${lin(`${id}-sky`, [[0, '#ff6f9f'], [0.5, '#ff9e7c'], [1, '#ffd785']])}${rad(`${id}-glow`, [[0, '#fff3c4', 0.95], [0.4, '#ffe08a', 0.45], [1, '#ffe08a', 0]])}${sea.def}
<clipPath id="${id}-sky-clip"><rect width="${W}" height="208"/></clipPath>`,
      art: `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/><g clip-path="url(#${id}-sky-clip)">${glowDisc(id, 210, 208, 42, '#fff1b8', 2.4)}</g>
<ellipse cx="300" cy="120" rx="70" ry="4" fill="#ffd0b0" opacity=".55"/><ellipse cx="100" cy="150" rx="60" ry="3" fill="#ffe0b8" opacity=".5"/>${birds}
${sea.s}<path d="M300 260C330 246 380 244 410 248V300H290Z" fill="#f2c39c"/>
${palm(336, 262, 108, -16, '#3a1c3f')}${palm(366, 258, 84, 8, '#3a1c3f')}${palm(394, 262, 64, 14, '#3a1c3f')}
<rect x="-5" y="236" width="${W + 10}" height="6" fill="#4a2347"/><rect x="-5" y="236" width="${W + 10}" height="1.3" fill="#ff5c9d" opacity=".85"/>${piles}${placeTrain(id, 96)}`,
    };
  },

  // Cars: dusk on the highway. Long-exposure light trails run under the guideway, and a low
  // coupe waits at the kerb with its lights on.
  cars(id) {
    const p = pen(229);
    const far = blocks(p, { base: 214, minH: 26, maxH: 92, minW: 16, maxW: 34, fill: '#1e1b3d', spires: 0.15 });
    let trails = '';
    const lanes = [[256, '#ff4d6d', 2.2], [262, '#ff7a8a', 1.4], [268, '#ff4d6d', 1.8], [279, '#ffe7c2', 2.4], [285, '#fff4e0', 1.6], [292, '#ffd28a', 2]];
    for (const [y, c, w] of lanes) {
      const a = p.R(-4, 4), b = p.R(-4, 4);
      const d = `M-20 ${n(y + a)}C120 ${n(y - 6 + b)} 260 ${n(y + 6 - a)} 420 ${n(y + b)}`;
      trails += `<path d="${d}" stroke="${c}" stroke-width="${w * 3.2}" fill="none" opacity=".35" filter="url(#${id}-blur)"/><path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
    }
    let dashes = '';
    for (let x = -10; x < W; x += 34) dashes += `<rect x="${x}" y="273" width="16" height="1.6" rx=".8" fill="#5b5677"/>`;
    const coupe = `<g transform="translate(250 262)"><path d="M0 22C0 15 6 12 18 11L40 4C50 1 70 0 84 3L104 10C114 12 122 15 124 20V24H0Z" fill="#0b0a16"/>
<path d="M46 6C54 3 68 2 80 4L94 10H40Z" fill="#2c2a4a"/><circle cx="24" cy="25" r="7.5" fill="#05040b"/><circle cx="102" cy="25" r="7.5" fill="#05040b"/>
<circle cx="24" cy="25" r="3" fill="#3a3756"/><circle cx="102" cy="25" r="3" fill="#3a3756"/>
<rect x="119" y="15" width="6" height="3" rx="1.5" fill="#fff4e0"/><path d="M125 13L170 4V26L125 18Z" fill="url(#${id}-beam)"/><rect x="-1" y="13" width="5" height="3" rx="1.5" fill="#ff4d6d"/></g>`;
    return {
      night: true,
      defs: `${lin(`${id}-sky`, [[0, '#0f1330'], [0.5, '#3a2a62'], [0.82, '#c4577a'], [1, '#ff9a6e']])}${rad(`${id}-glow`, [[0, '#ffd9b0', 0.9], [0.4, '#ff9a6e', 0.35], [1, '#ff9a6e', 0]])}
${lin(`${id}-beam`, [[0, '#fff4e0', 0.55], [1, '#fff4e0', 0]], [0, 0, 1, 0])}${lin(`${id}-road`, [[0, '#191733'], [1, '#0b0a18']])}
<filter id="${id}-blur" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="2.2"/></filter>`,
      art: `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${stars(p, 16, { bottom: 90 })}${glowDisc(id, 300, 206, 22, '#ffe2bf', 3.4)}
${far.s}${windows(p, far.boxes, { chance: 0.22 })}<rect x="0" y="214" width="${W}" height="86" fill="url(#${id}-road)"/>
${pylons(236, { fill: '#08071a', every: 72, x0: 40 })}${deck(236, '#08071a')}${dashes}${trails}${coupe}${placeTrain(id, 40, { night: true })}`,
    };
  },

  // Other: the darkroom. Prints hang drying on a line under the red safelight, and the train
  // rides a strip of film.
  other(id) {
    const p = pen(241);
    let line = `<path d="M-10 54Q200 92 410 50" stroke="#f4d7de" stroke-width="1" fill="none" opacity=".7"/>`;
    const at = (x) => { const t = (x + 10) / 420; return (1 - t) * (1 - t) * 54 + 2 * (1 - t) * t * 92 + t * t * 50; };
    const minis = [
      (w, h) => `<rect width="${w}" height="${h}" fill="#ffb38a"/><circle cx="${w * 0.6}" cy="${h * 0.42}" r="${w * 0.16}" fill="#fff1c9"/><path d="M0 ${h * 0.7}Q${w * 0.3} ${h * 0.5} ${w * 0.55} ${h * 0.68}T${w} ${h * 0.62}V${h}H0Z" fill="#c4577a"/>`,
      (w, h) => `<rect width="${w}" height="${h}" fill="#9fd2ff"/><path d="M0 ${h}L${w * 0.32} ${h * 0.36}L${w * 0.48} ${h * 0.58}L${w * 0.66} ${h * 0.3}L${w} ${h}Z" fill="#6c86a8"/><path d="M${w * 0.26} ${h * 0.47}L${w * 0.32} ${h * 0.36}L${w * 0.38} ${h * 0.47}ZM${w * 0.6} ${h * 0.41}L${w * 0.66} ${h * 0.3}L${w * 0.72} ${h * 0.41}Z" fill="#fff"/>`,
      (w, h) => `<rect width="${w}" height="${h}" fill="#1d2448"/><circle cx="${w * 0.66}" cy="${h * 0.32}" r="${w * 0.13}" fill="#f6f3df"/><rect y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="#2c3a6e"/><rect x="${w * 0.2}" y="${h * 0.52}" width="${w * 0.14}" height="${h * 0.22}" fill="#0f1430"/>`,
      (w, h) => `<rect width="${w}" height="${h}" fill="#ff98b8"/><rect x="${w * 0.18}" y="${h * 0.62}" width="${w * 0.64}" height="${h * 0.14}" rx="${h * 0.06}" fill="#1b1b21"/><circle cx="${w * 0.32}" cy="${h * 0.78}" r="${w * 0.07}" fill="#1b1b21"/><circle cx="${w * 0.68}" cy="${h * 0.78}" r="${w * 0.07}" fill="#1b1b21"/><path d="M${w * 0.3} ${h * 0.62}L${w * 0.4} ${h * 0.5}H${w * 0.62}L${w * 0.72} ${h * 0.62}Z" fill="#1b1b21"/>`,
      (w, h) => `<rect width="${w}" height="${h}" fill="#e8dccb"/><circle cx="${w * 0.5}" cy="${h * 0.38}" r="${w * 0.16}" fill="#5a3a52"/><path d="M${w * 0.2} ${h}Q${w * 0.22} ${h * 0.58} ${w * 0.5} ${h * 0.58}Q${w * 0.78} ${h * 0.58} ${w * 0.8} ${h}Z" fill="#5a3a52"/>`,
    ];
    let prints = '';
    [[24, 40, 52, -5], [96, 46, 58, 4], [170, 40, 52, -3], [242, 46, 58, 5], [318, 40, 52, -4]].forEach(([x, w, h, rot], i) => {
      const top = at(x + w / 2) + 5;
      prints += `<g transform="translate(${x} ${n(top)}) rotate(${rot} ${w / 2} 0)"><g class="tk-sway"><rect x="-3" y="0" width="${w + 6}" height="${h + 10}" fill="#fbf8f1"/><g transform="translate(0 3)">${minis[i](w, h)}</g></g></g>`;
      prints += `<rect x="${x + w / 2 - 2}" y="${n(top - 7)}" width="4" height="11" rx="1" fill="#c9a77c"/>`;
    });
    let film = `<rect x="-5" y="236" width="${W + 10}" height="30" fill="#141014"/><rect x="-5" y="236" width="${W + 10}" height="1.4" fill="#ff5c9d" opacity=".85"/>`;
    for (let x = 2; x < W; x += 13) film += `<rect x="${x}" y="240" width="7" height="4.4" rx="1.2" fill="#f4d7de" opacity=".85"/><rect x="${x}" y="258" width="7" height="4.4" rx="1.2" fill="#f4d7de" opacity=".85"/>`;
    for (let x = 0; x < W; x += 52) film += `<rect x="${x + 3}" y="246.5" width="46" height="9.5" rx="1" fill="${p.pick(['#5a1a35', '#7a2848', '#3b1527', '#8a3a52'])}" opacity=".9"/>`;
    let dust = '';
    for (let i = 0; i < 18; i++) dust += `<circle cx="${n(p.R(4, W - 4))}" cy="${n(p.R(120, 226))}" r="${n(p.R(0.6, 1.6))}" fill="#ffd3dc" opacity="${n(p.R(0.15, 0.45))}"/>`;
    return {
      night: true,
      defs: `${lin(`${id}-sky`, [[0, '#2a0d1c'], [0.6, '#4d1630'], [1, '#6e2140']])}${rad(`${id}-glow`, [[0, '#ff7a7a', 0.75], [0.4, '#ff4d5e', 0.25], [1, '#ff4d5e', 0]])}`,
      art: `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${glowDisc(id, 352, 168, 9, '#ff8a80', 6)}<rect x="346" y="178" width="12" height="6" rx="1" fill="#1b0b12"/>
${line}${prints}${dust}<rect x="0" y="266" width="${W}" height="34" fill="#1b0b12"/>${film}${placeTrain(id, 178, { night: true })}`,
    };
  },

  // The mystery stop: somewhere on the line — a ferry, a lake, a wall of mountain — under a full
  // moon. Its ticket deals a photograph from any collection, at random.
  mystery(id) {
    const p = pen(197);
    const wall = ridge(p, { y: 90, amp: 40, x0: 150, x1: 420, y0: 210, y1: 40, bottom: 214 });
    const lake = water(p, id, { y: 212, top: '#14404f', bottom: '#0a2230', ripple: '#bfe9f0', light: '#f4f1dc', lightX: 150, lightW: 22 });
    const ferry = `<g fill="#06161d"><path d="M30 222H102L94 230H38Z"/><rect x="44" y="212" width="40" height="10"/><rect x="56" y="204" width="20" height="8"/><rect x="68" y="196" width="4" height="9"/></g>${[48, 56, 64, 72, 80].map((x) => `<rect x="${x}" y="215" width="4" height="3" fill="#ffd38a"/>`).join('')}`;
    return {
      night: true,
      defs: `${lin(`${id}-sky`, [[0, '#0a1a28'], [0.6, '#123a4c'], [1, '#2a6b7a']])}${rad(`${id}-glow`, [[0, '#f4f1dc', 0.85], [0.35, '#f4f1dc', 0.25], [1, '#fff', 0]])}${lake.def}`,
      art: `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${stars(p, 36, { bottom: 150 })}${glowDisc(id, 112, 74, 20, '#f6f3df')}
<path d="${wall}" fill="#173f4d"/><path d="${wall}" fill="none" stroke="#9fd2da" stroke-width="1.2" opacity=".35"/><path d="${ridge(p, { y: 176, amp: 18, x0: -10, x1: 220, bottom: 214 })}" fill="#11333f"/>
${lake.s}${ferry}<rect x="-5" y="236" width="${W + 10}" height="64" fill="#081820"/>${deck(236, '#0b222c')}${placeTrain(id, 196, { night: true })}`,
    };
  },

  // The whole line: every stop on one route, for the "all collections" ticket.
  line(id) {
    const p = pen(211);
    let stopsArt = '';
    const xs = [40, 80, 120, 160, 200, 240, 280, 320, 360];
    for (const x of xs) stopsArt += `<circle cx="${x}" cy="150" r="7" fill="#1b1b1e" stroke="#fff" stroke-width="3"/>`;
    return {
      night: true,
      defs: `${lin(`${id}-sky`, [[0, '#26262b'], [1, '#141416']])}`,
      art: `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${stars(p, 20, { bottom: 110, color: '#a6a6af' })}
<path d="M0 60H400M0 100H400M0 200H400M0 240H400" stroke="#2f2f35" stroke-width="1"/><path d="M40 0V300M120 0V300M200 0V300M280 0V300M360 0V300" stroke="#2f2f35" stroke-width="1"/>
<rect x="20" y="146" width="360" height="8" rx="4" fill="#ff5c9d"/>${stopsArt}${placeTrain(id, 114, { night: true }, 140)}`,
    };
  },
};

/** The cover art for one collection, as inline SVG. */
export function ticketArt(name) {
  const id = `tk-${name}`;
  const scene = SCENES[name](id);
  return `<svg class="ticket__svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>${trainDefs(id)}${scene.defs}</defs>${scene.art}</svg>`;
}
export const ticketNames = Object.keys(SCENES);

/** The small maglev on its own (the footer's "end of the line", the express), 172 × 28. */
export function miniTrainSvg(name, opts = {}) {
  const id = `mt-${name}`;
  return `<svg class="mini-train" viewBox="0 0 172 28" aria-hidden="true" focusable="false"><defs>${trainDefs(id)}</defs>${miniTrain(id, opts)}</svg>`;
}
