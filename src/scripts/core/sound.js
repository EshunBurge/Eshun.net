// The train's voice: a two-note horn and the rush of air as it passes, made with Web Audio (no
// sound files). Only ever played in answer to a click, a tap or a key.
let ctx = null;
function audio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = ctx || new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Two blasts on a three-note chord, the second one longer. */
export function horn() {
  const a = audio();
  if (!a) return;
  const out = a.createGain();
  out.gain.value = 0.0001;
  const tone = a.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 1600;
  tone.connect(out);
  out.connect(a.destination);
  const t0 = a.currentTime + 0.02;
  for (const [start, len] of [[0, 0.32], [0.42, 0.8]]) {
    const t = t0 + start;
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.22, t + 0.04);
    out.gain.setValueAtTime(0.22, t + len - 0.08);
    out.gain.exponentialRampToValueAtTime(0.0001, t + len);
  }
  for (const f of [277.18, 349.23, 415.3]) {
    const o = a.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f * 0.97, t0);
    o.frequency.linearRampToValueAtTime(f, t0 + 0.06);
    const g = a.createGain();
    g.gain.value = 0.2;
    o.connect(g);
    g.connect(tone);
    o.start(t0);
    o.stop(t0 + 1.3);
  }
}

/** A short rush of filtered noise, rising and falling. */
export function whoosh(duration = 1.2) {
  const a = audio();
  if (!a) return;
  const len = Math.floor(a.sampleRate * duration);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 0.8;
  const g = a.createGain();
  const t = a.currentTime;
  bp.frequency.setValueAtTime(400, t);
  bp.frequency.exponentialRampToValueAtTime(1800, t + duration * 0.5);
  bp.frequency.exponentialRampToValueAtTime(500, t + duration);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.18, t + duration * 0.45);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  src.connect(bp);
  bp.connect(g);
  g.connect(a.destination);
  src.start(t);
  src.stop(t + duration);
}
