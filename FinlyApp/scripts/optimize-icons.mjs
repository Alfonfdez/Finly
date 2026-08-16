import sharp from 'sharp';
import { stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIMIT = 1024 * 1024;
const ASSETS = fileURLToPath(new URL('../assets/', import.meta.url));

const targets = [
  { name: 'android-icon-foreground.png', palette: true, quality: 90 },
  { name: 'android-icon-monochrome.png', palette: true, quality: 100, colours: 4 },
];

for (const target of targets) {
  const file = join(ASSETS, target.name);
  const before = (await stat(file)).size;

  const image = sharp(file);
  const meta = await image.metadata();
  const out = await image
    .resize(meta.width, meta.height)
    .png({ compressionLevel: 9, palette: target.palette, quality: target.quality, colours: target.colours })
    .toBuffer();

  if (out.byteLength >= LIMIT) {
    console.error(`${target.name}: still ${out.byteLength} bytes after quantization (> 1 MB limit)`);
    process.exit(1);
  }

  const outMeta = await sharp(out).metadata();
  if (outMeta.width !== meta.width || outMeta.height !== meta.height) {
    console.error(`${target.name}: dimensions changed ${meta.width}x${meta.height} -> ${outMeta.width}x${outMeta.height}`);
    process.exit(1);
  }

  await writeFile(file, out);
  console.log(`${target.name}: ${(before / 1024).toFixed(1)} KiB -> ${(out.byteLength / 1024).toFixed(1)} KiB (${outMeta.width}x${outMeta.height}, ${outMeta.format})`);
}
