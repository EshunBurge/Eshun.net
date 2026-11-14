// src/templates/line-art.js — the big train, on the home page and under every station's title.
//
// Drawn at build time and inlined, so its doors, lights and reflections can move. The city
// behind it and the platform are separate files (see city.js).
import { cityFiles } from './city.js';

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

/* ── the big train ─────────────────────────────────────────────────── */
const TRAIN_W = 2010;

function middleCar(x0, L) {
  return `M${x0} 14Q${x0} 0 ${x0 + 14} 0H${x0 + L - 14}Q${x0 + L} 0 ${x0 + L} 14V94Q${x0 + L} 100 ${x0 + L - 6} 100H${x0 + 6}Q${x0} 100 ${x0} 94Z`;
}
function leadCar(x0) {
  return `M${x0} 14Q${x0} 0 ${x0 + 14} 0H${x0 + 430}C${x0 + 560} 0 ${x0 + 662} 22 ${x0 + 716} 60C${x0 + 736} 74 ${x0 + 742} 88 ${x0 + 728} 96Q${x0 + 720} 100 ${x0 + 704} 100H${x0 + 6}Q${x0} 100 ${x0} 94Z`;
}

/**
 * A maglev in three cars, nose to the right: silver above a neon pink stripe, graphite below,
 * floating on a thin pink light over its levitation pods. Each car has roof fairings, panel
 * seams, a lit cabin with passengers, and two sliding doors with a lamp above each (they open
 * once the train has stopped). The lead car has a wraparound windscreen with a wiper, a lamp
 * cluster, a grille and pink speed marks, and its nose is shaded round. Its reflection lies on the
 * platform. viewBox 2010 × 190; the cars are 100 tall and the guideway is at y = 118.
 */
