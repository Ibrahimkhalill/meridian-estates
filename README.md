# MERIDIAN°

A luxury real-estate landing page whose hero is a **real interactive WebGL villa** — not a
pre-rendered video or a GIF — that you walk through by scrolling: across the lawn, up the
entrance steps, through the front door, across the living room, **up an actual staircase**,
into the bedroom, and out onto the balcony.

Day and night lighting, switchable live.

---

## Why it's built this way

The obvious way to ship a "3D" hero is to render it offline and play the video. That was
measured and rejected: a comparable cinematic hero elsewhere ships a **29.7 MB MP4**. The
whole 3D chunk here is 416 kB gzipped and it is genuinely interactive.

Downloaded models were rejected for the same reason — the Khronos sample GLBs run 2.9 MB
(`VirtualCity`) to 11.2 MB (`CarConcept`). A modern villa *is* boxes, slabs and glass, so
every piece of geometry is built from primitives at runtime and costs 0 MB.

## Stack

React 19 · TypeScript · Vite 6 · Tailwind 3 · three.js · @react-three/fiber · drei · postprocessing

## Assets

| What | Source | Licence |
|---|---|---|
| PBR textures (oak, stone, concrete, plaster, grass, bark, marble) | [Poly Haven](https://polyhaven.com) | CC0 |
| HDRI sky, day + night | Poly Haven | CC0 |
| Photography in the sections below the hero | [Unsplash](https://unsplash.com) | Unsplash licence |

Every surface carries colour, normal and roughness maps. Nothing ships bare — an untextured
material is the single clearest tell that a scene is CG.

## Notes for anyone working on this

A few things cost real time to find, so they are worth knowing up front.

**Geometry has to be hollow.** The stone core was originally two solid blocks. The interior
runs `x -5.7..7.7`, and those blocks spanned `x -5.7..-1.1` and `x 4.1..6.7` — which meant the
sofa was buried inside one and *the entire staircase was inside the other*. That is why the
climb read as going up through solid rock. Both wings had the same problem: solid boxes with
glazing laid on the front face, so the windows transmitted onto a wall 50 mm behind them and
looked like frosted grey panels. Glass only reads as glass when there is a room behind it.

**Check the camera against the geometry numerically, not by eye.** Several defects were only
found by computing them:

- the balcony rail sat 39° below the lens axis when the lens only sees 31°, so it was off the
  bottom of frame entirely and the shot read as standing at an unguarded edge;
- the path crossed `x 2.8` at `z -2.76`, straight through the stairwell balustrade;
- the entrance step spanned `y 0.20..0.40` while the paving spanned `0.24..0.30` over the same
  footprint — two surfaces in one plane, so it flickered;
- trees were scattered from 30 units out while the camera arc reaches 50, so a trunk filled the
  middle of the establishing shot.

**`transmission` is expensive.** Each transmissive material makes three.js render the whole
scene again into a buffer, every frame. Five of them plus ~740 draw calls is what made the
scroll stutter. Plain alpha with a strong environment reflection reads the same at 60 mm
thickness and costs one ordinary transparent surface. That change alone removed five full
scene passes per frame.

**Joints have to be gaps, not strips.** Paving joints drawn as thin strips laid on top of the
slab catch the sun and alias into bright lines that read as road markings. The terrace is a
dark base with 45 separate slabs set on it, so the gaps genuinely fall into shadow.

**Textures need a real-world scale.** Stone at `repeat [4,3]` on a 4.6 × 9 wall gives blocks
1.2 × 3 units across — cartoon masonry. And `useTexture` caches by URL, so clone before
mutating or every surface sharing a set inherits the last repeat applied.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Credits

Built by Ibrahim Khalil. Textures and HDRIs from Poly Haven (CC0); photography from Unsplash.
