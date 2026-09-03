import { useMemo } from 'react';
import * as THREE from 'three';

export const CHARCOAL = '#31322F';
export const RENDER_WHITE = '#E9E7E1';
export const TIMBER = '#9A7248';
export const FRAME = '#1B1B1A';
export const LINEN = '#C7C1B4';

export function Glass({
  position,
  args,
  rotation,
}: {
  position: [number, number, number];
  args: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={args} />
      {/*
        Was transmission={1}. Transmission makes three.js render the entire
        scene into a separate buffer so the material can refract it — once per
        transmissive material, every frame. With ~740 draw calls and five of
        these in the scene, that alone was several extra full scene renders per
        frame, which is what made the scroll stutter.

        At 60mm thick the refraction is invisible anyway. Plain alpha plus a
        strong environment reflection gives the same read — you see through it,
        it catches the sky — for the cost of one ordinary transparent surface.
      */}
      <meshStandardMaterial
        color="#D9E4E2"
        transparent
        opacity={0.22}
        roughness={0.04}
        metalness={0.1}
        envMapIntensity={2.2}
      />
    </mesh>
  );
}

/** Black mullions — without them glazing reads as a hole, not a window. */
export function Mullions({
  position,
  width,
  height,
  bays,
  rotation,
}: {
  position: [number, number, number];
  width: number;
  height: number;
  bays: number;
  rotation?: [number, number, number];
}) {
  const posts = Array.from(
    { length: bays + 1 },
    (_, i) => -width / 2 + (i * width) / bays
  );
  return (
    <group position={position} rotation={rotation}>
      {posts.map((px) => (
        <mesh key={px} position={[px, 0, 0]}>
          <boxGeometry args={[0.1, height, 0.13]} />
          <meshStandardMaterial color={FRAME} roughness={0.45} metalness={0.35} />
        </mesh>
      ))}
      {[-height / 2, 0, height / 2].map((py) => (
        <mesh key={py} position={[0, py, 0]}>
          <boxGeometry args={[width, 0.1, 0.13]} />
          <meshStandardMaterial color={FRAME} roughness={0.45} metalness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/** Slim balustrade: posts plus a top rail, glass infill. */
export function Balustrade({
  position,
  width,
  rotation,
}: {
  position: [number, number, number];
  width: number;
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[width, 1.05, 0.04]} />
        {/* alpha rather than transmission — see the note on Glass above */}
        <meshStandardMaterial
          color="#CFDAD8"
          transparent
          opacity={0.26}
          roughness={0.08}
          metalness={0.1}
          envMapIntensity={2}
        />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[width, 0.08, 0.12]} />
        <meshStandardMaterial color={FRAME} roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Layered canopy tree. A single sphere reads as a lollipop; overlapping blobs
 * at three greens with a per-tree lean and rotation give a believable
 * silhouette without any downloaded mesh.
 */
export function Tree({
  position,
  height,
  radius,
  seed = 0,
  barkProps,
}: {
  position: [number, number, number];
  height: number;
  radius: number;
  seed?: number;
  barkProps?: Record<string, unknown>;
}) {
  const lean = ((seed % 7) - 3) * 0.018;
  const spin = (seed % 11) * 0.57;
  const greens = ['#3B5430', '#47643A', '#547045', '#3F5C37', '#4E6B40'];

  /**
   * A canopy of six large flat-shaded icosahedra reads as faceted low-poly from
   * any distance — the facets are bigger than the leaves would be. Real crowns
   * have a ragged silhouette made of many small clumps, so this scatters ~26
   * smaller smooth-shaded blobs through a squashed ellipsoid instead. Same
   * primitive, an order of magnitude more believable, still cheap.
   */
  const blobs = useMemo(() => {
    const out: [number, number, number, number, number][] = [];
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 9; i++) {
      // spherical-ish scatter, denser toward the middle of the crown
      const a = rnd() * Math.PI * 2;
      const t = Math.pow(rnd(), 0.6);
      const yj = rnd();
      out.push([
        Math.cos(a) * t * radius * 1.05,
        height * (0.66 + yj * 0.34),
        Math.sin(a) * t * radius * 1.05,
        radius * (0.30 + rnd() * 0.30),
        Math.floor(rnd() * greens.length),
      ]);
    }
    return out;
  }, [seed, height, radius, greens.length]);

  return (
    <group position={position} rotation={[lean, spin, lean * 0.6]}>
      <mesh position={[0, height * 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.28, height * 0.68, 9]} />
        <meshStandardMaterial {...(barkProps ?? {})} color="#6B5744" roughness={1} />
      </mesh>
      {/* a couple of limbs break the bare-pole look */}
      <mesh position={[radius * 0.28, height * 0.6, 0]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.06, 0.11, height * 0.3, 7]} />
        <meshStandardMaterial color="#6B5744" roughness={1} />
      </mesh>
      {blobs.map(([x, y, z, r, g], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[i * 0.7, i * 1.3, 0]} castShadow>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color={greens[g]} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/** Simple upholstered chair used around the dining table. */
export function Chair({
  position,
  rotation = 0,
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[0.52, 0.09, 0.52]} />
        <meshStandardMaterial color={LINEN} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.78, -0.22]} castShadow>
        <boxGeometry args={[0.52, 0.62, 0.09]} />
        <meshStandardMaterial color={LINEN} roughness={0.95} />
      </mesh>
      {[[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]].map(
        ([x, z], i) => (
          <mesh key={i} position={[x, 0.22, z]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.44, 8]} />
            <meshStandardMaterial color="#2E2E2C" roughness={0.4} metalness={0.6} />
          </mesh>
        )
      )}
    </group>
  );
}

/** Potted plant — a cheap way to make an interior feel lived in. */
export function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.17, 0.44, 14]} />
        <meshStandardMaterial color="#B9B2A5" roughness={0.9} />
      </mesh>
      {[
        [0, 0.85, 0, 0.42],
        [0.2, 0.7, 0.12, 0.3],
        [-0.18, 0.72, -0.1, 0.28],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <icosahedronGeometry args={[r as number, 1]} />
          <meshStandardMaterial color="#3F5C36" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export const seededScatter = (count: number, seed: number) => {
  let s = seed;
  const rand = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  return Array.from({ length: count }, () => ({
    a: rand(),
    b: rand(),
    c: rand(),
    d: rand(),
  }));
};

export const DEG = Math.PI / 180;
export const _unused = THREE;

/**
 * A framed picture on a wall.
 *
 * Real rooms are dated by what is hung in them, and an empty plaster wall is
 * the clearest tell that an interior was modelled rather than lived in. This is
 * a moulding, a mount board and the canvas — three boxes — but the mount is
 * what does the work: a picture that runs to the edge of its frame reads as a
 * poster, and one floating inside a border reads as framed.
 *
 * The width comes from the texture's own proportions rather than a prop, so a
 * portrait canvas cannot be stretched into a landscape frame — the single
 * thing that would give the whole trick away.
 */
export function Artwork({
  position,
  rotation = [0, 0, 0],
  height = 1.4,
  map,
  moulding = '#2B2824',
  night = false,
  lit = false,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  height?: number;
  map: THREE.Texture;
  moulding?: string;
  night?: boolean;
  /** Hangs a picture light over the frame. Worth it on the one that matters. */
  lit?: boolean;
}) {
  const img = map.image as { width: number; height: number } | undefined;
  const aspect = img && img.height ? img.width / img.height : 0.72;
  const h = height;
  const w = h * aspect;
  const mat = 0.075;
  const lip = 0.04;

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w + (mat + lip) * 2, h + (mat + lip) * 2, 0.05]} />
        <meshStandardMaterial color={moulding} roughness={0.35} metalness={0.15} />
      </mesh>
      {/* Mount board. Warm rather than white: these hang on white plaster, and
          a white mount between a white wall and the picture gives the frame no
          edge to read against at all. */}
      <mesh position={[0, 0, 0.026]}>
        <boxGeometry args={[w + mat * 2, h + mat * 2, 0.012]} />
        <meshStandardMaterial
          color="#CFC6B2"
          roughness={0.98}
          envMapIntensity={0.35}
        />
      </mesh>

      {/* The picture itself.
          A print is not a lit surface in the way a wall is. Left as an ordinary
          standard material it took the room's four ceiling lights, the sky and
          the bounce all at full strength, and a backdrop authored at #A3987F
          came out of the renderer at #e8e6df — against a #f1f1f1 wall, which
          is to say it vanished, and the face with it. Holding the map down and
          taking it most of the way off the environment lets the photograph keep
          its own values instead of the room's. */}
      <mesh position={[0, 0, 0.034]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          map={map}
          /* Day and dusk pull in opposite directions. By day the room is bright
             enough that an unheld map blew out; at dusk the same hold-down left
             the print several stops under, and the only light reaching it was
             the warm orange of the lamps, so the face went muddy and took the
             photograph's own colour with it. At night the map is let back up
             and also driven through emissive: a print under a picture light
             holds its values largely independently of the room, and that is
             both what the fitting above is for and what makes the picture
             legible instead of a dark rectangle. */
          color={night ? '#FFFFFF' : '#8C8C8C'}
          emissiveMap={night ? map : undefined}
          emissive={night ? '#FFFFFF' : '#000000'}
          emissiveIntensity={night ? 0.5 : 0}
          roughness={0.96}
          envMapIntensity={night ? 0.15 : 0.3}
        />
      </mesh>

      {lit && (
        <group position={[0, h / 2 + mat + lip + 0.14, 0]}>
          {/* arm off the top of the moulding */}
          <mesh position={[0, -0.08, 0.07]} castShadow>
            <boxGeometry args={[0.035, 0.19, 0.035]} />
            <meshStandardMaterial color="#8A7346" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* the shade — a horizontal tube, with the lamp showing beneath it */}
          <mesh position={[0, 0.03, 0.19]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, w * 0.6, 16]} />
            <meshStandardMaterial color="#9C8148" roughness={0.26} metalness={0.85} />
          </mesh>
          <mesh position={[0, -0.015, 0.19]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.026, 0.026, w * 0.58, 12]} />
            <meshStandardMaterial
              color={night ? '#FFF3DE' : '#D6D0C2'}
              emissive="#FFCE93"
              emissiveIntensity={night ? 3.2 : 0.2}
              roughness={0.55}
              toneMapped={!night}
            />
          </mesh>
          {night && (
            <pointLight
              position={[0, -0.1, 0.24]}
              intensity={1.1}
              distance={2.8}
              color="#FFD8A6"
            />
          )}
        </group>
      )}
    </group>
  );
}

