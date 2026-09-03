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
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  height?: number;
  map: THREE.Texture;
  moulding?: string;
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
      <mesh position={[0, 0, 0.026]}>
        <boxGeometry args={[w + mat * 2, h + mat * 2, 0.012]} />
        <meshStandardMaterial color="#F4F1E9" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0, 0.034]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={map} roughness={0.62} />
      </mesh>
    </group>
  );
}
