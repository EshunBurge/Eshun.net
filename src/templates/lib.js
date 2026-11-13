// src/templates/lib.js — the tiny template toolkit (no dependencies).
//
// html`...`  tagged template that auto-escapes interpolated strings,
//            flattens arrays and skips null / false.
// raw(str)   marks a string as already-safe HTML.

class Raw {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}

export const raw = (s) => new Raw(String(s ?? ''));

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function render(v) {
  if (v === null || v === undefined || v === false || v === true) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(render).join('');
  return esc(v);
}

export function html(strings, ...vals) {
  let out = strings[0];
  for (let i = 0; i < vals.length; i++) out += render(vals[i]) + strings[i + 1];
  return new Raw(out);
}

export const when = (cond, fn) => (cond ? fn() : '');

/** Join class names, skipping falsy ones. */
export const cx = (...c) => c.filter(Boolean).join(' ');

/** "PROGR" + "·ESHUN" as typeset markup. */
export const word = (prefix, { tag = 'span', cls = '' } = {}) =>
  raw(`<${tag} class="${cx('lex', cls)}"><span class="lex__pre">${esc(prefix)}</span><span class="lex__dot" aria-hidden="true">·</span><span class="lex__suf">ESHUN</span></${tag}>`);

/** Accessible name for a lexicon word, e.g. "Progreshun". */
export const wordLabel = (prefix) => prefix.charAt(0) + prefix.slice(1).toLowerCase() + 'eshun';

/** Crop marks for the four corners of a positioned element. */
export const cropMarks = () =>
  raw('<span class="crop crop--tl" aria-hidden="true"></span><span class="crop crop--tr" aria-hidden="true"></span><span class="crop crop--bl" aria-hidden="true"></span><span class="crop crop--br" aria-hidden="true"></span>');

/** Small registration target (⊕) used as a print detail. */
export const regMark = (cls = '') =>
  raw(`<svg class="${cx('reg', cls)}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="6.5"/><path d="M12 0v24M0 12h24"/></svg>`);

export const arrow = (dir = 'right') => {
  const d = {
    right: 'M2 12h18M14 6l6 6-6 6',
    left: 'M22 12H4M10 6l-6 6 6 6',
    up: 'M12 22V4M6 10l6-6 6 6',
    down: 'M12 2v18M6 14l6 6 6-6',
    out: 'M7 17L17 7M9 7h8v8',
  }[dir];
  return raw(`<svg class="arrow arrow--${dir}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`);
};

/** Roman numerals for folios. */
export const roman = (n) => {
  const t = [[10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']];
  let s = '';
  for (const [v, r] of t) while (n >= v) { s += r; n -= v; }
  return s;
};

export const pad = (n, w = 2) => String(n).padStart(w, '0');
