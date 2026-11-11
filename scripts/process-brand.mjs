// Usage: node scripts/process-brand.mjs "<Harmonia_Christi_faraBG.png>" — logo sizes, favicon, Open Graph image.
import sharp from 'sharp';
import fs from 'node:fs';
const src = process.argv[2];
if (!src) throw new Error('Pass the logo PNG.');
for (const w of [160, 480, 960]) await sharp(src).resize(w).webp({ quality: 88 }).toFile(`public/brand/logo-${w}.webp`);
// The kite alone, without the lettering, for small sizes.
const kite = await sharp(src).extract({ left: 180, top: 10, width: 640, height: 900 }).png().toBuffer();
await sharp(kite).resize({ height: 96 }).webp({ quality: 90 }).toFile('public/brand/kite-96.webp');
const icon = await sharp(kite).resize(220, 300, { fit: 'contain', background: '#ffffff00' }).toBuffer();
await sharp({ create: { width: 320, height: 320, channels: 4, background: '#ffffff' } }).composite([{ input: icon }]).png().toFile('src/app/icon.png');

// favicon.ico holding one PNG, and the Open Graph card.
const png = await sharp('src/app/icon.png').resize(64, 64).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header[6] = 64; header[7] = 64; header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
fs.writeFileSync('src/app/favicon.ico', Buffer.concat([header, png]));

const logo = await sharp(src).resize(520).png().toBuffer();
const photo = await sharp('public/photos/concert-5-ani/grup-scena-1200.webp').resize(620, 630, { fit: 'cover', position: 'bottom' }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#ffffff' } })
  .composite([{ input: logo, left: 30, top: 55 }, { input: photo, left: 580, top: 0 }]).jpeg({ quality: 82 }).toFile('public/brand/og.jpg');