export function bigTrain() {
  const p = pen(53);
  const cars = [
    { x: 0, L: 620, d: middleCar(0, 620) },
    { x: 632, L: 620, d: middleCar(632, 620) },
    { x: 1264, L: 740, d: leadCar(1264), lead: true },
  ];
  const bodies = cars.map((c) => `<path d="${c.d}"/>`).join('');
  const doorsOf = (c) => (c.lead ? [c.x + 96, c.x + 370] : [c.x + 96, c.x + c.L - 132]);
  const nearDoor = (c, x, pad = 22) => doorsOf(c).some((dx) => x > dx - pad && x < dx + 36 + pad);
  const L0 = 1264;
  let g = '';

  // roof fairings: low covers over the equipment on each car
  for (const c of cars) {
    const spots = c.lead ? [[c.x + 150, 170]] : [[c.x + 170, 130], [c.x + c.L - 300, 130]];
    for (const [x, len] of spots) {
      g += `<path d="M${x} 2.5C${x + 6} -5 ${x + 14} -6.5 ${x + 26} -6.5H${x + len - 26}C${x + len - 14} -6.5 ${x + len - 6} -5 ${x + len} 2.5Z" fill="url(#bt-roof)"/>`;
      for (let vx = x + 34; vx < x + len - 34; vx += 9) g += `<rect x="${vx}" y="-4" width="4.5" height="1.4" rx=".7" fill="#7d7f88"/>`;
    }
  }
  // the underframe: a dark skirt with vents, the levitation pods, and the pink light under them
  for (const c of cars) {
    const w = (c.lead ? 690 : c.L) - 28;
    g += `<rect x="${c.x + 14}" y="96" width="${w}" height="9" rx="3" fill="#141417"/>`;
    for (let vx = c.x + 40; vx < c.x + w - 30; vx += 150) {
      for (let k = 0; k < 7; k++) g += `<rect x="${vx + k * 6}" y="98.5" width="3" height="4" rx="1" fill="#2c2c33"/>`;
    }
    for (let px = c.x + 30; px < c.x + w - 60; px += 170) {
      g += `<rect x="${px}" y="104" width="86" height="7" rx="3.5" fill="#0c0c0f"/><rect x="${px + 6}" y="110.2" width="74" height="1.6" rx=".8" fill="#ff7ab0"/>`;
    }
  }
  // gangways between the cars: folded bellows
  for (const gx of [620, 1252]) {
    g += `<rect x="${gx}" y="8" width="12" height="88" rx="2" fill="#18181c"/>`;
    for (let x = gx + 1; x < gx + 12; x += 2.6) g += `<rect x="${n1(x)}" y="11" width="1.3" height="82" rx=".6" fill="#2b2b31"/>`;
  }
  // the bodies: silver above, graphite below, in one gradient
  g += `<g fill="url(#bt-body)">${bodies}</g>`;
  // inside the body's outline: the pink light from below, shading above the skirt, the lit top
  // edge, the panel seams and the reflections sliding along the metal (the sheen is three
  // train-lengths wide and repeats, so it can slide either way without running out; the outer
  // group is moved by the departure on scroll, the rect by the arrival animation)
  g += `<g clip-path="url(#bt-clip)"><rect x="0" y="76" width="${TRAIN_W}" height="24" fill="url(#bt-glow)"/><rect x="0" y="84" width="${TRAIN_W}" height="16" fill="url(#bt-shade)"/><rect x="0" y="1" width="${TRAIN_W}" height="1.6" fill="#fff" opacity=".7"/><rect x="0" y="54.6" width="${TRAIN_W}" height=".9" fill="#000" opacity=".22"/><rect x="0" y="86" width="${TRAIN_W}" height=".8" fill="#fff" opacity=".1"/>`;
  for (const c of cars) {
    const end = c.lead ? c.x + 455 : c.x + c.L - 10;
    for (let x = c.x + 58; x < end; x += 152) {
      if (nearDoor(c, x)) continue;
      g += `<path d="M${x} 4V20.5M${x} 51.5V95" stroke="#000" stroke-opacity=".16" stroke-width=".9"/><path d="M${x + 1} 4V20.5M${x + 1} 51.5V95" stroke="#fff" stroke-opacity=".12" stroke-width=".7"/>`;
    }
  }
  // the city's lights reflected along the upper body, and the nose shaded round
  g += `<rect x="0" y="3" width="${TRAIN_W}" height="54" fill="url(#bt-cityref)" opacity=".2"/>`;
  g += `<rect x="${L0 + 440}" y="0" width="310" height="100" fill="url(#bt-nose)"/><path d="M${L0 + 440} 1.5C${L0 + 560} 2 ${L0 + 650} 22 ${L0 + 704} 54" fill="none" stroke="#fff" stroke-width="2.4" opacity=".55" filter="url(#bt-blur)"/>`;
  g += `<g class="bt-sheen-depart"><rect class="bt-sheen" x="${-TRAIN_W}" y="0" width="${TRAIN_W * 3}" height="100" fill="url(#bt-sheen)"/></g></g>`;
  // the neon stripe: a soft halo, the tube, a bright core; and a fine line below it
  g += `<g clip-path="url(#bt-clip)"><rect x="0" y="59.8" width="${TRAIN_W}" height="9" fill="#ff5c9d" opacity=".22"/><rect x="0" y="62" width="${TRAIN_W}" height="4.5" fill="#ff5c9d"/><rect x="0" y="62.6" width="${TRAIN_W}" height="1" fill="#ffd3e4" opacity=".85"/><rect x="0" y="71" width="${TRAIN_W}" height="1.1" fill="#ff5c9d" opacity=".5"/></g>`;
  // the glass band: the lit cabin behind it, passengers and seat backs, mullions, a frame and
  // a few reflections
  for (const c of cars) {
    const x1 = c.x + 28, x2 = c.lead ? c.x + 452 : c.x + c.L - 28;
    g += `<rect x="${x1}" y="23" width="${x2 - x1}" height="27" rx="13.5" fill="url(#bt-glass)"/>`;
    let people = '';
    for (let x = x1 + 14; x < x2 - 24; x += 35) {
      if (nearDoor(c, x, 8)) continue;
      const r = p.next();
      if (r < 0.3) {
        const cx = x + p.R(6, 22), cy = p.R(37.5, 39.5);
        people += `<circle cx="${n1(cx)}" cy="${n1(cy)}" r="4.3"/><path d="M${n1(cx - 9)} 50Q${n1(cx - 8.5)} ${n1(cy + 4.5)} ${n1(cx)} ${n1(cy + 4.5)}Q${n1(cx + 8.5)} ${n1(cy + 4.5)} ${n1(cx + 9)} 50Z"/>`;
      } else if (r < 0.62) people += `<rect x="${n1(x + p.R(4, 16))}" y="43" width="13" height="8" rx="3" opacity=".6"/>`;
    }
    g += `<g class="bt-lights"><rect x="${x1 + 10}" y="26" width="${x2 - x1 - 20}" height="2.2" rx="1.1" fill="#fff1df" opacity=".6"/><rect x="${x1 + 6}" y="33" width="${x2 - x1 - 12}" height="16" rx="7" fill="url(#bt-cabin)"/><g fill="#3a2a35" opacity=".55">${people}</g></g>`;
    for (let x = x1 + 70; x < x2 - 20; x += 70) g += `<rect x="${x}" y="23" width="2.5" height="27" fill="#232228"/>`;
    for (let x = x1 + 40; x < x2 - 40; x += 190) g += `<path d="M${x} 50L${x + 16} 23H${x + 30}L${x + 14} 50Z" fill="#fff" opacity=".07"/>`;
    g += `<rect x="${x1}" y="23" width="${x2 - x1}" height="27" rx="13.5" fill="none" stroke="#0d0d10" stroke-width="1.6"/><rect x="${x1 + 1.5}" y="24.5" width="${x2 - x1 - 3}" height="24" rx="12" fill="none" stroke="#fff" stroke-opacity=".12"/>`;
  }
  // the doors: a lit doorway behind two panels that slide apart, a lamp above, handles
  for (const c of cars) {
    for (const dx of doorsOf(c)) {
      g += `<rect class="bt-doorway" x="${dx + 1}" y="7" width="34" height="88" rx="3" fill="url(#bt-doorway)"/>`;
      for (const [side, x] of [['l', dx], ['r', dx + 18]]) {
        const hx = side === 'l' ? x + 13.5 : x + 2.5;
        g += `<g class="bt-door bt-door--${side}"><rect x="${x}" y="6" width="18" height="90" rx="3" fill="url(#bt-doorfill)" stroke="#111114" stroke-opacity=".5" stroke-width="1"/><rect x="${x + 4}" y="25" width="10" height="23" rx="4" fill="url(#bt-glass)"/><rect x="${x + 5}" y="38" width="8" height="9" rx="3" fill="url(#bt-cabin)"/><rect x="${hx}" y="72" width="2" height="12" rx="1" fill="#c9cbd2" opacity=".75"/></g>`;
      }
      g += `<rect class="bt-led" x="${dx + 10}" y="1.6" width="16" height="2.6" rx="1.3" fill="#ffcf7a"/>`;
    }
  }
  // the lead car: speed marks behind the cab, the cab seam, the windscreen with its wiper and
  // reflection, the nose seam, the lamp cluster and the grille
  for (const [i, o] of [[0, 0.95], [1, 0.6], [2, 0.3]]) {
    const x = L0 + 466 + i * 22;
    g += `<path d="M${x + 12} 74h22l-12 16h-22z" fill="#ff5c9d" opacity="${o}"/>`;
  }
  g += `<path d="M${L0 + 458} 3C${L0 + 470} 32 ${L0 + 470} 70 ${L0 + 458} 97" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1"/>`;
  g += `<path d="M${L0 + 470} 7C${L0 + 556} 9 ${L0 + 626} 30 ${L0 + 668} 58L${L0 + 646} 62C${L0 + 604} 40 ${L0 + 546} 26 ${L0 + 470} 24C${L0 + 459} 24 ${L0 + 459} 7 ${L0 + 470} 7Z" fill="url(#bt-glass)" stroke="#0b0b0f" stroke-width="1.4"/>`;
  g += `<path d="M${L0 + 520} 12C${L0 + 560} 15 ${L0 + 596} 26 ${L0 + 620} 38L${L0 + 606} 40C${L0 + 584} 30 ${L0 + 552} 21 ${L0 + 518} 18Z" fill="#fff" opacity=".12"/>`;
  g += `<path d="M${L0 + 606} 54.5L${L0 + 630} 46" stroke="#0a0a0d" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`;
  g += `<path d="M${L0 + 646} 66C${L0 + 668} 74 ${L0 + 690} 86 ${L0 + 700} 98" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="1"/>`;
  g += `<path d="M${L0 + 676} 74C${L0 + 700} 77 ${L0 + 720} 84 ${L0 + 732} 93L${L0 + 728} 96C${L0 + 712} 89 ${L0 + 694} 83 ${L0 + 672} 80Z" fill="#0e0e12"/>`;
  g += `<rect x="${L0 + 660}" y="90" width="34" height="6" rx="3" fill="#0e0e12"/>${[0, 1, 2, 3].map((k) => `<rect x="${L0 + 665 + k * 7}" y="91.5" width="3.5" height="3" rx="1" fill="#2a2a31"/>`).join('')}`;
  g += `<circle class="bt-lampglow" cx="${L0 + 714}" cy="86" r="34" fill="url(#bt-lampg)"/>`;
  g += `<path class="bt-lamp" d="M${L0 + 690} 77C${L0 + 704} 79 ${L0 + 716} 84 ${L0 + 726} 91" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none" filter="url(#bt-blur)"/>`;
  g += `<path class="bt-lamp" d="M${L0 + 682} 88C${L0 + 692} 89 ${L0 + 701} 91 ${L0 + 708} 94" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".8"/>`;
  g += [0, 1, 2].map((k) => `<circle cx="${L0 + 684 + k * 12}" cy="${n1(78.5 + k * 3.4)}" r="1.6" fill="#fff"/>`).join('');
  // a thin outline to separate the metal from the night
  g += `<g fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="1">${bodies}</g>`;

  // light from the open doors on the platform (outside the reflected group, so it isn't mirrored)
  const spills = cars.flatMap((c) => doorsOf(c).map((dx) => `<ellipse class="bt-spill" cx="${dx + 18}" cy="124" rx="44" ry="7" fill="url(#bt-spillg)"/>`)).join('');

  const bodyStops = [
    [0, '#fdfdfe'], [0.05, '#eceef1'], [0.22, '#d3d5db'], [0.42, '#c5c7ce'], [0.5, '#f8f8fa'], [0.545, '#c8cad1'],
    [0.62, '#a6a8b0'], [0.62, '#3e3e46'], [0.8, '#2a2a30'], [1, '#17171b'],
  ];
  const doorStops = [
    [0, '#fdfdfe'], [0.05, '#eceef1'], [0.22, '#d3d5db'], [0.42, '#c5c7ce'], [0.5, '#f8f8fa'], [0.545, '#c8cad1'],
    [0.62, '#a6a8b0'], [0.62, '#ff5c9d'], [0.665, '#ff5c9d'], [0.665, '#3e3e46'], [0.8, '#2a2a30'], [1, '#17171b'],
  ];
  const stops = (list) => list.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('');

  const defs = `<defs>
<linearGradient id="bt-body" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100">${stops(bodyStops)}</linearGradient>
<linearGradient id="bt-doorfill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100">${stops(doorStops)}</linearGradient>
<linearGradient id="bt-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset=".6" stop-color="#c3c5cc"/><stop offset="1" stop-color="#9c9ea6"/></linearGradient>
<linearGradient id="bt-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
<linearGradient id="bt-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0b0f"/><stop offset="1" stop-color="#1e1e25"/></linearGradient>
<linearGradient id="bt-cabin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9b8" stop-opacity="0"/><stop offset="1" stop-color="#ffcfe0" stop-opacity=".42"/></linearGradient>
<linearGradient id="bt-doorway" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3e2"/><stop offset=".7" stop-color="#ffd7c2"/><stop offset="1" stop-color="#ffb6d2"/></linearGradient>
<linearGradient id="bt-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5c9d" stop-opacity="0"/><stop offset="1" stop-color="#ff5c9d" stop-opacity=".34"/></linearGradient>
<linearGradient id="bt-sheen" gradientUnits="userSpaceOnUse" spreadMethod="repeat" x1="0" y1="0" x2="${TRAIN_W}" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".16" stop-color="#fff" stop-opacity="0"/><stop offset=".22" stop-color="#fff" stop-opacity=".38"/><stop offset=".28" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity=".26"/><stop offset=".66" stop-color="#fff" stop-opacity="0"/><stop offset=".84" stop-color="#fff" stop-opacity="0"/><stop offset=".89" stop-color="#fff" stop-opacity=".34"/><stop offset=".94" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="bt-cityref" gradientUnits="userSpaceOnUse" spreadMethod="repeat" x1="0" y1="0" x2="420" y2="0"><stop offset="0" stop-color="#ff5c9d" stop-opacity="0"/><stop offset=".12" stop-color="#ff5c9d" stop-opacity=".8"/><stop offset=".2" stop-color="#ff5c9d" stop-opacity="0"/><stop offset=".46" stop-color="#ffd49a" stop-opacity="0"/><stop offset=".52" stop-color="#ffd49a" stop-opacity=".9"/><stop offset=".6" stop-color="#ffd49a" stop-opacity="0"/><stop offset=".8" stop-color="#d6e4ff" stop-opacity="0"/><stop offset=".85" stop-color="#d6e4ff" stop-opacity=".7"/><stop offset=".9" stop-color="#d6e4ff" stop-opacity="0"/></linearGradient>
<radialGradient id="bt-nose" gradientUnits="userSpaceOnUse" cx="${L0 + 600}" cy="22" r="190"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></radialGradient>
<radialGradient id="bt-lampg"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".35" stop-color="#fff4ea" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="bt-spillg"><stop offset="0" stop-color="#ffe4cf" stop-opacity=".55"/><stop offset="1" stop-color="#ffe4cf" stop-opacity="0"/></radialGradient>
<linearGradient id="bt-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="bt-mask" maskUnits="userSpaceOnUse" x="0" y="118" width="${TRAIN_W}" height="72"><rect x="0" y="118" width="${TRAIN_W}" height="72" fill="url(#bt-fade)"/></mask>
<clipPath id="bt-clip">${bodies}</clipPath>
<filter id="bt-blur" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;
  // the reflection: the train flipped onto the platform, faded by a mask in the platform's own space
  return `<svg class="bigtrain__svg" viewBox="0 0 ${TRAIN_W} 190" aria-hidden="true" focusable="false">${defs}<g id="bt-train">${g}</g><g mask="url(#bt-mask)"><use href="#bt-train" transform="translate(0 236) scale(1 -1)" opacity=".24"/></g>${spills}</svg>`;
}

/** Every background file, keyed by its path under img/. */
export function lineArtFiles() {
  return cityFiles();
}