/* ============================== LIGHT FITTINGS ==============================
   Until now every interior light in this house was a bare `pointLight`: a
   position, an intensity, and nothing to look at. In daylight that passes,
   because the sun is doing the work and nobody asks where the light is coming
   from. At dusk it falls apart — rooms are lit, the source is invisible, and
   the eye reads the whole thing as a render with its brightness turned up
   rather than as a house with its lamps on.

   So: fittings. The lamp inside each one is emissive, which is what makes it
   read as *on* — a bright element in frame is the cue, far more than the
   illumination it casts.

   Light count is the one real cost here, so the two are separated: a fitting
   is a few boxes and is free, an actual light is not. Most downlights in a
   ceiling run are therefore fittings only, and the room's brightness still
   comes from a handful of sources — which is roughly how it works in practice
   anyway, since a downlight three metres away contributes almost nothing. */

/**
 * A recessed ceiling downlight: trim ring, and a lens sitting just proud of it.
 *
 * Pass `intensity` 0 for a fitting that is only there to be seen — in a run of
 * seven, three carrying light is plenty.
 */
export function Downlight({
  position,
  night,
  intensity = 0,
  distance = 12,
  color = '#FFB861',
}: {
  position: [number, number, number];
  night: boolean;
  intensity?: number;
  distance?: number;
  color?: string;
}) {
  /* `position` is the underside of the ceiling; the fitting hangs 36mm below
     it and no more.

     The lens is the lowest and widest part, which is not how a downlight is
     actually built but is the only arrangement that reads. A fitting on a
     ceiling 1.3m above the lens is seen from about ten degrees below it, and
     with the lens recessed up inside a deep trim the ring's unlit side wall
     covered it completely at that angle: a dark plate stuck to a lit ceiling,
     which is precisely backwards. Here the emissive cylinder is what the room
     sees from any angle at all.

     And it is untone-mapped. ACES rolls the top of the range off hard, so an
     emissive meant to be looked *at* comes back as a beige disc; skipping the
     curve lets it clip to white instead. A source too bright to resolve is the
     entire visual signature of a lamp that is switched on, and with no bloom in
     the composer this is what stands in for one. */
  return (
    <group position={position}>
      <mesh position={[0, -0.006, 0]}>
        <cylinderGeometry args={[0.108, 0.108, 0.012, 20]} />
        <meshStandardMaterial color="#E4E0D6" roughness={0.4} metalness={0.25} />
      </mesh>
      <mesh position={[0, -0.024, 0]}>
        <cylinderGeometry args={[0.095, 0.095, 0.026, 20]} />
        <meshStandardMaterial
          color={night ? '#FFEBCB' : '#C9C4B8'}
          emissive="#FFC178"
          emissiveIntensity={night ? 2.6 : 0.25}
          roughness={0.5}
          toneMapped={!night}
        />
      </mesh>
      {intensity > 0 && (
        <pointLight
          position={[0, -0.2, 0]}
          intensity={intensity}
          distance={distance}
          color={color}
        />
      )}
    </group>
  );
}

