# Prompt: MERIDIAN — Real Estate Landing Page with a Real 3D Hero

## 0. Why this is built the way it is

Prompt libraries sell "3D" landing pages that are actually pre-rendered media. Checked against the live assets:

| What they ship | Actual file |
|---|---|
| Gallery previews | `image/gif` |
| "3D" character hero | `image/png`, 2.5 MB |
| Cinematic hero | `video/mp4`, **29.7 MB** |
| `.glb` / `.gltf` / three.js / Spline | **none found** |

It looks three-dimensional and cannot be touched. This page inverts that: the hero is a **real WebGL scene you can orbit**, and it ships **less** than a single pre-rendered video would.

---

## 1. Brief

Build a single-page **"MERIDIAN"** luxury real-estate landing page using **React 19 + Vite + TypeScript + Tailwind CSS + React Three Fiber + drei + Lucide React**.

The hero is a live 3D scene: a modern villa the visitor can drag to orbit, lit by a real HDRI sky, with a **day ⇄ night** switch that turns the house lights on. Everything below the hero is a conventional long-scroll page that reveals on scroll.

Calm, architectural, high-key. Three breakpoints (mobile, `md`, `lg+`).

---

## 2. Fonts (Google Fonts)

- **Instrument Sans** (400, 500, 600) — body, nav, labels, spec rows
- **Instrument Serif** (400, 400 italic) — display: logo, headline, section headings

```
https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap
```

`.font-display { font-family: 'Instrument Serif', serif; }`
`body { font-family: 'Instrument Sans', sans-serif; }`

Sentence case throughout. No all-caps headlines.

---

## 3. Color Palette

| Role | Hex |
|---|---|
| Page background | `#F6F5F2` bone |
| Raised surface / cards | `#FFFFFF` |
| Section band | `#EDEBE6` |
| Hairline | `#DEDBD4` |
| Text primary | `#16150F` |
| Text muted | `#6E6B61` |
| Accent | `#3D5A45` deep green |
| Accent hover | `#31492F` |
| Text on dark | `#F6F5F2` |
| Night sky wash | `#0E1116` |

One accent. The green only appears on prices, the day/night switch, and primary buttons.

---

## 4. Assets

### HDRI environment lighting — the thing that makes it look real

Poly Haven, CC0, verified `Access-Control-Allow-Origin: *`:

| Mode | URL | Size |
|---|---|---|
| Day | `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloofendal_43d_clear_puresky_1k.hdr` | 1.2 MB |
| Night | `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dikhololo_night_1k.hdr` | 1.7 MB |

Load the day HDRI eagerly; fetch the night one only on first toggle.

### 3D geometry — none downloaded

The villa is **built from primitives at runtime**. A modern house *is* boxes, slabs and glass, so it models cleanly and costs 0 MB. Measured alternatives, all rejected: Khronos `CarConcept` 11.2 MB, `ToyCar` 5.2 MB, `VirtualCity` 2.9 MB.

### Photography — Unsplash

Pattern: `https://images.unsplash.com/photo-{id}?w={w}&q=80&auto=format&fit=crop`

| Slot | Photo id |
|---|---|
| Featured — Aether Heights | `1706808849780-7a04fbac83ef` |
| Featured — Azure Sanctuary | `1613490493576-7fde63acd811` |
| Featured — Summit Pavilion | `1706855203772-c249b75fe016` |
| Featured — Ridge House | `1622015663381-d2e05ae91b72` |
| Exclusive collection (dusk glass box) | `1748063578185-3d68121b11ff` |
| Editorial — entry at dusk | `1706808849777-96e0d7be3bb7` |
| Interior — kitchen | `1628745277862-bc0b2d68c50c` |
| Interior — living room | `1628744876525-f2678d8af47f` |
| Stone villa | `1706808849802-8f876ade0d1f` |

---

## 5. Section by Section

1. **Nav** — sticky, `backdrop-blur`, hairline bottom. Logo `MERIDIAN` in display + a small `°`. Links: Properties, Mortgage (green "New" pill), Company, Careers, Journal. Right: "List a property" ghost button.

2. **Hero** — `100svh` minus nav. Copy sits over the canvas, top-left; the 3D scene fills the whole section.
   - Headline, display 400, `clamp(38px, 5.4vw, 88px)`, `line-height: 1.02`, `letter-spacing: -0.03em`: *"Discover space you truly belong in."* Middle phrase italic in muted.
   - Support paragraph top-right, `max-w-xs`, muted.
   - `Book a viewing` — solid accent pill.
   - **Day/night switch** bottom-left: two labelled states, sun and moon icons, sliding pill indicator.
   - **"Drag to look around"** hint bottom-centre, fades out after the first drag.
   - Canvas: villa, pool, ground plane, trees, contact shadows, HDRI sky.

3. **Stats band** — 4 count-up figures on the `#EDEBE6` band: `240` residences, `18` cities, `4.9` rating, `12` years.

4. **Featured residences** — 3-up card grid (`1 / 2 / 3`). Each: image `aspect-[4/3]`, name, location, green price, then a spec row with icons — area, floors, beds, baths. Cards get a cursor-following perspective tilt.

5. **Exclusive collection** — 40/60 split. Left: `#16150F` panel, display heading, paragraph, ghost `Free consult` button. Right: the dusk glass-box photo, full-bleed to the right edge.

6. **Interiors** — two-image band, kitchen and living room, with a short caption each.

7. **Process** — 3 numbered steps on hairline rules: Discover / Visit / Settle.

8. **Editorial** — full-bleed dusk photo, headline overlaid bottom-left, dark scrim gradient.

