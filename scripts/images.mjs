// scripts/images.mjs
// ---------------------------------------------------------------------------
// One-time / occasional image pipeline (needs the `sharp` dev dependency).
//
//   1. Put original images in  assets-src/<folder>/<name>.(jpg|png|webp)
//   2. Run                      npm run images
//   3. Reference them in data   img('photo/prague')  →  public/img/photo/prague-*.webp
//
// For every source it writes responsive WebP renditions (metadata stripped —
// no EXIF / GPS ever reaches the public site) and records the intrinsic size,
// a dominant colour and a tiny blurred placeholder in public/img/manifest.json.
// The site build reads that manifest; it never needs sharp itself.
// ---------------------------------------------------------------------------
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'assets-src');
const OUT = path.join(ROOT, 'public', 'img');
const MANIFEST = path.join(OUT, 'manifest.json');
const WIDTHS = [480, 960, 1600, 2400];
const force = process.argv.includes('--force');

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(jpe?g|png|webp)$/i.test(e.name)) out.push(p);
  }
  return out;
}

const exists = (p) => fs.stat(p).then((s) => s, () => null);

async function main() {
  const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8').catch(() => '{}'));
  const files = await walk(SRC);
  let made = 0;
  for (const file of files) {
    const rel = path.relative(SRC, file).replace(/\\/g, '/');
    const key = rel.replace(/\.[^.]+$/, '');
    const srcStat = await fs.stat(file);
    const first = path.join(OUT, `${key}-${WIDTHS[0]}.webp`);
    const firstStat = await exists(first);
    if (!force && manifest[key] && firstStat && firstStat.mtimeMs > srcStat.mtimeMs) continue;

    const img = sharp(file, { limitInputPixels: false }).rotate(); // honour EXIF orientation, then drop it
    const meta = await img.metadata();
    const w0 = meta.autoOrient?.width ?? meta.width;
    const h0 = meta.autoOrient?.height ?? meta.height;
    const isPhoto = /^(photo|people)\//.test(key);
    const quality = isPhoto ? 78 : 82;
    const widths = WIDTHS.filter((w) => w < w0);
    if (!widths.length || widths[widths.length - 1] < Math.min(w0, WIDTHS.at(-1))) widths.push(Math.min(w0, WIDTHS.at(-1)));

    await fs.mkdir(path.dirname(path.join(OUT, key)), { recursive: true });
    for (const w of widths) {
      await sharp(file, { limitInputPixels: false }).rotate()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality, effort: 5, smartSubsample: true })
        .toFile(path.join(OUT, `${key}-${w}.webp`));
    }
    const { dominant } = await sharp(file).stats();
    const lqipBuf = await sharp(file).rotate().resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
    manifest[key] = {
      w: w0,
      h: h0,
      widths,
      color: `#${[dominant.r, dominant.g, dominant.b].map((c) => c.toString(16).padStart(2, '0')).join('')}`,
      lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}`,
      alpha: !!meta.hasAlpha,
    };
    made++;
    process.stdout.write(`  ✓ ${key} (${w0}×${h0}) → ${widths.join(', ')}\n`);
  }
  // drop entries whose source disappeared
  const keys = new Set(files.map((f) => path.relative(SRC, f).replace(/\\/g, '/').replace(/\.[^.]+$/, '')));
  for (const k of Object.keys(manifest)) if (!keys.has(k)) delete manifest[k];
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(MANIFEST, JSON.stringify(sorted, null, 1) + '\n');
  console.log(`images: ${made} processed, ${Object.keys(sorted).length} in manifest`);
}

main().catch((e) => { console.error(e); process.exit(1); });