/**
 * A wall light. Local +z points away from the wall, the same convention
 * `Artwork` uses, so the two take the same rotation on a given wall.
 *
 * The lamp is longer than the shade in front of it, so it shows above and
 * below — and the light itself sits 140mm off the plaster, close enough that
 * its falloff paints a visible pool. That gradient is the thing that sells it:
 * a room can be lit from nowhere, but light that fades across a wall as it
 * travels has obviously come from a point on that wall.
 */
export function Sconce({
  position,
  rotation = [0, 0, 0],
  night,
  intensity = 1.5,
  height = 0.34,
  color = '#FFB861',
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  night: boolean;
  intensity?: number;
  height?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* backplate */}
      <mesh position={[0, 0, 0.014]} castShadow>
        <boxGeometry args={[0.1, height * 0.42, 0.028]} />
        <meshStandardMaterial color="#8A7A5C" roughness={0.32} metalness={0.7} />
      </mesh>
      {/* the lamp, open at both ends */}
      <mesh position={[0, 0, 0.085]}>
        <cylinderGeometry args={[0.028, 0.028, height, 12]} />
        <meshStandardMaterial
          color={night ? '#FFEED4' : '#D2CCBE'}
          emissive="#FFB861"
          emissiveIntensity={night ? 3.4 : 0.2}
          roughness={0.6}
          toneMapped={!night}
        />
      </mesh>
      {/* shade in front of it */}
      <mesh position={[0, 0, 0.085]} castShadow>
        <boxGeometry args={[0.085, height * 0.62, 0.09]} />
        <meshStandardMaterial color="#9C8656" roughness={0.28} metalness={0.8} />
      </mesh>
      {night && (
        <pointLight
          position={[0, 0, 0.14]}
          intensity={intensity}
          distance={3.6}
          color={color}
        />
      )}
    </group>
  );
}

