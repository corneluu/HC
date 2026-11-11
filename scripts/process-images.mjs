// Usage: node scripts/process-images.mjs "<folder with originals>"
// Writes resized AVIF/WebP to public/photos (sharp drops EXIF/GPS unless told otherwise).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const source = process.argv[2];
if (!source) throw new Error('Pass the folder with the concert originals.');
const WIDTHS = [640, 1200, 1920];
const out = 'public/photos';
const manifestPath = 'src/data/photos.generated.json';

// name: original file, optional extract (crop on the auto-rotated original)
const PICKS = {
  'concert-5-ani/grup-scena': { file: 'IMG_1363.JPG' },
  'concert-5-ani/grup-aplauze': { file: 'IMG_1367.JPG' },
  'concert-5-ani/alelia-dirijat': { file: 'IMG_1357.JPG' },
  'concert-5-ani/alelia-cor': { file: 'IMG_1356.JPG' },
  'concert-5-ani/voci-si-band': { file: 'IMG_1351.JPG' },
  'concert-5-ani/voci-si-band-2': { file: 'IMG_1352.JPG' },
  'concert-5-ani/baieti-cantand': { file: 'IMG_1325.JPG' },
  'concert-5-ani/baieti-grup': { file: 'IMG_1350.JPG' },
  'concert-5-ani/sala-mare': { file: 'IMG_1292.JPG' },
  'dirijor/la-pupitru': { file: 'IMG_1357.JPG', extract: { left: 2350, top: 2100, width: 1300, height: 1250 } },
};

const manifest = {};
for (const [name, { file, extract }] of Object.entries(PICKS)) {
  let base = sharp(path.join(source, file)).rotate();
  if (extract) base = sharp(await base.toBuffer()).extract(extract);
  const buf = await base.toBuffer();
  const meta = await sharp(buf).metadata();
  fs.mkdirSync(path.join(out, path.dirname(name)), { recursive: true });
  const widths = WIDTHS.filter((w) => w <= meta.width);
  for (const w of widths) {
    const r = sharp(buf).resize({ width: w });
    await r.clone().avif({ quality: 52, effort: 5 }).toFile(`${out}/${name}-${w}.avif`);
    await r.clone().webp({ quality: 74 }).toFile(`${out}/${name}-${w}.webp`);
  }
  const { dominant: d } = await sharp(buf).stats();
  manifest[name] = { w: meta.width, h: meta.height, widths, color: `rgb(${d.r},${d.g},${d.b})` };
  console.log(name, meta.width, meta.height);
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + '\n');
