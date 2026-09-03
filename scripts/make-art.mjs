/**
 * Generates the canvases that hang on the villa's walls, into public/art.
 * Run with `node scripts/make-art.mjs` (needs sharp; not a build dependency).
 *
 * A framed picture needs an actual image — a flat coloured rectangle in a
 * frame reads as a missing texture, which is worse than no frame at all. These
 * are abstract on purpose: anything representational would be a photograph of
 * somewhere the house is not, and at the size they appear on screen the point
 * is the tonal block on the wall, not the subject.
 *
 * To hang a photograph of your own instead, just overwrite one of the files in
 * public/art — Artwork reads the picture's proportions off the texture, so a
 * different aspect ratio gives a differently shaped frame rather than a
 * stretched image. No code change.
 *
 * The palette is the building's own: bone, charcoal, timber, and the muted
 * teal from the pool.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { statSync } from 'node:fs';

const OUT = 'public/art';
await mkdir(OUT, { recursive: true });

const svg = {
  /** Horizon: warm sky over a dark land band. Sits well over a sideboard. */
  horizon: (w, h) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#E9DFCE"/>
          <stop offset="55%" stop-color="#D8C9B2"/>
          <stop offset="100%" stop-color="#BFAE95"/>
        </linearGradient>
        <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#4A4C46"/>
          <stop offset="100%" stop-color="#2E302C"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#sky)"/>
      <circle cx="${w * 0.68}" cy="${h * 0.34}" r="${h * 0.13}" fill="#F1E7D6" opacity="0.85"/>
      <rect y="${h * 0.66}" width="${w}" height="${h * 0.34}" fill="url(#land)"/>
      <rect y="${h * 0.655}" width="${w}" height="${h * 0.006}" fill="#9E9384" opacity="0.7"/>
    </svg>`,

  /** Strata: horizontal bands, the safest thing to hang over a bed. */
  strata: (w, h) => {
    const stops = [
      ['#F0EADD', 0.22], ['#D3C6B0', 0.12], ['#A79A86', 0.07],
      ['#5E635C', 0.16], ['#37564F', 0.09], ['#8C7C63', 0.11],
      ['#C4B79F', 0.23],
    ];
    let y = 0;
    const rects = stops
      .map(([c, f]) => {
        const bh = h * f;
        const r = `<rect y="${y.toFixed(1)}" width="${w}" height="${(bh + 1).toFixed(1)}" fill="${c}"/>`;
        y += bh;
        return r;
      })
      .join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${rects}</svg>`;
  },

  /** Arcs: two overlapping forms, the most "gallery" of the three. */
  arcs: (w, h) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect width="${w}" height="${h}" fill="#EFE9DC"/>
      <circle cx="${w * 0.42}" cy="${h * 0.44}" r="${w * 0.34}" fill="#37564F" opacity="0.88"/>
      <circle cx="${w * 0.64}" cy="${h * 0.62}" r="${w * 0.26}" fill="#B4783F" opacity="0.75"/>
      <rect x="${w * 0.1}" y="${h * 0.80}" width="${w * 0.8}" height="${h * 0.004}" fill="#33302B"/>
    </svg>`,
};

const jobs = [
  ['horizon', 900, 620],
  ['strata', 640, 880],
  ['arcs', 640, 880],
];

for (const [name, w, h] of jobs) {
  await sharp(Buffer.from(svg[name](w, h)))
    .webp({ quality: 86, effort: 6 })
    .toFile(`${OUT}/${name}.webp`);
  console.log(name.padEnd(9), w + 'x' + h, statSync(`${OUT}/${name}.webp`).size, 'bytes');
}