/**
 * A garden lamp post.
 *
 * Square section rather than a fluted pole with a coach lantern on it: this
 * house is all straight lines and flat planes, and a Victorian post outside it
 * would read as a prop borrowed from another building. The lantern is a
 * glowing block held between a cap and a base plate, which is what a
 * contemporary bollard or post head actually looks like.
 *
 * Same split as the downlights — `intensity` 0 makes it a post that is on to
 * look at but does not enter the lighting loop, and in a run of four across a
 * garden the difference is invisible.
 */
export function LampPost({
  position,
  night,
  intensity = 0,
  height = 3.3,
}: {
  position: [number, number, number];
  night: boolean;
  intensity?: number;
  height?: number;
}) {
  const head = height + 0.42;
  return (
    <group position={position}>
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.18, 0.38]} />
        <meshStandardMaterial color="#33322E" roughness={0.6} metalness={0.35} />
      </mesh>
      <mesh position={[0, height / 2 + 0.18, 0]} castShadow>
        <boxGeometry args={[0.14, height, 0.14]} />
        <meshStandardMaterial color="#3A3833" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* lantern: cap, glowing body, base plate */}
      <mesh position={[0, head + 0.2, 0]} castShadow>
        <boxGeometry args={[0.32, 0.06, 0.32]} />
        <meshStandardMaterial color="#2E2C28" roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0, head, 0]}>
        <boxGeometry args={[0.22, 0.34, 0.22]} />
        {/* Tone mapped, unlike the downlights. Those are 90mm discs seen edge
            on and want to clip; this is a face nine times the area, twenty
            metres out and against a night sky, and clipped it stopped reading
            as a lantern and started reading as a white card taped to a pole. */}
        <meshStandardMaterial
          color={night ? '#FFE6BE' : '#CFCABE'}
          emissive="#FFB861"
          emissiveIntensity={night ? 3.4 : 0}
          roughness={0.45}
        />
      </mesh>
      <mesh position={[0, head - 0.2, 0]} castShadow>
        <boxGeometry args={[0.32, 0.06, 0.32]} />
        <meshStandardMaterial color="#2E2C28" roughness={0.45} metalness={0.5} />
      </mesh>
      {night && intensity > 0 && (
        <pointLight position={[0, head, 0]} intensity={intensity} distance={13} color="#FFB861" />
      )}
    </group>
  );
}