9. **CTA** — accent-green panel, `#F6F5F2` text, email capture.

10. **Footer** — 4 link columns, hairline, credit line.

---

## 6. The 3D Scene (the core of the build)

**Stack:** `@react-three/fiber` 9.7.0, `@react-three/drei` 10.7.8, `three`.

### Villa geometry — all primitives

```
Ground        200x200 plane, #7E8B6B, roughness 1
Base slab     14 x 0.4 x 10 box, concrete #C9C6BE
Ground floor  12 x 3.2 x 8, dark #2A2A28, inset 1 unit from the slab edge
Glass wall    12 x 3.0 x 0.1 planes on the two long faces
Upper slab    15 x 0.45 x 11 box, cantilevered 1.5 past the floor below
Upper floor   11 x 3.0 x 7.5, warm white #E8E4DC
Roof slab     15.5 x 0.5 x 11.5, cantilevered further
Columns       4 cylinders r=0.18, concrete
Pool          9 x 0.2 x 4.5 box beside the house
Steps         5 boxes, each 0.25 tall, stepping down to the ground
Trees         12 instanced cones + cylinders, scattered on a seeded grid
```

### Materials

| Part | Material |
|---|---|
| Glass | `MeshPhysicalMaterial`, `transmission: 1`, `thickness: 0.5`, `roughness: 0.05`, `ior: 1.45` |
| Concrete | `MeshStandardMaterial`, `roughness: 0.85`, `metalness: 0` |
| Dark cladding | `roughness: 0.6`, `metalness: 0.1` |
| Water | `roughness: 0.08`, `metalness: 0.3`, `#3C5A6B` |

### Lighting

- `<Environment>` with the HDRI above, `background` on — the sky *is* the backdrop, and it reflects in the glass. This single decision does more for realism than any number of point lights.
- Day: one directional key at `[8, 12, 6]`, intensity `2.2`, shadows on.
- Night: key drops to `0.15`; **9 warm point lights** (`#FFB861`, intensity `2.4`, distance `9`) come up inside the two floors and along the steps, so the house glows from within.
- `<ContactShadows>` under the slab, `opacity 0.5`, `blur 2.2`.
- Lerp every light intensity and the background between modes over ~1.2s. Do not hard-switch.

### Interaction

- `<OrbitControls>`: `enablePan={false}`, `enableZoom={false}`, `minPolarAngle={0.6}`, `maxPolarAngle={1.42}` (never below the horizon or above the roof), `autoRotate` at `0.35` which **stops on first user drag** and resumes 4s after release.
- Cursor `grab` / `grabbing`.
- `dpr={[1, 2]}` — cap the pixel ratio, or high-density laptops render 9x the pixels.
- `frameloop="demand"` is **wrong here** (auto-rotate needs continuous frames) — instead, stop rendering when the canvas leaves the viewport via IntersectionObserver.

---

## 7. Animations

Two easing curves. Everything enters on the first; exactly one thing overshoots.

| Class | Transform | Duration | Easing |
|---|---|---|---|
| `.a-fade-up` | `translateY(30px)` → 0 | 0.8s | `cubic-bezier(0.16,1,0.3,1)` |
| `.a-fade-in` | opacity 0→1 | 0.6s | `ease-out` |
| `.a-slide-left` | `translateX(-40px)` → 0 | 0.8s | `cubic-bezier(0.16,1,0.3,1)` |
| `.a-slide-right` | `translateX(40px)` → 0 | 0.8s | `cubic-bezier(0.16,1,0.3,1)` |
| `.a-word-pop` | `translateY(56px) scale(0.76) blur(8px)` → overshoot → settle | 0.9s | `cubic-bezier(0.34,1.56,0.64,1)` |
| `.a-photo-reveal` | `translateY(64px) scale(1.03)` → normal | 1.1s | `cubic-bezier(0.16,1,0.3,1)` |

`animation-fill-mode: both`. Delays `.d-100` … `.d-1000`. Every keyframe disabled under `prefers-reduced-motion`, and the scene's auto-rotate stops too.

---

## 8. Stagger Order

**On load:** nav `0` → headline words pop `100–400` → support paragraph `500` → CTA `600` → day/night switch `800` → drag hint `1000` (then fades at 6s or on first drag).

The canvas fades in over 1.2s as soon as the HDRI resolves — never pop it in.

**On scroll:** IntersectionObserver at `threshold: 0.15`, fires once, children stagger 80 ms apart.

---

## 9. Key Technical Details

- **Suspense boundary around the canvas**, with a bone-coloured skeleton that matches the page background, so there is no flash.
- **Code-split the whole 3D bundle** with `React.lazy`. R3F + drei + three is ~600 KB gzip; it must not sit in the main chunk.
- **WebGL fallback:** if the context fails, render a still photo of a villa in the same frame. Never show an empty box.
- Stop the render loop when the canvas scrolls out of view.
- Below `md`, drop tree count from 12 to 5 and disable shadows — mobile GPUs choke on 12 shadow casters.
- Every `<img>` below the fold: `loading="lazy"` plus an explicit `aspect-ratio`.
- Reveal via IntersectionObserver adding a class, never a scroll listener.
- `overflow-x: clip` on the wrapper.

### Two mistakes to avoid, both learned the hard way

1. **Tailwind v3 reads `tailwind.config.js` once at startup.** Change a token, restart the dev server, or you will keep debugging a palette that already changed.
2. **Anything with a CSS animation or a 3D transform cannot also use a Tailwind translate class for positioning.** The animation writes an inline `transform` and wins, so `-translate-x-1/2` is silently dropped and the element sits off-centre. Put positioning on a wrapper element.
