import sharp from 'sharp';
import { stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ASSETS = fileURLToPath(new URL('../assets/', import.meta.url));
const SIZE = 1024;
const SPLASH_GLYPH_WIDTH = 760;
const FOREGROUND_BOX = 500;
const MONOCHROME_BOX = 500;

async function extractGlyph(source) {
  const buf = await sharp(source).ensureAlpha().raw().toBuffer();
  const px = Math.sqrt(buf.length / 4);
  const alpha = new Uint8Array(px * px);
  const rgb = new Uint8Array(px * px * 3);

  for (let i = 0; i < px * px; i++) {
    const r = buf[i * 4];
    const g = buf[i * 4 + 1];
    const b = buf[i * 4 + 2];
    const min = Math.min(r, g, b);
    rgb[i * 3] = r;
    rgb[i * 3 + 1] = g;
    rgb[i * 3 + 2] = b;

    let a = (245 - min) / 30;
    a = Math.max(0, Math.min(1, a));
    alpha[i] = Math.round(a * 255);
  }

  let minX = px, minY = px, maxX = -1, maxY = -1;
  for (let y = 0; y < px; y++) {
    for (let x = 0; x < px; x++) {
      if (alpha[y * px + x] > 60) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (minX > maxX) throw new Error('no glyph pixels found');

  const gw = maxX - minX + 1;
  const gh = maxY - minY + 1;
  const glyph = Buffer.alloc(gw * gh * 4);
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const sx = minY + y;
      const dx = minX + x;
      glyph[(y * gw + x) * 4] = rgb[(sx * px + dx) * 3];
      glyph[(y * gw + x) * 4 + 1] = rgb[(sx * px + dx) * 3 + 1];
      glyph[(y * gw + x) * 4 + 2] = rgb[(sx * px + dx) * 3 + 2];
      glyph[(y * gw + x) * 4 + 3] = alpha[sx * px + dx];
    }
  }

  return { glyph, gw, gh };
}

function place(base, w, h) {
  return { left: Math.round((base - w) / 2), top: Math.round((base - h) / 2) };
}

async function writePng(buffer, path) {
  const info = await sharp(buffer)
    .png({ compressionLevel: 9 })
    .toFile(path);
  console.log(`${path}: ${info.size / 1024} KiB ${info.width}x${info.height}`);
}

const iconPath = join(ASSETS, 'icon.png');
const { glyph, gw, gh } = await extractGlyph(iconPath);
const glyphPng = await sharp(glyph, { raw: { width: gw, height: gh, channels: 4 } })
  .png()
  .toBuffer();

async function compositeCanvas(targetW, targetH, fitBox, fileName) {
  const scale = fitBox / Math.max(gw, gh);
  const w = Math.round(gw * scale);
  const h = Math.round(gh * scale);
  const resized = await sharp(glyphPng).resize(w, h).png().toBuffer();
  const pos = place(SIZE, w, h);
  const canvas = await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: resized, left: pos.left, top: pos.top }])
    .png()
    .toBuffer();
  await writePng(canvas, join(ASSETS, fileName));
  console.log(`  glyph placed at (${pos.left},${pos.top}) size ${w}x${h}`);
}

async function compositeMonochrome(fitBox, fileName) {
  const scale = fitBox / Math.max(gw, gh);
  const w = Math.round(gw * scale);
  const h = Math.round(gh * scale);
  const mono = Buffer.alloc(w * h * 4);
  {
    const resized = await sharp(glyphPng).resize(w, h).ensureAlpha().raw().toBuffer();
    for (let i = 0; i < w * h; i++) {
      mono[i * 4] = 255;
      mono[i * 4 + 1] = 255;
      mono[i * 4 + 2] = 255;
      mono[i * 4 + 3] = resized[i * 4 + 3];
    }
  }
  const pos = place(SIZE, w, h);
  const canvas = await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: await sharp(mono, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer(), left: pos.left, top: pos.top }])
    .png()
    .toBuffer();
  await writePng(canvas, join(ASSETS, fileName));
  console.log(`  glyph placed at (${pos.left},${pos.top}) size ${w}x${h}`);
}

const before = {};
for (const name of ['splash-icon.png', 'android-icon-foreground.png', 'android-icon-monochrome.png']) {
  before[name] = (await stat(join(ASSETS, name))).size;
}

console.log(`source glyph: ${gw}x${gh}`);
await compositeCanvas(SIZE, SIZE, SPLASH_GLYPH_WIDTH, 'splash-icon.png');
await compositeCanvas(SIZE, SIZE, FOREGROUND_BOX, 'android-icon-foreground.png');
await compositeMonochrome(MONOCHROME_BOX, 'android-icon-monochrome.png');

console.log('before:', Object.fromEntries(Object.entries(before).map(([k, v]) => [k, `${(v / 1024).toFixed(1)} KiB`])));