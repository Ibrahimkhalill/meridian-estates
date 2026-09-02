import { useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/** t at which the camera crosses the threshold — the lens widens from here. */
const INDOORS_FROM = 0.52;

/**
 * Scroll-driven camera journey, in five acts:
 *   1  wide establishing, three-quarter view
 *   2  swing left along the front so the full width of the house reads
 *   3  swing back right past the stone core
 *   4  square up on the terrace and slow down
 *   5  step through the glazing into the living room
 *
 * Position and look-at are separate Catmull-Rom curves, so the camera can
 * travel a wide arc while its gaze stays locked on the building.
 */

const PATH = [
  // Levels: terrace 0.30, ground floor 1.10, first floor 4.60.
  // Door at x 0.2..2.6, z 1.9. Stair at x 4.3, z +1.5 -> -3.4.
  // Pulled in from 50 units out to ~36. At the old distance the villa sat
  // small in the middle of a lot of empty lawn, and the fog (70..260) was
  // already washing the ground behind it — so the extra distance bought
  // nothing but emptiness.
  { pos: [22, 8, 28], look: [-1, 4.0, 0] },           // establishing
  { pos: [-19, 6.8, 25], look: [-6, 3.8, 0] },        // swing left
  { pos: [-23, 5.2, 13], look: [-8, 3.4, 0] },        // past the pool
  { pos: [-6, 5.2, 23], look: [0, 4.0, 0] },          // back to the front
  { pos: [13, 5.6, 20], look: [3, 4.0, 0] },          // swing right
  { pos: [1.4, 2.8, 15], look: [1.4, 3.0, 0] },       // squared up
  { pos: [1.4, 2.1, 7.6], look: [1.4, 2.7, 0] },      // foot of the steps
  { pos: [1.4, 2.8, 4.2], look: [1.4, 2.8, -1] },     // climbing
  { pos: [1.4, 2.9, 1.0], look: [0.6, 2.7, -3] },     // through the door
  { pos: [0.2, 2.9, -0.4], look: [-3.4, 2.1, -4.6] }, // living room, wide
  { pos: [-0.6, 2.9, -2.6], look: [4.0, 2.4, -1.0] }, // pan across to dining
  { pos: [3.2, 2.9, 1.9], look: [4.65, 3.6, -2.0] },  // turn to the stair
  // The flight is treads i = 0..17 at y = 1.24 + 0.194i, z = 1.5 - 0.28i.
  // These four ride it at a walker's eye height (~1.6 above the tread) rather
  // than floating over it, which is what put the slab in the middle of frame.
  // Aim only ~8 degrees above level. Pitching up 22 degrees to clear the slab
  // overcorrected the other way: it centred the frame on blank wall and pushed
  // the treads off the bottom edge.
  { pos: [4.65, 2.86, 1.5], look: [4.65, 3.9, -2.6] },   // foot of the flight, i=0
  { pos: [4.65, 4.0, -0.18], look: [4.65, 4.45, -3.4] }, // i=6, passing the opening
  { pos: [4.65, 5.17, -1.86], look: [4.5, 5.5, -4.2] },  // i=12, head above the slab
  // Onto the landing at z -4.25, which is clear of the void (z -3.5..1.7), then
  // along the back of the room. Cutting straight from the flight into the
  // bedroom crossed the stairwell balustrade at x 2.8; going behind the void
  // avoids it entirely.
  { pos: [4.65, 6.2, -4.3], look: [1.6, 6.05, -4.7] },  // landing, turning in
  // The stairwell balustrade is a glass panel at x 2.8 spanning z -3.5..1.7.
  // Cutting from the landing across to x 2.6 crossed x 2.8 at z -2.76 — i.e.
  // straight through the pane. Holding z at -4.2 until well past it clears the
  // panel, because -4.2 sits behind the void the balustrade guards.
  { pos: [2.0, 6.3, -4.2], look: [-1.7, 5.7, -4.3] },   // bedroom, bed in frame
  { pos: [1.5, 6.3, -2.4], look: [-2.8, 5.7, -3.6] },   // wide across the room
  // Out through the balcony door. The first-floor glazing is split at
  // x -0.3..3.2, so the approach has to be squared up on that gap or the
  // camera travels through a pane — the old path swung in from x 3.4 and did
  // exactly that. The look-at also stays near eye level: aiming it at the pool
  // deck (y 1.2) pitched the camera at the ground instead of out at the view.
  { pos: [1.45, 6.35, 1.9], look: [-1.2, 5.9, 8.0] },   // in the door opening
  // ---- balcony ----
  // The balcony deck runs z 1.7..5.1 with its rail at z 5.05, top y 5.80.
  // Standing at z 4.3 put that rail only 0.75 ahead and 0.60 below the lens —
  // 39 degrees down, when the lens only sees 31. The railing was therefore off
  // the bottom of frame entirely, which is why the shot read as standing at an
  // unguarded edge about to fall. Standing further back on the deck brings it
  // to ~11 degrees down: it sits across the lower third, the pool and terrace
  // read beyond it, and the drop is safely enclosed.
  { pos: [1.45, 6.26, 2.5], look: [-9.5, 4.5, 10.5] }, // balcony, rail in frame
];

const posCurve = new THREE.CatmullRomCurve3(
  PATH.map((p) => new THREE.Vector3(...(p.pos as [number, number, number]))),
  false,
  'catmullrom',
  0.35
);
const lookCurve = new THREE.CatmullRomCurve3(
  PATH.map((p) => new THREE.Vector3(...(p.look as [number, number, number]))),
  false,
  'catmullrom',
  0.35
);

/**
 * Scroll position to position along the path.
 *
 * This used to compress the outdoor arc — 45% of the scroll covered only 42%
 * of the path and the rest eased hard — on the theory that the approach is
 * less interesting than the interior. In practice it meant the exterior swung
 * past too fast to read, which is the opposite of a guided tour: the point is
 * that every shot holds long enough to look at.
 *
 * So: linear. The waypoints are already spaced by how much there is to see,
 * and the easing at the two ends comes free from the smoothing in useFrame,
 * which ramps in and out whenever the scroll starts and stops.
 */
function pace(t: number) {
  return t;
}

interface CameraRigProps {
  progressRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
}

export default function CameraRig({ progressRef, pointerRef }: CameraRigProps) {
  const { camera } = useThree();
  const smoothed = useRef(0);
  const target = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());

  useFrame(() => {
    // Gentle easing so a flicked wheel glides instead of snapping.
    smoothed.current += (progressRef.current - smoothed.current) * 0.026;
    const t = pace(THREE.MathUtils.clamp(smoothed.current, 0, 1));

    posCurve.getPoint(t, desired.current);
    lookCurve.getPoint(t, target.current);

    // Pointer parallax outdoors only — indoors it reads as nausea.
    const drift = Math.max(0, 1 - t * 1.6) * 3.2;
    const p = pointerRef.current ?? { x: 0, y: 0 };
    desired.current.x += p.x * drift;
    desired.current.y += -p.y * drift * 0.4;

    // A 42-degree lens indoors frames a wall; widen toward 62 once inside so
    // the whole room reads, the way an agent would show you the space.
    const indoors = THREE.MathUtils.clamp((t - INDOORS_FROM) / 0.2, 0, 1);
    const wantFov = 42 + indoors * 20;
    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(cam.fov - wantFov) > 0.05) {
      cam.fov += (wantFov - cam.fov) * 0.08;
      cam.updateProjectionMatrix();
    }

    camera.position.lerp(desired.current, 0.042);
    lookAt.current.lerp(target.current, 0.055);
    camera.lookAt(lookAt.current);
  });

  return null;
}
