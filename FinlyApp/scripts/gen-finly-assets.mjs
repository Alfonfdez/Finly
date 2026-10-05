// Finly app asset generator.
//
// The transparent `assets/splash-icon.png` is the source of truth for the mark
// (the clean transparent glyph). From it the generator derives the full set:
//   - icon.png                     glyph on the #FFFFFF background (opaque)
//   - favicon.png                  a copy of icon.png (Expo downsizes at export)
//   - android-icon-background.png  solid #FFFFFF, full bleed (Android launcher)
//   - android-icon-foreground.png  glyph in a 500 px box, transparent
//   - android-icon-monochrome.png  white silhouette in a 500 px box
//   - splash-icon.png              glyph in a 760 px box, transparent
//
// The glyph is trimmed to its alpha bounds and re-placed, so re-running is
// idempotent. `icon.png` and `android-icon-background.png` are derived here
// (the app icon can be rebuilt without the externally-designed original).
//
// Run from FinlyApp/ (needs `sharp`, a devDependency):
//   node scripts/gen-finly-assets.mjs                  # write into assets/
//   node scripts/gen-finly-assets.mjs --out some/dir   # write elsewhere (review)
//
// See docs/assets.md.

import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ASSETS = fileURLToPath(new URL('../assets/', import.meta.url));
// --out <dir> writes elsewhere (e.g. a review folder); splash-icon.png is
// always read from assets/.
const outArg = process.argv.indexOf('--out');
const OUT = outArg !== -1 && process.argv[outArg + 1] ? resolve(process.argv[outArg + 1]) : ASSETS;
mkdirSync(OUT, { recursive: true });

const SIZE = 1024;
const LIMIT = 1024 * 1024;
const ICON_GLYPH_BOX = 634;
const SPLASH_GLYPH_BOX = 760;
const FOREGROUND_BOX = 500;
const MONOCHROME_BOX = 500;

// Trim a transparent source PNG to its non-transparent glyph bounds.
async function extractGlyph(source) {
  const buf = await sharp(source).ensureAlpha().raw().toBuffer();
  const px = Math.sqrt(buf.length / 4);

  let minX = px, minY = px, maxX = -1, maxY = -1;
  for (let y = 0; y < px; y++) {
    for (let x = 0; x < px; x++) {
      if (buf[(y * px + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (minX > maxX) throw new Error(`no glyph pixels found in ${source}`);

  const gw = maxX - minX + 1;
  const gh = maxY - minY + 1;
  const glyph = Buffer.alloc(gw * gh * 4);
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const s = ((minY + y) * px + (minX + x)) * 4;
      const d = (y * gw + x) * 4;
      glyph[d] = buf[s];
      glyph[d + 1] = buf[s + 1];
      glyph[d + 2] = buf[s + 2];
      glyph[d + 3] = buf[s + 3];
    }
  }

  return { glyph, gw, gh };
}

function place(base, w, h) {
  return { left: Math.round((base - w) / 2), top: Math.round((base - h) / 2) };
}

async function resizeGlyph(glyphPng, glyph, fitBox) {
  const { gw, gh } = glyph;
  const scale = fitBox / Math.max(gw, gh);
  const w = Math.round(gw * scale);
  const h = Math.round(gh * scale);
  const buffer = await sharp(glyphPng).resize(w, h).png().toBuffer();
  return { buffer, ...place(SIZE, w, h) };
}

// White silhouette: keep the glyph's alpha, force RGB to white.
async function silhouetteGlyph(glyphPng, glyph, fitBox) {
  const { gw, gh } = glyph;
  const scale = fitBox / Math.max(gw, gh);
  const w = Math.round(gw * scale);
  const h = Math.round(gh * scale);
  const src = await sharp(glyphPng).resize(w, h).ensureAlpha().raw().toBuffer();
  const mono = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    mono[i * 4] = 255;
    mono[i * 4 + 1] = 255;
    mono[i * 4 + 2] = 255;
    mono[i * 4 + 3] = src[i * 4 + 3];
  }
  const buffer = await sharp(mono, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  return { buffer, ...place(SIZE, w, h) };
}

async function compose(inner, background) {
  return sharp({ create: { width: SIZE, height: SIZE, channels: 4, background } })
    .composite([{ input: inner.buffer, left: inner.left, top: inner.top }])
    .png()
    .toBuffer();
}

async function writePng(buffer, file, pngOptions) {
  const out = await sharp(buffer).png({ compressionLevel: 9, ...pngOptions }).toBuffer();
  const meta = await sharp(out).metadata();
  if (out.byteLength >= LIMIT) {
    throw new Error(`${file}: ${out.byteLength} bytes after generation (> 1 MB limit)`);
  }
  if (meta.width !== SIZE || meta.height !== SIZE) {
    throw new Error(`${file}: dimensions ${meta.width}x${meta.height}, expected ${SIZE}x${SIZE}`);
  }
  await writeFile(join(OUT, file), out);
  console.log(`${file}: ${(out.byteLength / 1024).toFixed(1)} KiB ${meta.width}x${meta.height}`);
  return out;
}

const OPAQUE_BG = { r: 0xff, g: 0xff, b: 0xff, alpha: 1 };
const TRANSPARENT_BG = { r: 0, g: 0, b: 0, alpha: 0 };

const { glyph, gw, gh } = await extractGlyph(join(ASSETS, 'splash-icon.png'));
const glyphPng = await sharp(glyph, { raw: { width: gw, height: gh, channels: 4 } }).png().toBuffer();
console.log(`source glyph: ${gw}x${gh}`);

// icon.png — glyph on the flat white background (opaque app icon).
const icon = await writePng(await compose(await resizeGlyph(glyphPng, { gw, gh }, ICON_GLYPH_BOX), OPAQUE_BG), 'icon.png');

// favicon.png — same artwork as icon.png (Expo resizes at export).
await writePng(await sharp(icon).toBuffer(), 'favicon.png');

// android-icon-background.png — flat white full-bleed background; Android composes it with the foreground (launcher icon).
await writePng(await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: OPAQUE_BG } }).png().toBuffer(), 'android-icon-background.png');

// android-icon-foreground.png — glyph in a 500 px box, transparent.
await writePng(await compose(await resizeGlyph(glyphPng, { gw, gh }, FOREGROUND_BOX), TRANSPARENT_BG), 'android-icon-foreground.png', {
  palette: true,
  quality: 90,
});

// android-icon-monochrome.png — white silhouette in a 500 px box.
await writePng(await compose(await silhouetteGlyph(glyphPng, { gw, gh }, MONOCHROME_BOX), TRANSPARENT_BG), 'android-icon-monochrome.png', {
  palette: true,
  quality: 100,
  colours: 4,
});

// splash-icon.png — glyph in a 760 px box, transparent (idempotent re-place).
await writePng(await compose(await resizeGlyph(glyphPng, { gw, gh }, SPLASH_GLYPH_BOX), TRANSPARENT_BG), 'splash-icon.png');

console.log('done.');
