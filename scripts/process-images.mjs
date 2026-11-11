// Usage: node scripts/process-images.mjs "<concert originals>" "<Italy tour originals>"
// Entries already in the manifest are kept; delete one from it to regenerate that image.
// Writes resized AVIF/WebP to public/photos (sharp drops EXIF/GPS unless told otherwise).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [concertDir, italyDir] = process.argv.slice(2);
if (!concertDir || !italyDir) throw new Error('Pass the concert folder and the Italy tour folder.');
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
  // Photo by Eugen Ivuț, given by the owner; the crop leaves out his watermark, so the caption credits him.
  'dirijor/portret': { file: 'D:/Media/Photos/Harmonia Christi_files/dirijor/foto-eugen-ivut.jpg', extract: { left: 370, top: 200, width: 868, height: 868 } },
  'italia-2026/grup-lac': { file: 'IMG_3425.JPG', italy: true },
  'italia-2026/cor-altar': { file: 'IMG_2555.JPG', italy: true },
  'italia-2026/grup-panorama': { file: 'IMG_0052.JPG', italy: true },
  'italia-2026/voci-aproape': { file: 'IMG_0744.JPG', italy: true },
  'italia-2026/grup-munti': { file: 'IMG_2677.JPG', italy: true },
  'italia-2026/in-biserica': { file: 'IMG_0750.JPG', italy: true },
  'italia-2026/supa': { file: 'IMG_1794.JPG', italy: true },
  'italia-2026/esarfe-galbene': { file: 'IMG_2681.JPG', italy: true },
  'italia-2026/bratele-sus': { file: 'IMG_2393.JPG', italy: true },
  'italia-2026/aplauze': { file: 'IMG_1904.JPG', italy: true },
  'italia-2026/baieti-negru': { file: 'IMG_2330.JPG', italy: true },
  'italia-2026/cu-bagajele': { file: 'IMG_0226.JPG', italy: true },
  'italia-2026/biserica-plina': { file: 'IMG_2467.JPG', italy: true },
  'italia-2026/grup-altar': { file: 'IMG_1062.JPG', italy: true },
  'italia-2026/servim': { file: 'IMG_1891.JPG', italy: true },
  'italia-2026/patru-voci': { file: 'IMG_2475.JPG', italy: true },
  'italia-2026/seara-impreuna': { file: 'IMG_2921.JPG', italy: true },
  'italia-2026/concert-din-banci': { file: 'IMG_0704.JPG', italy: true },
  'italia-2026/cantam-la-masa': { file: 'IMG_1902.JPG', italy: true },
  'italia-2026/veselie': { file: 'IMG_2898.JPG', italy: true },
  'italia-2026/vesminte': { file: 'IMG_1079.JPG', italy: true },
};

const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
for (const [name, { file, extract, italy }] of Object.entries(PICKS)) {
  if (manifest[name]) continue;
  let base = sharp(path.isAbsolute(file) ? file : path.join(italy ? italyDir : concertDir, file)).rotate();
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
