/**
 * Prepares a photograph to hang in the villa: `node scripts/frame-photo.mjs <file>`
 * Writes public/art/portrait.webp, which Artwork picks up on the next build.
 *
 * Two things it has to handle.
 *
 * A cutout has no background, and a framed print does. Dropping a transparent
 * subject straight into the frame leaves the mount board showing through,
 * which reads as a sticker rather than a photograph — so anything with an
 * alpha channel gets composited onto a soft studio sweep first. The sweep is
 * light because the subject in a portrait like this is usually dark, and a
 * dark suit on a dark ground is a silhouette.
 *
 * And a frame is a fixed shape. Rather than squash the picture to fit, the
 * canvas is built at a print portrait ratio and the subject is placed into it
 * with headroom above and the crop taken below the waist, which is where a
 * half-length portrait is normally cut.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { statSync } from 'node:fs';

const src = process.argv[2];
if (!src) {
  console.error('usage: node scripts/frame-photo.mjs <path-to-photo>');
  process.exit(1);
}

const OUT = 'public/art';
await mkdir(OUT, { recursive: true });

// 2:3, the ratio a portrait print is normally made at.
const W = 620;
const H = 930;

const meta = await sharp(src).metadata();
console.log('source   ', meta.width + 'x' + meta.height, 'alpha=' + !!meta.hasAlpha);

let subject;
if (meta.hasAlpha) {
  // Trim the transparent margin so the framing is driven by the subject and
  // not by however much empty space the cutout was saved with.
  subject = await sharp(src).trim({ threshold: 1 }).toBuffer();
} else {
  subject = await sharp(src).toBuffer();
}
const sm = await sharp(subject).metadata();
console.log('subject  ', sm.width + 'x' + sm.height);

// Fit the subject to the canvas width, leaving a margin either side, then sit
// it low in the frame so there is headroom above the head.
const inset = Math.round(W * 0.88);
const scaled = await sharp(subject).resize({ width: inset }).toBuffer();
const scm = await sharp(scaled).metadata();
const left = Math.round((W - scm.width) / 2);
const top = Math.round(H * 0.1);

const sweep = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#E8E3D8"/>
        <stop offset="62%"  stop-color="#D2CBBD"/>
        <stop offset="100%" stop-color="#B4AC9C"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
  </svg>`);

await sharp(sweep)
  .composite([{ input: scaled, left, top }])
  .resize(W, H, { fit: 'cover', position: 'top' })
  .webp({ quality: 88, effort: 6 })
  .toFile(`${OUT}/portrait.webp`);

console.log('written  ', OUT + '/portrait.webp', statSync(`${OUT}/portrait.webp`).size, 'bytes');
console.log('\nNow: npm run build');
