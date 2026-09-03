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
 * canvas is built at a print portrait ratio and the subject is scaled wider
 * than it, so the sides and the lower body fall outside the crop. That is
 * deliberate: hung in the villa the frame is 1.5 units tall and several metres
 * from the lens, and a full-length figure at that size is a dark smudge. Cut
 * to the chest, the face is large enough to be a face.
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

// Wider than the canvas, so the crop closes in on the head and chest.
const scaled = await sharp(subject).resize({ width: Math.round(W * 1.16) }).toBuffer();
const scm = await sharp(scaled).metadata();

// sharp will not composite an input larger than its base, so the sweep is
// built at whatever size holds the whole subject and the finished picture is
// cut out of it afterwards.
const top = Math.round(H * 0.045);
const CW = Math.max(W, scm.width);
const CH = Math.max(H, top + scm.height);

const sweep = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#E8E3D8"/>
        <stop offset="52%"  stop-color="#D2CBBD"/>
        <stop offset="100%" stop-color="#B4AC9C"/>
      </linearGradient>
    </defs>
    <rect width="${CW}" height="${CH}" fill="url(#g)"/>
  </svg>`);

// Two passes: sharp reorders extract ahead of composite in a single pipeline,
// which shrinks the base before the subject is laid on it and then refuses the
// oversized input. Compositing to a buffer first sidesteps the ordering.
const mounted = await sharp(sweep)
  .composite([{ input: scaled, left: Math.round((CW - scm.width) / 2), top }])
  .png()
  .toBuffer();

await sharp(mounted)
  .extract({ left: Math.round((CW - W) / 2), top: 0, width: W, height: H })
  .webp({ quality: 88, effort: 6 })
  .toFile(`${OUT}/portrait.webp`);

console.log('canvas   ', CW + 'x' + CH, '-> crop', W + 'x' + H);
console.log('written  ', OUT + '/portrait.webp', statSync(`${OUT}/portrait.webp`).size, 'bytes');
console.log('\nNow: npm run build');
