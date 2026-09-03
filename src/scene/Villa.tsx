import { useMemo } from 'react';
import { useTiled, useSurface, useArt } from './useTextures';
import {
  Artwork,
  Balustrade,
  Chair,
  CHARCOAL,
  Downlight,
  FRAME,
  Glass,
  LampPost,
  LINEN,
  Mullions,
  Plant,
  RENDER_WHITE,
  Sconce,
  TIMBER,
  Tree,
  seededScatter,
} from './parts';

/**
 * Wide contemporary villa, modelled from a reference photograph.
 *
 * Levels (world Y):
 *   0.00  lawn
 *   0.30  terrace deck
 *   1.10  ground floor — entered by four steps and a real door opening
 *   4.60  first floor — bedroom, opening onto a balcony
 *   8.20  roof slab
 *
 * The front glazing has a genuine 2.4-wide gap at x 0.2..2.6, so the camera
 * walks up the steps and through a door rather than through a pane.
 */

const GROUND_Y = 1.1;
const UPPER_Y = 4.6;

export default function Villa({ night }: { night: boolean }) {
  const concrete = useTiled('concrete', [10, 6]);
  const concreteBig = useTiled('concrete', [34, 8]);
  const stone = useTiled('stone', [10, 18]);
  const wood = useTiled('oak', [10, 7]);
  const woodUp = useTiled('oak', [9, 6]);
  const oak = useTiled('oak', [1, 6]);
  const grass = useTiled('grass', [58, 58]);
  const bark = useTiled('bark', [2, 5]);
  const plaster = useTiled('plaster', [8, 4]);
  /**
   * Repeat kept low on purpose. A box's UVs run 0..1 on every face whatever
   * that face measures, so one repeat covers both the sofa's 4.4-wide seat and
   * its 0.3-wide arm — and at 4 x 3 the arm was packing four tiles of leather
   * grain into 300mm. Far past what the pixels can carry, so it aliased into a
   * fixed dot grid that crawled as the camera moved. Lower frequency and a
   * gentler normal cost nothing on the large panels and settle the small ones.
   */
  const fabric = useSurface([1.8, 1.4], 'fabric', 0.3);
  const carpet = useSurface([5, 4], 'carpet', 0.8);
  const marble = useTiled('marble', [2, 2]);
  const art = useArt();
  // Painted joinery: relief and roughness only, so `color` still drives hue.
  const plasterFine = useSurface([6, 3]);
  const paint = useSurface([2, 2]);
  const joinery = useSurface([2, 2], 'planks', 0.4);
  // timber cladding at building scale: board relief, colour from the material
  const cladding = useSurface([9, 4], 'planks', 0.85);
  // faint surface ripple for the pool — normals only, no colour
  const ripple = useSurface([9, 3], 'concrete', 0.14);
  // clipped hedging: relief only, so `color` still drives the hue
  const hedge = useSurface([4, 4], 'grass', 0.95);

  const warm = night ? '#FFB861' : '#FFF3E2';
  const lamp = night ? 3.4 : 2.2;

  /**
   * The camera's outdoor arc sweeps the +z side between roughly 15 and 50
   * units out — (30,40), (-24,34), (-30,16), (-6,30), (16,26), (1.4,15) — and
   * trees were scattered from 30 units, so the swing flew straight through
   * them and a trunk filled the middle of the establishing shot. Anything in
   * front of the house therefore has to sit outside that arc.
   *
   * Nothing stands directly behind the house any more. Massed canopies back
   * there filled the sky above the roofline, and since the camera faces the
   * building for the whole outdoor sequence they were in almost every frame —
   * close enough to be read as objects rather than as distance, and at that
   * size the difference between a tree and a green blob is a lot of geometry
   * this scene cannot spend. The planting now sits to the sides and out in
   * front, where it frames the house instead of crowding it, and the depth
   * behind comes from the fog and the land beyond it.
   */
  const trees = useMemo(() => {
    return seededScatter(34, 11)
      .map(({ a, b, c, d }) => {
        const angle = a * Math.PI * 2;
        return {
          x: Math.cos(angle) * (58 + b * 46),
          z: Math.sin(angle) * (58 + b * 46) - 8,
          h: 6 + c * 7,
          r: 1.6 + d * 1.3,
        };
      })
      // Clear of the house, and clear of the wedge directly behind it that the
      // camera looks straight through.
      .filter((t) => (Math.abs(t.x) > 22 || t.z > 26) && !(t.z < -30 && Math.abs(t.x) < 46));
  }, []);

  /** Land beyond the treeline, deep enough into the fog to read as distance. */
  const hills = useMemo(
    () =>
      seededScatter(9, 313).map(({ a, b, c, d }) => {
        const angle = a * Math.PI * 2;
        const dist = 190 + b * 70;
        return {
          x: Math.cos(angle) * dist,
          z: Math.sin(angle) * dist,
          r: 42 + c * 46,
          f: 0.26 + d * 0.2,
        };
      }),
    []
  );

  return (
    <group>
      {/* ================= LANDSCAPE ================= */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[340, 340]} />
        <meshStandardMaterial {...grass} color="#7C9A55" roughness={1} />
      </mesh>

      {/* ---- terrace ----
           A 40 x 9 slab of one flat tone is the largest featureless surface in
           the establishing shot and nothing gives it scale; paving joints are
           what tell the eye how big it is. Drawing them as thin strips laid on
           top failed — proud geometry that thin catches the sun and aliases
           into bright lines, reading as road markings. A joint is a gap, so
           this is a dark base with the paving set on top of it, and the gaps
           between the slabs genuinely fall into shadow. */}
      <mesh position={[-1, 0.12, 8]} receiveShadow castShadow>
        <boxGeometry args={[40, 0.24, 9]} />
        <meshStandardMaterial color="#6B675F" roughness={1} />
      </mesh>
      {Array.from({ length: 15 }, (_, i) =>
        [5, 8, 11].map((z) => (
          <mesh
            key={`${i}-${z}`}
            position={[-19.667 + i * 2.6667, 0.27, z]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[2.61, 0.06, 2.945]} />
            <meshStandardMaterial {...concreteBig} color="#FFFDF7" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* ---- soffit downlights under the balcony ----
           The balcony slab overhangs the front door at y 4.44, which is where
           an architect would put the external lighting and the one place
           outdoors a fitting reads against something rather than vanishing
           into the dark. */}
      {([
        [-1.2, 0],
        [1.4, 1],
        [4.0, 0],
      ] as const).map(([x, on], i) => (
        <Downlight
          key={`sf${i}`}
          position={[x, 4.44, 3.7]}
          night={night}
          intensity={on && night ? 3.6 : 0}
          distance={9}
          color="#FFC98E"
        />
      ))}

      {/* ---- lamp posts ----
           Sited off the camera's outdoor arc, which is the only real
           constraint in a garden this size. That arc runs (22,28), (-19,25),
           (-23,13), (-6,23), (13,20), (1.4,15) — so the pair flanking the
           approach stands at z 13.4 rather than out on the lawn, where the
           swing to the right would have passed within four metres of one and
           put a 3.3-metre post through the middle of the establishing shot.
           The outer two close the ends of the terrace, in front of the hedge
           blocks already there. */}
      {([
        [-26, 0, 4, 2.4],
        [24, 0, 4, 0],
        [-10.5, 0, 13.4, 2.4],
        [18.5, 0, 13.6, 0],
      ] as const).map(([x, y, z, on], i) => (
        <LampPost key={`lp${i}`} position={[x, y, z]} night={night} intensity={on} />
      ))}

      {/* ---- deck markers along the front edge of the terrace ----
           Everything lit outdoors was up against the house — the steps, the
           soffit, the pool — and the forty metres of paving in front of it
           still ran off into black with no edge to it. A line of markers set
           into the front lip gives the terrace a boundary, which is the whole
           job: at this distance you are not reading illumination, you are
           reading where the ground stops.

           Emissive only, bar two. Fourteen lamps to edge a patio would be
           fourteen point lights in every night frame, and the run reads as
           lighting from the presence of the line, not from what it casts. */}
      {[-19, -15.4, -11.8, -8.2, -4.6, -1, 2.6, 6.2, 9.8, 13.4, 17].map((x) => (
        <mesh key={`dm${x}`} position={[x, 0.235, 12.44]}>
          <boxGeometry args={[0.3, 0.06, 0.04]} />
          <meshStandardMaterial
            color={night ? '#FFE3B8' : '#A8A296'}
            emissive="#FFB861"
            emissiveIntensity={night ? 2.4 : 0}
            roughness={0.5}
            toneMapped={!night}
          />
        </mesh>
      ))}
      {night && (
        <pointLight position={[0.8, 0.42, 12.2]} intensity={1.8} distance={8} color="#FFB861" />
      )}

      {/* ---- entrance steps: terrace 0.30 -> threshold 1.10 ----
           Each riser carries a marker let into either end. They are emissive
           only, with one lamp at the foot of the flight doing the illuminating:
           eight point lights to light four steps would be absurd, and it is the
           row of glowing slots the eye reads as lighting in any case. */}
      {[0, 1, 2, 3].map((i) => {
        const w = 5.4 - i * 0.25;
        const z = 5.4 - i * 0.62;
        const y = 0.4 + i * 0.2;
        return (
          <group key={i}>
            <mesh position={[1.4, y, z]} receiveShadow castShadow>
              <boxGeometry args={[w, 0.2, 0.62]} />
              <meshStandardMaterial {...concrete} color="#FFFDF7" roughness={0.9} />
            </mesh>
            {[-1, 1].map((sx) => (
              <mesh key={sx} position={[1.4 + sx * (w / 2 - 0.34), y, z + 0.312]}>
                <boxGeometry args={[0.34, 0.05, 0.015]} />
                <meshStandardMaterial
                  color={night ? '#FFE9C6' : '#B8B2A6'}
                  emissive="#FFB861"
                  emissiveIntensity={night ? 3 : 0}
                  roughness={0.5}
                />
              </mesh>
            ))}
          </group>
        );
      })}
      {night && (
        <pointLight position={[1.4, 0.74, 5.95]} intensity={2} distance={7} color="#FFC98E" />
      )}

      {/* lawn steps at the terrace edge */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[2, 0.1 - i * 0.16, 13 + i * 1.0]} receiveShadow>
          <boxGeometry args={[11 - i * 0.4, 0.16, 1.0]} />
          <meshStandardMaterial {...concrete} color="#FFFDF7" roughness={0.9} />
        </mesh>
      ))}

      {/* ================= LEFT WING =================
           This was a solid 13 x 3.4 x 9 block with the glazing laid on its
           front face, so the "windows" transmitted onto a wall 50mm behind
           them and read as frosted grey panels. Glass only looks like glass if
           there is a room behind it, so the wing is built as one. */}
      {/* ---- plinth ----
           The house plinth only spans x -6.5..8.5, so this wing's floor at
           y 1.10 had nothing under it and the whole volume hung in the air.
           As a solid block that read as a mass; hollowed out you see straight
           beneath it. Set back 0.25 all round so it reads as a shadow gap
           rather than a continuation of the wall. */}
      <mesh position={[-14, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[12.5, 1.1, 8.5]} />
        <meshStandardMaterial {...concrete} color="#CFCAC1" roughness={0.92} />
      </mesh>
      <mesh position={[-14, GROUND_Y + 0.04, 0]} receiveShadow>
        <boxGeometry args={[13, 0.08, 9]} />
        <meshStandardMaterial {...wood} roughness={0.55} />
      </mesh>
      <mesh position={[-14, GROUND_Y + 3.36, 0]} receiveShadow>
        <boxGeometry args={[13, 0.08, 9]} />
        <meshStandardMaterial {...plasterFine} color="#F2EFE8" roughness={0.95} />
      </mesh>
      <mesh position={[-14, GROUND_Y + 1.7, -4.35]} castShadow receiveShadow>
        <boxGeometry args={[13, 3.4, 0.3]} />
        <meshStandardMaterial {...plaster} color={RENDER_WHITE} roughness={0.92} />
      </mesh>
      {[-20.35, -7.65].map((x) => (
        <mesh key={x} position={[x, GROUND_Y + 1.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 3.4, 9]} />
          <meshStandardMaterial {...plaster} color={RENDER_WHITE} roughness={0.92} />
        </mesh>
      ))}
      {/* ---- left wing interior ----
           Now that the glazing actually transmits, an empty shell is visible
           through it. A lounge reads through glass with very little: a seat
           mass, a rug to ground it, a table, and something vertical. */}
      <group position={[-14, GROUND_Y, 0]}>
        {/* skirting */}
        {[-6.2, 6.2].map((x) => (
          <mesh key={x} position={[x, 0.17, 0]} receiveShadow>
            <boxGeometry args={[0.06, 0.18, 8.8]} />
            <meshStandardMaterial {...plasterFine} color="#FBF9F4" roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[0, 0.1, -0.6]} receiveShadow>
          <boxGeometry args={[6.4, 0.03, 4.6]} />
          <meshStandardMaterial {...carpet} color="#B3AA98" roughness={1} />
        </mesh>
        {/* long sofa facing the glass */}
        <group position={[-0.6, 0, -2.2]}>
          <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
            <boxGeometry args={[4.8, 0.54, 1.6]} />
            <meshStandardMaterial {...fabric} color="#8F8A7E" roughness={0.96} />
          </mesh>
          <mesh position={[0, 0.92, -0.66]} castShadow receiveShadow>
            <boxGeometry args={[4.8, 0.82, 0.28]} />
            <meshStandardMaterial {...fabric} color="#8F8A7E" roughness={0.96} />
          </mesh>
          {[-1.55, 0, 1.55].map((x) => (
            <mesh key={x} position={[x, 0.72, 0.1]} castShadow receiveShadow>
              <boxGeometry args={[1.48, 0.16, 1.34]} />
              <meshStandardMaterial {...fabric} color="#9A9486" roughness={0.95} />
            </mesh>
          ))}
        </group>
        {/* low table */}
        <mesh position={[-0.6, 0.4, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.09, 0.95]} />
          <meshStandardMaterial {...joinery} color="#C0A883" roughness={0.45} />
        </mesh>
        {/* sideboard against the end wall */}
        <mesh position={[5.0, 0.42, -1.6]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.84, 3.2]} />
          <meshStandardMaterial {...joinery} color="#C4B49B" roughness={0.55} />
        </mesh>
        <Artwork
          position={[6.16, 1.72, -1.6]}
          rotation={[0, -Math.PI / 2, 0]}
          height={1.15}
          map={art.horizon}
          night={night}
        />
        <Plant position={[4.6, 0, 2.4]} scale={1.2} />
        <Chair position={[2.6, 0, 1.4]} rotation={-1.1} />
      </group>

      <Glass position={[-14, GROUND_Y + 1.7, 4.55]} args={[11.4, 2.7, 0.06]} />
      <Mullions position={[-14, GROUND_Y + 1.7, 4.62]} width={11.4} height={2.7} bays={5} />
      <mesh position={[-14, GROUND_Y + 3.6, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[14.4, 0.5, 11.6]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.7} />
      </mesh>
      {/* The wings are read through glass from the drive, so their fittings
          matter as much as the main room's — an evening approach to a house
          whose windows glow from no visible lamp is the giveaway. */}
      {[
        [-17.6, -1.6],
        [-14.0, 1.4],
        [-10.6, -1.6],
      ].map(([x, z], i) => (
        <Downlight key={`lw${i}`} position={[x, GROUND_Y + 3.32, z]} night={night} />
      ))}
      {/* The fill stays where it was, mid-room. Hoisting it to the ceiling to
          sit inside a fitting cost the room most of its brightness through the
          glass, which is the only way this wing is ever seen. */}
      <pointLight position={[-14, GROUND_Y + 1.6, 2]} intensity={night ? 2.4 : 0.5} distance={13} color={warm} />

      {/* ================= STONE CORE =================
           These were solid blocks: 4.6 x 9 x 8 spanning x -5.7..-1.1, and
           2.6 x 9 x 8 spanning x 4.1..6.7. The interior runs x -5.7..7.7, so
           the sofa sat buried in the first and the entire staircase (x 4.65)
           inside the second — which is exactly why the climb read as going up
           through solid material and the bedroom's back wall was raw exterior
           masonry. Only the outer faces are ever seen, so they are walls. */}
      <mesh position={[-5.9, 4.6, -2.4]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 9, 8]} />
        <meshStandardMaterial {...stone} color="#CFC7B7" roughness={0.95} />
      </mesh>
      <mesh position={[7.9, 4.6, -2.4]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 9, 8]} />
        <meshStandardMaterial {...stone} color="#CFC7B7" roughness={0.95} />
      </mesh>
      {/* rear enclosure */}
      <mesh position={[1, 4.6, -6.3]} castShadow receiveShadow>
        <boxGeometry args={[14, 9, 0.3]} />
        <meshStandardMaterial {...plaster} color={RENDER_WHITE} roughness={0.92} />
      </mesh>

      {/* base plinth under the raised floor */}
      <mesh position={[1, 0.55, -1.4]} castShadow receiveShadow>
        <boxGeometry args={[15, 1.1, 10]} />
        <meshStandardMaterial {...concrete} color="#D8D4CC" roughness={0.9} />
      </mesh>

      {/* ---- ground-floor glazing ----
           The room's front opening runs the full span between the stone cores,
           x -5.69..7.69. Only the middle of it was glazed, so there were two
           3.09-wide holes in the elevation with nothing in them — from square
           on, the house read as though the glass had been taken out either
           side of the door. These two panels close them. */}
      <Glass position={[-4.145, GROUND_Y + 1.6, 1.9]} args={[3.09, 3.2, 0.06]} />
      <Mullions position={[-4.145, GROUND_Y + 1.6, 1.97]} width={3.09} height={3.2} bays={2} />
      <Glass position={[-1.35, GROUND_Y + 1.6, 1.9]} args={[2.5, 3.2, 0.06]} />
      <Mullions position={[-1.35, GROUND_Y + 1.6, 1.97]} width={2.5} height={3.2} bays={1} />
      <Glass position={[3.6, GROUND_Y + 1.6, 1.9]} args={[2.0, 3.2, 0.06]} />
      <Mullions position={[3.6, GROUND_Y + 1.6, 1.97]} width={2.0} height={3.2} bays={1} />
      <Glass position={[6.145, GROUND_Y + 1.6, 1.9]} args={[3.09, 3.2, 0.06]} />
      <Mullions position={[6.145, GROUND_Y + 1.6, 1.97]} width={3.09} height={3.2} bays={2} />

      {/* ---- the sliding leaf, parked open ----
           The doorway has to stay clear because the camera walks through it,
           but an unexplained 2.5-wide hole in a glass wall reads as a missing
           pane. Putting the leaf on a track outboard of the fixed glazing says
           what is actually going on: the door is open, not absent. */}
      <mesh position={[2.65, GROUND_Y + 3.42, 2.06]} castShadow>
        <boxGeometry args={[5.2, 0.12, 0.1]} />
        <meshStandardMaterial color={FRAME} roughness={0.4} metalness={0.4} />
      </mesh>
      <Glass position={[3.9, GROUND_Y + 1.58, 2.06]} args={[2.5, 3.16, 0.05]} />
      <Mullions position={[3.9, GROUND_Y + 1.58, 2.12]} width={2.5} height={3.16} bays={1} />
      {/* door reveal + header */}
      <mesh position={[1.4, GROUND_Y + 3.35, 1.9]}>
        <boxGeometry args={[2.6, 0.28, 0.16]} />
        <meshStandardMaterial color={FRAME} roughness={0.45} metalness={0.35} />
      </mesh>
      {[0.15, 2.65].map((x) => (
        <mesh key={x} position={[x, GROUND_Y + 1.6, 1.9]}>
          <boxGeometry args={[0.14, 3.5, 0.16]} />
          <meshStandardMaterial color={FRAME} roughness={0.45} metalness={0.35} />
        </mesh>
      ))}

      {/* ---- GROUND FLOOR INTERIOR ---- */}
      <group position={[1, GROUND_Y, -2]}>
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[13.4, 0.08, 8.4]} />
          <meshStandardMaterial {...wood} roughness={0.55} />
        </mesh>
        {/* ---- pale ceiling, split around the same stairwell void as the
             structural slab above it (world x 2.8..6.0, z -3.5..1.7; this
             group sits at [1, GROUND_Y, -2], so local x 1.8..5.0, z -1.5..3.7).
             As one solid panel it sealed the opening the slab had carefully
             left, and the climb ran the camera straight into it. ---- */}
        <mesh position={[-2.45, 3.02, 0]}>
          <boxGeometry args={[8.5, 0.08, 8.4]} />
          <meshStandardMaterial {...plasterFine} color="#F2EFE8" roughness={0.95} />
        </mesh>
        <mesh position={[5.85, 3.02, 0]}>
          <boxGeometry args={[1.7, 0.08, 8.4]} />
          <meshStandardMaterial {...plasterFine} color="#F2EFE8" roughness={0.95} />
        </mesh>
        <mesh position={[3.4, 3.02, -2.85]}>
          <boxGeometry args={[3.2, 0.08, 2.7]} />
          <meshStandardMaterial {...plasterFine} color="#F2EFE8" roughness={0.95} />
        </mesh>
        <mesh position={[3.4, 3.02, 3.95]}>
          <boxGeometry args={[3.2, 0.08, 0.5]} />
          <meshStandardMaterial {...plasterFine} color="#F2EFE8" roughness={0.95} />
        </mesh>
        {/* stone reveals are exterior cladding; line the room in plaster */}
        {[-6.5, 6.5].map((x) => (
          <mesh key={x} position={[x, 1.7, 0]} receiveShadow>
            <boxGeometry args={[0.1, 3.3, 8.4]} />
            <meshStandardMaterial {...plasterFine} color="#EFECE4" roughness={0.95} />
          </mesh>
        ))}

        {/* ---- skirting and cornice ----
             In the showroom reference every wall meets the floor through a
             white skirting board and the ceiling through a shadow gap. Rooms
             whose surfaces meet at a raw corner read as a 3D model; rooms with
             trim read as built. It is four boxes and it does more than any
             amount of extra furniture. */}
        {[-6.42, 6.42].map((x) => (
          <mesh key={`sk${x}`} position={[x, 0.16, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.06, 0.18, 8.4]} />
            <meshStandardMaterial {...plasterFine} color="#FBF9F4" roughness={0.6} />
          </mesh>
        ))}
        {[-4.16, 4.16].map((z) => (
          <mesh key={`skz${z}`} position={[0, 0.16, z]} castShadow receiveShadow>
            <boxGeometry args={[13.4, 0.18, 0.06]} />
            <meshStandardMaterial {...plasterFine} color="#FBF9F4" roughness={0.6} />
          </mesh>
        ))}
        {/* recessed shadow gap at the ceiling line */}
        {[-6.44, 6.44].map((x) => (
          <mesh key={`cg${x}`} position={[x, 3.26, 0]}>
            <boxGeometry args={[0.04, 0.07, 8.4]} />
            <meshStandardMaterial color="#9C978C" roughness={1} />
          </mesh>
        ))}

        {/* living: sofa, table, rug, media wall */}
        <mesh position={[-2.4, 0.09, 0.4]} receiveShadow>
          <boxGeometry args={[5.4, 0.03, 3.8]} />
          <meshStandardMaterial {...carpet} color="#B3AA98" roughness={1} />
        </mesh>
        <group position={[-2.4, 0, -0.9]}>
          <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
            <boxGeometry args={[4.4, 0.58, 1.7]} />
            <meshStandardMaterial {...fabric} color="#8C877C" roughness={0.96} />
          </mesh>
          <mesh position={[0, 0.96, -0.7]} castShadow receiveShadow>
            <boxGeometry args={[4.4, 0.86, 0.3]} />
            <meshStandardMaterial {...fabric} color="#8C877C" roughness={0.96} />
          </mesh>
          {[-2.15, 2.15].map((x) => (
            <mesh key={x} position={[x, 0.76, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.3, 1.04, 1.7]} />
              <meshStandardMaterial {...fabric} color="#7C776D" roughness={0.96} />
            </mesh>
          ))}
          {/* seat cushions — a sofa without a cushion line is a bench */}
          {[-1.42, 0, 1.42].map((x) => (
            <mesh key={`c${x}`} position={[x, 0.75, 0.12]} castShadow receiveShadow>
              <boxGeometry args={[1.34, 0.18, 1.42]} />
              <meshStandardMaterial {...fabric} color="#96907F" roughness={0.95} />
            </mesh>
          ))}
        </group>
        <mesh position={[-2.4, 0.44, 1.1]} castShadow>
          <boxGeometry args={[2.4, 0.1, 1.1]} />
          <meshStandardMaterial {...joinery} color="#C0A883" roughness={0.45} />
        </mesh>

        {/* dining */}
        <mesh position={[3.6, 0.78, 0.6]} castShadow>
          <boxGeometry args={[3.2, 0.09, 1.4]} />
          <meshStandardMaterial {...joinery} color="#C0A883" roughness={0.4} />
        </mesh>
        {[[-1.4, 0.6], [1.4, 0.6]].map(([x, z], i) => (
          <mesh key={i} position={[3.6 + x, 0.38, z]} castShadow>
            <boxGeometry args={[0.12, 0.76, 1.1]} />
            <meshStandardMaterial color="#2E2E2C" roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
        <Chair position={[2.5, 0, -0.5]} rotation={0} />
        <Chair position={[4.7, 0, -0.5]} rotation={0} />
        <Chair position={[2.5, 0, 1.7]} rotation={Math.PI} />
        <Chair position={[4.7, 0, 1.7]} rotation={Math.PI} />

        {/* ---- kitchen ----
             The run itself was fine; the nine metres of bare plaster above it
             was not. It was the largest unbroken surface in the room and it
             sat directly behind the dining shot, so the frame was half empty
             wall. A splashback and a line of wall units break it into bands at
             the heights a kitchen actually has them. */}
        <mesh position={[0, 0.5, -3.6]} castShadow>
          <boxGeometry args={[9, 1.0, 0.8]} />
          <meshStandardMaterial {...paint} color="#DCD8CF" roughness={0.5} />
        </mesh>
        {/* cabinet door lines — a 9m slab with no joints reads as a plinth */}
        {[-3.4, -1.7, 0, 1.7, 3.4].map((x) => (
          <mesh key={`kd${x}`} position={[x, 0.5, -3.19]}>
            <boxGeometry args={[0.012, 0.92, 0.012]} />
            <meshStandardMaterial color="#B9B4AA" roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 1.02, -3.6]}>
          <boxGeometry args={[9.1, 0.06, 0.86]} />
          <meshStandardMaterial {...marble} color="#6E6C66" roughness={0.22} metalness={0.05} />
        </mesh>
        {/* splashback */}
        <mesh position={[0, 1.45, -3.96]} receiveShadow>
          <boxGeometry args={[9, 0.78, 0.05]} />
          <meshStandardMaterial {...paint} color="#8A867D" roughness={0.3} metalness={0.04} />
        </mesh>
        {/* wall units, with a shadow gap under them for the strip light */}
        {[-3.3, -1.1, 1.1, 3.3].map((x) => (
          <group key={`ku${x}`} position={[x, 2.28, -3.79]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.1, 0.74, 0.4]} />
              <meshStandardMaterial {...paint} color="#CBC6BB" roughness={0.55} />
            </mesh>
            {/* under-cabinet strip. This bar was already here as trim; lit,
                it becomes the source of the wash on the splashback below —
                which until now arrived from a point light hanging in front of
                the wall with nothing attached to it, and showed up as a bright
                smudge in the middle of the tiles. */}
            <mesh position={[0, -0.3, 0.21]}>
              <boxGeometry args={[1.5, 0.02, 0.02]} />
              <meshStandardMaterial
                color={night ? '#FFEDCC' : '#8E8A80'}
                emissive="#FFB861"
                emissiveIntensity={night ? 2.2 : 0}
                roughness={0.5}
                metalness={0.4}
              />
            </mesh>
          </group>
        ))}
        {/* Two, tucked to the front lip of the wall units and aligned with the
            strips above them, rather than one in the middle of the room: the
            wash now starts where the fitting is. */}
        {[-2.2, 2.2].map((x) => (
          <pointLight
            key={`kul${x}`}
            position={[x, 1.84, -3.45]}
            intensity={night ? 1.1 : 0.3}
            distance={4.6}
            color={warm}
          />
        ))}

        {/* No pendants over the dining table, and they are not coming back:
            the table sits beneath the staircase. The flight passes over it
            between y 2.76 and 3.73, and a drop long enough to hang at eating
            height starts above that — so the cords ran straight through the
            treads and showed up as two black rods standing in the middle of
            the stair on the way up. Anywhere on this table is under the
            flight, so there is no position that works. */}

        {/* ---- things on the surfaces ----
             Bare tabletops are the last thing that says "showhome model". */}
        {/* books and a bowl on the low table */}
        <mesh position={[-2.95, 0.52, 1.0]} rotation={[0, 0.24, 0]} castShadow>
          <boxGeometry args={[0.42, 0.045, 0.3]} />
          <meshStandardMaterial color="#7C4A38" roughness={0.75} />
        </mesh>
        <mesh position={[-2.93, 0.56, 1.02]} rotation={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.4, 0.035, 0.28]} />
          <meshStandardMaterial color="#D9D3C6" roughness={0.8} />
        </mesh>
        <mesh position={[-1.85, 0.55, 1.16]} scale={[1, 0.5, 1]} castShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshStandardMaterial {...marble} color="#8C857A" roughness={0.35} />
        </mesh>
        {/* a vase down the middle of the dining table */}
        <mesh position={[3.6, 0.98, 0.6]} castShadow>
          <cylinderGeometry args={[0.07, 0.1, 0.3, 14]} />
          <meshStandardMaterial color="#4E6357" roughness={0.3} metalness={0.1} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh
            key={`st${i}`}
            position={[3.6 + (i - 1) * 0.05, 1.24, 0.6 + (i - 1) * 0.04]}
            rotation={[(i - 1) * 0.22, 0, (i - 1) * 0.3]}
            castShadow
          >
            <cylinderGeometry args={[0.012, 0.012, 0.42, 5]} />
            <meshStandardMaterial color="#4A6B3C" roughness={0.9} />
          </mesh>
        ))}

        {/* ---- pictures ----
             This was a flat grey box hung 0.85 units clear of the wall it was
             meant to be on, which from inside read as a slab hovering in the
             room. The lining's inner faces are at local x ±6.45, so the frames
             sit at ±6.42 and touch plaster.

             Swap any file in public/art for a photograph and it hangs here
             instead — see ART in useTextures. */}
        <Artwork
          position={[-6.42, 1.78, -0.9]}
          rotation={[0, Math.PI / 2, 0]}
          height={1.5}
          map={art.portrait}
          night={night}
          lit
        />
        <Artwork
          position={[6.42, 1.85, 0.7]}
          rotation={[0, -Math.PI / 2, 0]}
          height={1.05}
          map={art.horizon}
          night={night}
        />

        <Plant position={[5.4, 0, 2.4]} scale={1.15} />
        <Plant position={[-5.4, 0, 2.6]} />

        {/* ---- ceiling downlights ----
             The room was lit by four invisible point lights. By day the sun
             covers for that; after dark it read as a room with its brightness
             turned up rather than one with its lamps on, because nothing in
             frame was the source of anything.

             Only three of the seven carry a light. The rest are fittings,
             which cost nothing and are what the eye is actually looking for —
             a downlight three metres away contributes very little illumination
             in a real room either. Positions follow the ceiling panels: the
             stairwell void runs local x 1.8..5.0, z -1.5..3.7 and has no
             soffit to recess anything into. */}
        {([
          [-4.9, -2.6, 1],
          [-4.9, 1.0, 0],
          [-1.7, -2.6, 0],
          [-1.7, 1.0, 0],
          [3.4, -2.9, 0],
          [5.85, -1.6, 0],
          [5.85, 1.8, 1],
        ] as const).map(([x, z, on], i) => (
          <Downlight
            key={`dl${i}`}
            position={[x, 2.98, z]}
            night={night}
            intensity={on ? lamp * 1.15 : 0}
            distance={12}
            color={warm}
          />
        ))}
        {/* over the dining end, which sits under the open stairwell */}
        <pointLight position={[3.4, 2.7, 0.4]} intensity={lamp * 0.85} distance={12} color={warm} />

        {/* ---- wall lights ----
             A downlight tells you where a lamp is. A sconce tells you what
             light does: it sits 140mm off the plaster, so its falloff paints a
             pool that fades as it travels, and a wall lit that way can only
             have been lit from a point on it. */}
        <Sconce
          position={[-6.4, 1.95, 0.7]}
          rotation={[0, Math.PI / 2, 0]}
          night={night}
          intensity={1.6}
        />
        <Sconce
          position={[6.4, 1.95, -1.9]}
          rotation={[0, -Math.PI / 2, 0]}
          night={night}
          intensity={1.6}
        />
      </group>

      {/* ---- mid slab, split around a stairwell void at x 3.2..5.4 ----
           The camera climbs a real flight through this opening; a solid slab
           would mean it passed through the ceiling. */}
      <mesh position={[-1.95, UPPER_Y - 0.2, -1.2]} castShadow receiveShadow>
        <boxGeometry args={[9.5, 0.4, 11]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.7} />
      </mesh>
      <mesh position={[7.35, UPPER_Y - 0.2, -1.2]} castShadow receiveShadow>
        <boxGeometry args={[2.7, 0.4, 11]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.7} />
      </mesh>
      {/* close the void fore and aft of the flight */}
      <mesh position={[4.4, UPPER_Y - 0.2, -5.1]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.4, 3.2]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.7} />
      </mesh>
      <mesh position={[4.4, UPPER_Y - 0.2, 3.0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.4, 2.6]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.7} />
      </mesh>

      {/* ---- stairwell trim: a fascia round the void so the opening reads
           as architecture rather than a hole punched in the slab ---- */}
      {[[4.65, -3.62], [4.65, 1.82]].map(([x, z], i) => (
        <mesh key={i} position={[x, UPPER_Y - 0.2, z]}>
          <boxGeometry args={[2.7, 0.46, 0.12]} />
          <meshStandardMaterial {...paint} color="#E4DFD4" roughness={0.8} />
        </mesh>
      ))}
      {[[3.32, -0.9], [5.98, -0.9]].map(([x, z], i) => (
        <mesh key={i} position={[x, UPPER_Y - 0.2, z]}>
          <boxGeometry args={[0.12, 0.46, 5.4]} />
          <meshStandardMaterial {...paint} color="#E4DFD4" roughness={0.8} />
        </mesh>
      ))}
      {/* daylight down the stairwell — the eye follows it upward */}
      <pointLight position={[4.65, UPPER_Y + 1.4, -0.9]} intensity={night ? 1.4 : 2.6} distance={11} color={warm} />

      {/* ---- STAIRCASE: ground 1.14 -> first floor 4.64, 18 risers ----
           Treads alone read as floating slats. A flight you believe in needs
           the riser face closing each step, a nosing that overhangs it, and a
           handrail at hand height — that is what gives it scale. Widened to
           2.0 so it does not look like a service stair. */}
      <group>
        {Array.from({ length: 18 }, (_, i) => {
          const y = 1.24 + i * 0.194;
          const z = 1.5 - i * 0.28;
          return (
            <group key={i}>
              {/* tread, with a 0.04 nosing proud of the riser below */}
              <mesh position={[4.65, y, z]} castShadow receiveShadow>
                <boxGeometry args={[2.0, 0.11, 0.34]} />
                <meshStandardMaterial {...oak} color="#C9B79A" roughness={0.6} />
              </mesh>
              {/* riser: the vertical face under the nosing */}
              <mesh position={[4.65, y - 0.152, z - 0.155]} castShadow receiveShadow>
                <boxGeometry args={[2.0, 0.194, 0.03]} />
                <meshStandardMaterial {...paint} color="#F4F1EA" roughness={0.8} />
              </mesh>
            </group>
          );
        })}
        {/* stringer under the treads */}
        <mesh position={[4.65, 2.5, -0.9]} rotation={[0.605, 0, 0]} castShadow>
          <boxGeometry args={[2.1, 0.16, 5.9]} />
          <meshStandardMaterial {...paint} color={RENDER_WHITE} roughness={0.9} />
        </mesh>
        {/* handrail, 0.95 above the pitch line on the open side */}
        <mesh position={[3.62, 3.84, -0.88]} rotation={[0.605, 0, 0]} castShadow>
          <boxGeometry args={[0.07, 0.07, 5.9]} />
          <meshStandardMaterial color="#B79C77" roughness={0.4} />
        </mesh>
        {/* glass balustrade along the open side */}
        <mesh position={[3.62, 3.35, -0.9]} rotation={[0.605, 0, 0]}>
          <boxGeometry args={[0.04, 1.0, 5.9]} />
          <meshStandardMaterial
            color="#CFDAD8"
            transparent
            opacity={0.26}
            roughness={0.08}
            metalness={0.1}
            envMapIntensity={2}
          />
        </mesh>
      </group>

      {/* ---- FIRST FLOOR: bedroom ---- */}
      <group position={[1, UPPER_Y, -2]}>
        {/* split around the stairwell (world x 3.2..5.4 -> local 2.2..4.4) */}
        <mesh position={[-1.95, 0.04, 0]} receiveShadow>
          <boxGeometry args={[9.5, 0.08, 8.4]} />
          <meshStandardMaterial {...woodUp} roughness={0.55} />
        </mesh>
        <mesh position={[6.35, 0.04, 0]} receiveShadow>
          <boxGeometry args={[2.7, 0.08, 8.4]} />
          <meshStandardMaterial {...woodUp} roughness={0.55} />
        </mesh>
        <mesh position={[3.4, 0.04, -3.1]} receiveShadow>
          <boxGeometry args={[3.2, 0.08, 2.2]} />
          <meshStandardMaterial {...woodUp} roughness={0.55} />
        </mesh>
        <mesh position={[0, 3.3, 0]}>
          <boxGeometry args={[13.4, 0.08, 8.4]} />
          <meshStandardMaterial {...plaster} color={RENDER_WHITE} roughness={0.95} />
        </mesh>

        {/* ---- enclosing walls ----
             Without these the bedroom is open to the sky and the camera looks
             straight out of the building while climbing the stair. */}
        {[-6.65, 6.65].map((x) => (
          <mesh key={x} position={[x, 1.7, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.14, 3.3, 8.4]} />
            <meshStandardMaterial {...plaster} color="#EFECE4" roughness={0.95} />
          </mesh>
        ))}
        <mesh position={[0, 1.7, -4.17]} receiveShadow castShadow>
          <boxGeometry args={[13.4, 3.3, 0.14]} />
          <meshStandardMaterial {...plaster} color="#EFECE4" roughness={0.95} />
        </mesh>
        {/* front returns either side of the glazing */}
        {[[-4.9, 3.6], [5.6, 2.2]].map(([x, w]) => (
          <mesh key={x} position={[x, 1.7, 4.17]} receiveShadow castShadow>
            <boxGeometry args={[w, 3.3, 0.14]} />
            <meshStandardMaterial {...plaster} color="#EFECE4" roughness={0.95} />
          </mesh>
        ))}
        {/* ---- balustrade around the open stairwell edge ----
             The void is world x 2.8..6.0, z -3.5..1.7 (local x 1.8..5.0,
             z -1.5..3.7). This previously ran z -3.2..1.2, so it guarded solid
             floor at one end and left the opening unprotected at the other. */}
        <mesh position={[1.8, 0.55, 1.1]}>
          <boxGeometry args={[0.05, 1.0, 5.2]} />
          <meshStandardMaterial
            color="#CFDAD8"
            transparent
            opacity={0.26}
            roughness={0.08}
            metalness={0.1}
            envMapIntensity={2}
          />
        </mesh>
        <mesh position={[3.4, 0.55, 3.7]}>
          <boxGeometry args={[3.2, 1.0, 0.05]} />
          <meshStandardMaterial
            color="#CFDAD8"
            transparent
            opacity={0.26}
            roughness={0.08}
            metalness={0.1}
            envMapIntensity={2}
          />
        </mesh>

        {/* skirting, as downstairs */}
        {[-6.55, 1.72].map((x) => (
          <mesh key={` usk${x}`} position={[x, 0.17, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.07, 0.18, 8.4]} />
            <meshStandardMaterial {...plasterFine} color="#FBF9F4" roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[-2.4, 0.17, -4.06]} castShadow receiveShadow>
          <boxGeometry args={[8.5, 0.18, 0.07]} />
          <meshStandardMaterial {...plasterFine} color="#FBF9F4" roughness={0.6} />
        </mesh>

        {/* ---- bed ----
             Was four bare white boxes, which is why it read as packaging
             rather than bedding. What makes a made bed legible is the layering:
             the duvet overhangs the base on three sides, the top sheet is
             turned back over it, and the pillows sit tilted against the
             headboard instead of lying flat. */}
        <group position={[-2.2, 0, -1.4]}>
          {/* divan base, inset so the duvet overhangs it */}
          <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.76, 0.36, 3.86]} />
            <meshStandardMaterial {...fabric} color="#6E6A62" roughness={0.9} />
          </mesh>
          {/* mattress */}
          <mesh position={[0, 0.56, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.92, 0.28, 3.94]} />
            <meshStandardMaterial {...fabric} color="#E4DFD4" roughness={0.97} />
          </mesh>
          {/* duvet, proud of the mattress and hanging over the sides */}
          <mesh position={[0, 0.78, 0.34]} castShadow receiveShadow>
            <boxGeometry args={[3.08, 0.2, 3.3]} />
            <meshStandardMaterial {...fabric} color="#EFEBE2" roughness={0.98} />
          </mesh>
          {/* the fall of the duvet down each side */}
          {[-1.5, 1.5].map((x) => (
            <mesh key={`df${x}`} position={[x, 0.6, 0.34]} castShadow>
              <boxGeometry args={[0.1, 0.34, 3.3]} />
              <meshStandardMaterial {...fabric} color="#E8E3D9" roughness={0.98} />
            </mesh>
          ))}
          {/* top sheet, turned back across the duvet */}
          <mesh position={[0, 0.885, -0.86]} rotation={[0.04, 0, 0]} castShadow>
            <boxGeometry args={[3.04, 0.04, 0.66]} />
            <meshStandardMaterial {...fabric} color="#FAF8F3" roughness={0.98} />
          </mesh>
          {/* headboard, upholstered and panelled */}
          <mesh position={[0, 0.95, -2.06]} castShadow receiveShadow>
            <boxGeometry args={[3.24, 1.5, 0.14]} />
            <meshStandardMaterial {...fabric} color={LINEN} roughness={0.96} />
          </mesh>
          {[-1.0, 0, 1.0].map((x) => (
            <mesh key={`hp${x}`} position={[x, 1.0, -1.97]} castShadow>
              <boxGeometry args={[0.96, 1.3, 0.06]} />
              <meshStandardMaterial {...fabric} color="#CEC8BA" roughness={0.96} />
            </mesh>
          ))}
          {/* pillows, tilted back against the headboard */}
          {[-0.68, 0.68].map((x) => (
            <mesh key={x} position={[x, 0.98, -1.62]} rotation={[-0.42, 0, 0]} castShadow>
              <boxGeometry args={[1.22, 0.24, 0.7]} />
              <meshStandardMaterial {...fabric} color="#F8F5EE" roughness={0.98} />
            </mesh>
          ))}
          {/* smaller cushions in front of them */}
          {[-0.46, 0.46].map((x) => (
            <mesh key={`c${x}`} position={[x, 0.96, -1.16]} rotation={[-0.2, 0, 0]} castShadow>
              <boxGeometry args={[0.62, 0.18, 0.5]} />
              <meshStandardMaterial {...fabric} color="#C9C2B2" roughness={0.98} />
            </mesh>
          ))}
          {/* throw folded across the foot */}
          <mesh position={[0, 0.9, 1.28]} castShadow>
            <boxGeometry args={[3.12, 0.07, 0.92]} />
            <meshStandardMaterial {...fabric} color="#8D9A7C" roughness={0.98} />
          </mesh>
          {[-1.52, 1.52].map((x) => (
            <mesh key={`tf${x}`} position={[x, 0.72, 1.28]} castShadow>
              <boxGeometry args={[0.08, 0.3, 0.92]} />
              <meshStandardMaterial {...fabric} color="#84906F" roughness={0.98} />
            </mesh>
          ))}
        </group>

        {/* bedside tables + lamps */}
        {[-4.1, -0.3].map((x) => (
          <group key={x} position={[x, 0, -3.1]}>
            <mesh position={[0, 0.26, 0]} castShadow>
              <boxGeometry args={[0.66, 0.5, 0.5]} />
              <meshStandardMaterial {...joinery} color="#C0A883" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.66, 0]}>
              <cylinderGeometry args={[0.17, 0.21, 0.3, 14]} />
              <meshStandardMaterial
                color="#F3EDE1"
                emissive="#FFB861"
                emissiveIntensity={night ? 1.6 : 0.15}
                roughness={0.9}
              />
            </mesh>
            <pointLight position={[0, 0.7, 0]} intensity={night ? 1.6 : 0} distance={5} color="#FFB861" />
          </group>
        ))}

        {/* over the headboard — the wall the camera faces for the whole of
            the last third of the journey, and until now bare plaster */}
        <Artwork
          position={[-2.2, 1.95, -4.07]}
          height={1.25}
          map={art.strata}
          night={night}
        />

        {/* ---- wardrobe, with doors and handles rather than one slab ---- */}
        <group position={[-6.2, 0, -1.4]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 2.4, 0.66]} />
            <meshStandardMaterial {...joinery} color="#C4B49B" roughness={0.62} />
          </mesh>
          {/* door leaves, proud of the carcass so the joints catch light */}
          {[-1.18, -0.39, 0.39, 1.18].map((x) => (
            <mesh key={x} position={[x, 1.2, 0.35]} castShadow>
              <boxGeometry args={[0.74, 2.3, 0.05]} />
              <meshStandardMaterial {...joinery} color="#CDBEA6" roughness={0.5} />
            </mesh>
          ))}
          {[-0.79, 0.79].map((x) => (
            <mesh key={`h${x}`} position={[x, 1.2, 0.4]} castShadow>
              <boxGeometry args={[0.03, 0.5, 0.03]} />
              <meshStandardMaterial color="#3A3A38" roughness={0.35} metalness={0.7} />
            </mesh>
          ))}
        </group>

        {/* ---- dressing table + mirror + stool ---- */}
        <group position={[-4.4, 0, -3.72]}>
          <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.7, 0.06, 0.52]} />
            <meshStandardMaterial {...joinery} color="#C4B49B" roughness={0.45} />
          </mesh>
          {[-0.78, 0.78].map((x) => (
            <mesh key={x} position={[x, 0.37, 0]} castShadow>
              <boxGeometry args={[0.06, 0.74, 0.48]} />
              <meshStandardMaterial color="#3A3A38" roughness={0.4} metalness={0.6} />
            </mesh>
          ))}
          {/* mirror */}
          <mesh position={[0, 1.62, 0.16]} castShadow>
            <boxGeometry args={[1.0, 1.5, 0.05]} />
            <meshStandardMaterial color="#6E7477" roughness={0.06} metalness={0.95} envMapIntensity={1.1} />
          </mesh>
          {/* stool */}
          <mesh position={[0, 0.44, 0.7]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.1, 0.5]} />
            <meshStandardMaterial {...fabric} color="#8E8877" roughness={0.95} />
          </mesh>
          {[[-0.24, 0.19], [0.24, 0.19], [-0.24, -0.19], [0.24, -0.19]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.19, 0.7 + z]} castShadow>
              <boxGeometry args={[0.04, 0.39, 0.04]} />
              <meshStandardMaterial color="#3A3A38" roughness={0.4} metalness={0.6} />
            </mesh>
          ))}
        </group>

        {/* bench at the foot of the bed */}
        <mesh position={[-2.2, 0.42, 0.95]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.16, 0.6]} />
          <meshStandardMaterial {...fabric} color="#9A937F" roughness={0.95} />
        </mesh>
        {[-1.06, 1.06].map((x) => (
          <mesh key={`bl${x}`} position={[-2.2 + x, 0.17, 0.95]} castShadow>
            <boxGeometry args={[0.08, 0.34, 0.54]} />
            <meshStandardMaterial color="#3A3A38" roughness={0.4} metalness={0.6} />
          </mesh>
        ))}

        {/* rug under the bed */}
        <mesh position={[-2.2, 0.1, -0.5]} receiveShadow>
          <boxGeometry args={[4.6, 0.03, 5.0]} />
          <meshStandardMaterial {...carpet} color="#B5AC9A" roughness={1} />
        </mesh>

        {/* reading chair and side table by the glazing */}
        <group position={[0.4, 0, 2.5]} rotation={[0, -0.5, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.36, 0.86]} />
            <meshStandardMaterial {...fabric} color="#8A8474" roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.78, -0.38]} castShadow>
            <boxGeometry args={[0.9, 0.72, 0.16]} />
            <meshStandardMaterial {...fabric} color="#8A8474" roughness={0.95} />
          </mesh>
        </group>
        <mesh position={[1.3, 0.28, 2.0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.24, 0.52, 20]} />
          <meshStandardMaterial {...marble} color="#8C8A84" roughness={0.3} />
        </mesh>

        {/* art over the headboard */}
        <mesh position={[-2.2, 2.0, -4.04]} castShadow>
          <boxGeometry args={[1.5, 0.95, 0.05]} />
          <meshStandardMaterial color="#A8AE9C" roughness={0.9} />
        </mesh>
        <mesh position={[-2.2, 2.0, -4.0]}>
          <boxGeometry args={[1.6, 1.05, 0.03]} />
          <meshStandardMaterial color="#4A4A46" roughness={0.55} />
        </mesh>

        <Plant position={[1.2, 0, -3.4]} scale={1.1} />

        {/* as downstairs: fittings across the ceiling, two of them lit. The
            bedside lamps already gave this room a visible source, which is
            part of why it held up better at dusk than the floor below. */}
        {([
          [-4.6, 0.8, 0],
          [-2.0, -1.0, 1],
          [0.6, 0.8, 0],
          [3.4, 0.6, 0],
          [5.6, -1.6, 0],
        ] as const).map(([x, z, on], i) => (
          <Downlight
            key={`ul${i}`}
            position={[x, 3.26, z]}
            night={night}
            intensity={on ? lamp * 0.95 : 0}
            distance={13}
            color={warm}
          />
        ))}
        {/* either side of the headboard wall */}
        {[-5.3, 0.9].map((x) => (
          <Sconce
            key={`ubs${x}`}
            position={[x, 2.0, -4.06]}
            night={night}
            intensity={1.2}
          />
        ))}
      </group>

      {/* first-floor glazing, split around the balcony doors */}
      <Glass position={[-2.6, UPPER_Y + 1.7, 1.9]} args={[4.6, 3.2, 0.06]} />
      <Mullions position={[-2.6, UPPER_Y + 1.7, 1.97]} width={4.6} height={3.2} bays={2} />
      <Glass position={[4.4, UPPER_Y + 1.7, 1.9]} args={[2.4, 3.2, 0.06]} />
      <Mullions position={[4.4, UPPER_Y + 1.7, 1.97]} width={2.4} height={3.2} bays={1} />

      {/* ---- BALCONY ---- */}
      <mesh position={[1.4, UPPER_Y - 0.05, 3.4] } castShadow receiveShadow>
        <boxGeometry args={[7.4, 0.22, 3.4]} />
        <meshStandardMaterial {...concrete} color="#EDEAE2" roughness={0.9} />
      </mesh>
      <Balustrade position={[1.4, UPPER_Y + 0.06, 5.05]} width={7.4} />
      <Balustrade position={[-2.25, UPPER_Y + 0.06, 3.4]} width={3.4} rotation={[0, Math.PI / 2, 0]} />
      <Balustrade position={[5.05, UPPER_Y + 0.06, 3.4]} width={3.4} rotation={[0, Math.PI / 2, 0]} />
      <pointLight position={[1.4, UPPER_Y + 1.2, 3.4]} intensity={night ? 1.8 : 0} distance={8} color={warm} />

      {/* roof + timber soffit */}
      <mesh position={[1, 8.35, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[16.4, 0.55, 13.6]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.7} />
      </mesh>
      <mesh position={[1.4, 8.04, 4.2]} receiveShadow>
        <boxGeometry args={[10, 0.08, 5]} />
        <meshStandardMaterial color={TIMBER} roughness={0.65} />
      </mesh>

      {/* ================= RIGHT WING =================
           Hollowed out for the same reason as the left wing. The timber
           cladding stays on the outside faces; the room inside is lined. */}
      {/* plinth, as the left wing */}
      <mesh position={[12.5, 0.55, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[10.5, 1.1, 7.5]} />
        <meshStandardMaterial {...concrete} color="#CFCAC1" roughness={0.92} />
      </mesh>
      <mesh position={[12.5, GROUND_Y + 0.04, -0.6]} receiveShadow>
        <boxGeometry args={[11, 0.08, 8]} />
        <meshStandardMaterial {...wood} roughness={0.55} />
      </mesh>
      <mesh position={[12.5, GROUND_Y + 4.16, -0.6]} receiveShadow>
        <boxGeometry args={[11, 0.08, 8]} />
        <meshStandardMaterial {...plasterFine} color="#F2EFE8" roughness={0.95} />
      </mesh>
      <mesh position={[12.5, GROUND_Y + 2.1, -4.45]} castShadow receiveShadow>
        <boxGeometry args={[11, 4.2, 0.3]} />
        <meshStandardMaterial {...cladding} color="#A48C6E" roughness={0.75} />
      </mesh>
      {[7.15, 17.85].map((x) => (
        <mesh key={x} position={[x, GROUND_Y + 2.1, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 4.2, 8]} />
          <meshStandardMaterial {...cladding} color="#A48C6E" roughness={0.75} />
        </mesh>
      ))}
      <Glass position={[12.5, GROUND_Y + 2.0, 3.45]} args={[9.4, 3.0, 0.06]} />
      <Mullions position={[12.5, GROUND_Y + 2.0, 3.52]} width={9.4} height={3.0} bays={4} />
      <mesh position={[12.5, GROUND_Y + 4.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[12.4, 0.5, 10.4]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.7} />
      </mesh>
      {[
        [9.6, -1.6],
        [12.5, 1.0],
        [15.4, -1.6],
      ].map(([x, z], i) => (
        <Downlight key={`rw${i}`} position={[x, GROUND_Y + 4.12, z]} night={night} />
      ))}
      <pointLight position={[12.5, GROUND_Y + 1.8, 1]} intensity={night ? 2.6 : 0.5} distance={13} color={warm} />

      {/* ================= POOL ================= */}
      <mesh position={[-11, 0.32, 9.4]} receiveShadow>
        <boxGeometry args={[14, 0.28, 5]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.9} />
      </mesh>
      {/* ---- water ----
           High metalness made this a mirror tinted dark blue, which from above
           just reads as flat navy paint. Water is a dielectric: what sells it
           is Fresnel — looking straight down you see the pool colour, and at a
           grazing angle the sky takes over. That needs metalness at zero and
           roughness near it, with a faint normal ripple to break the specular. */}
      <mesh position={[-11, 0.47, 9.4]}>
        <boxGeometry args={[13.4, 0.05, 4.4]} />
        <meshStandardMaterial
          {...ripple}
          /* The surface is opaque, so lamps set under it were invisible and
             the pool stayed a flat mirror of whatever the sky was doing — at
             dusk that is a pale grey slab, which is the one thing a lit pool
             never looks like. The glow is therefore carried by the water, and
             the environment reflection pulled back at night so it does not
             wash the glow out. */
          color={night ? '#12454F' : '#2F7E92'}
          emissive={night ? '#22758A' : '#000000'}
          emissiveIntensity={night ? 0.5 : 0}
          roughness={0.055}
          metalness={0}
          envMapIntensity={night ? 0.85 : 1.9}
        />
      </mesh>
      {/* Pool interior, seen through the water. Its top was at 0.45 and the
          underside of the water at 0.445 — the two all but touching, so there
          was nowhere to put a light that was actually *in* the water. Ninety
          millimetres lower is invisible from any camera stop and leaves a
          volume to work in. */}
      <mesh position={[-11, 0.24, 9.4]} receiveShadow>
        <boxGeometry args={[13.2, 0.24, 4.2]} />
        <meshStandardMaterial color="#4E7F8C" roughness={0.6} />
      </mesh>

      {/* ---- pool lights ----
           An unlit pool at dusk is a black rectangle: water only reads as
           water when it is lit from within, because that is the one condition
           under which you see through the surface rather than off it. Four
           niches in the near wall, and two lamps under the surface between
           them doing the actual work. */}
      {/* Flat glow patches laid on the surface came next, standing in for
          lamps seen through it. From the establishing arc the camera is five
          metres up and twenty out, which compresses a 1.3 x 0.7 plane to a
          speck — three of them, scattered across a dark garden, read as
          fireflies. The water carrying its own glow is enough. */}
      {/* Above the surface, not below it: the point of these is the cyan spill
          across the coping and the paving beyond, which is how you read a lit
          pool from the far side of a garden. */}
      {night &&
        [-14, -8].map((x) => (
          <pointLight
            key={`pl${x}`}
            position={[x, 0.62, 9.4]}
            intensity={2.6}
            distance={8}
            color="#79CFE6"
          />
        ))}
      {/* ---- sun loungers ----
           Two floating slabs read as folded paper. A lounger is a frame with a
           cushion on it, lifted clear of the deck: the daylight gap underneath
           and the shadow it casts are what make it sit on the terrace rather
           than hover over it. */}
      {[-16, -13.6, -11.2, -8.8].map((x) => (
        <group key={x} position={[x, 0.3, 6.0]}>
          {/* frame legs */}
          {[[-0.36, 0.8], [0.36, 0.8], [-0.36, -0.8], [0.36, -0.8]].map(([lx, lz], i) => (
            <mesh key={i} position={[lx, 0.15, lz]} castShadow>
              <boxGeometry args={[0.045, 0.3, 0.045]} />
              <meshStandardMaterial color="#4A4844" roughness={0.4} metalness={0.7} />
            </mesh>
          ))}
          {/* side rails */}
          {[-0.38, 0.38].map((lx) => (
            <mesh key={lx} position={[lx, 0.31, 0]} castShadow>
              <boxGeometry args={[0.05, 0.05, 1.94]} />
              <meshStandardMaterial color="#4A4844" roughness={0.4} metalness={0.7} />
            </mesh>
          ))}
          {/* cushion, in three sections so it creases like a mattress */}
          {[-0.62, 0.0, 0.62].map((cz) => (
            <mesh key={cz} position={[0, 0.4, cz]} castShadow receiveShadow>
              <boxGeometry args={[0.8, 0.13, 0.58]} />
              <meshStandardMaterial {...fabric} color="#EDE9DF" roughness={0.92} />
            </mesh>
          ))}
          {/* raked backrest */}
          <mesh position={[0, 0.62, -1.02]} rotation={[-0.62, 0, 0]} castShadow>
            <boxGeometry args={[0.8, 0.12, 0.86]} />
            <meshStandardMaterial {...fabric} color="#EDE9DF" roughness={0.92} />
          </mesh>
        </group>
      ))}

      {/* Planters along the terrace edge. The first of these was at x -6,
          which put it inside the pool — the tank runs x -17.6..-4.4 — where it
          had been passing as a dark mass on dark paving. */}
      {[-1.6, 6, 10].map((x) => (
        <group key={x} position={[x, 0.3, 11.4]}>
          <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.6, 0.7, 1.2]} />
            <meshStandardMaterial {...concrete} color="#E8E5DD" roughness={0.9} />
          </mesh>
          {/* Clipped, not clumped. Overlapping spheres were meant to read as
              a shrub's ragged top; at this scale they read as green bubbles.
              A house with this much straight line in it would be planted with
              clipped hedging anyway, and a crisp box with a lighter top face
              is both more honest to the architecture and far more convincing
              than a pile of icosahedra. */}
          {[-0.78, 0, 0.78].map((sx, i) => (
            <group key={sx} position={[sx, 0, 0]}>
              <mesh position={[0, 0.94, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.7, 0.48, 0.92]} />
                <meshStandardMaterial
                  {...hedge}
                  color={['#33492C', '#374F2F', '#2E4429'][i % 3]}
                  roughness={1}
                />
              </mesh>
              <mesh position={[0, 1.185, 0]} receiveShadow>
                <boxGeometry args={[0.63, 0.03, 0.85]} />
                <meshStandardMaterial {...hedge} color="#3E5836" roughness={1} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* ================= GROUNDS =================
           The plot was a flat green plane running to a dead-straight horizon,
           and every establishing shot had the villa sitting in the middle of
           nothing. Three things fix that, in order of how much they do:

           a backdrop, so the house has something behind it;
           a middle distance, so the eye can measure how far away the backdrop
           is; and a foreground, so the lower third of frame is not bare turf.

           All of it stays clear of the camera's outdoor arc, which sweeps
           x -23..22 at z 13..28. */}

      {/* ---- distant land ----
           Heavily fogged (the fog runs 70..260), so these read as soft
           silhouettes rather than geometry — which is the entire point. A
           straight horizon is the single strongest tell that a scene is a
           plane with a sky behind it. */}
      {hills.map((h, i) => (
        <mesh key={`hill${i}`} position={[h.x, -h.r * h.f * 0.45, h.z]} scale={[1, h.f, 1]}>
          <icosahedronGeometry args={[h.r, 2]} />
          <meshStandardMaterial
            color={night ? '#28303A' : '#7C8C79'}
            roughness={1}
            flatShading
          />
        </mesh>
      ))}


      {/* ---- garden walk ----
           A path running the width of the plot, parallel to the terrace. It
           sits at z 17.5, which is between the camera arc and the house, so it
           crosses the lower third of every establishing shot and gives the
           lawn a line to read against. */}
      <mesh position={[-1, 0.04, 17.6]} receiveShadow>
        <boxGeometry args={[58, 0.08, 3.2]} />
        <meshStandardMaterial {...concreteBig} color="#CDC5B4" roughness={1} />
      </mesh>
      {/* kerbs — a path without an edge reads as a decal on the grass */}
      {[16.0, 19.2].map((z) => (
        <mesh key={z} position={[-1, 0.06, z]} receiveShadow castShadow>
          <boxGeometry args={[58, 0.12, 0.22]} />
          <meshStandardMaterial {...concrete} color="#EDE8DC" roughness={0.9} />
        </mesh>
      ))}
      {/* spur up to the lawn steps, so the walk connects to the house */}
      <mesh position={[2, 0.04, 16.4]} receiveShadow>
        <boxGeometry args={[9.4, 0.08, 3.4]} />
        <meshStandardMaterial {...concreteBig} color="#CDC5B4" roughness={1} />
      </mesh>

      {/* ---- stepping stones out onto the lawn ---- */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={`ss${i}`} position={[-12 - i * 0.35, 0.03, 20.4 + i * 1.5]} receiveShadow>
          <boxGeometry args={[1.5, 0.06, 0.95]} />
          <meshStandardMaterial {...concrete} color="#D9D3C6" roughness={0.95} />
        </mesh>
      ))}

      {/* ---- clipped beds either side of the spur ----
           Formal planting, because a garden that reads as designed is what
           separates a house on a lawn from a house on an estate. */}
      {[[-9.5, 13], [13.5, 13]].map(([cx, w]) => (
        <group key={`bed${cx}`} position={[cx, 0, 17.6]}>
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[w, 0.1, 2.4]} />
            <meshStandardMaterial {...concrete} color="#6E6355" roughness={1} />
          </mesh>
          {Array.from({ length: Math.round(w / 3.2) }, (_, i) => {
            const n = Math.round(w / 3.2);
            const seg = (w - 0.6) / n;
            return (
              <group key={i} position={[-(w - 0.6) / 2 + seg * (i + 0.5), 0, 0]}>
                <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
                  <boxGeometry args={[seg - 0.22, 0.52, 1.9]} />
                  <meshStandardMaterial
                    {...hedge}
                    color={['#33492C', '#374F2F', '#2E4429'][i % 3]}
                    roughness={1}
                  />
                </mesh>
                <mesh position={[0, 0.625, 0]} receiveShadow>
                  <boxGeometry args={[seg - 0.32, 0.03, 1.78]} />
                  <meshStandardMaterial {...hedge} color="#3E5836" roughness={1} />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}

      {/* ---- bollard lights along the walk ----
           Dark posts by day; at dusk they are the thing that makes the grounds
           look occupied rather than merely lit. */}
      {[-22, -16, -10, 8, 14, 20].map((x) => (
        <group key={`bol${x}`} position={[x, 0, 19.9]}>
          <mesh position={[0, 0.32, 0]} castShadow>
            <boxGeometry args={[0.13, 0.64, 0.13]} />
            <meshStandardMaterial color="#3A3833" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.68, 0]}>
            <boxGeometry args={[0.17, 0.09, 0.17]} />
            <meshStandardMaterial
              color={night ? '#FFD9A0' : '#CFCABE'}
              emissive={night ? '#FFB861' : '#000000'}
              emissiveIntensity={night ? 2.4 : 0}
              roughness={0.4}
            />
          </mesh>
          {/* Every other post carries a light. Six lamps down one path is six
              point lights in every night frame, for a run whose pools overlap
              anyway — and the terrace now has plenty else to pay for. */}
          {night && [-22, -10, 14].includes(x) && (
            <pointLight position={[0, 0.7, 0]} intensity={2.4} distance={7} color="#FFB861" />
          )}
        </group>
      ))}

      {/* ---- pergola over the far end of the terrace ----
           Sited at the right-hand end, clear of the camera's line to the house
           on every outdoor stop. Slats rather than a roof: the shadow they
           throw across the paving is most of what it is for. */}
      <group position={[14.5, 0.3, 8.2]}>
        {[[-2.6, -1.9], [2.6, -1.9], [-2.6, 1.9], [2.6, 1.9]].map(([px, pz], i) => (
          <mesh key={i} position={[px, 1.3, pz]} castShadow>
            <boxGeometry args={[0.16, 2.6, 0.16]} />
            <meshStandardMaterial {...cladding} color="#6E5236" roughness={0.72} />
          </mesh>
        ))}
        {[-1.9, 1.9].map((pz) => (
          <mesh key={`bm${pz}`} position={[0, 2.68, pz]} castShadow>
            <boxGeometry args={[5.5, 0.18, 0.12]} />
            <meshStandardMaterial {...cladding} color="#6E5236" roughness={0.72} />
          </mesh>
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <mesh key={`sl${i}`} position={[-2.5 + i * 0.5, 2.8, 0]} castShadow>
            <boxGeometry args={[0.08, 0.14, 4.1]} />
            <meshStandardMaterial {...cladding} color="#7C6042" roughness={0.78} />
          </mesh>
        ))}
        {/* a line of bulbs slung under the slats. The far end of the terrace
            was the darkest thing in the evening establishing shot, and a
            pergola nobody has bothered to light is a pergola nobody uses. */}
        {[-1.7, 0, 1.7].map((sx) => (
          <mesh key={`pg${sx}`} position={[sx, 2.62, 0]}>
            <sphereGeometry args={[0.075, 12, 10]} />
            <meshStandardMaterial
              color={night ? '#FFEBC8' : '#CFCABE'}
              emissive="#FFB861"
              emissiveIntensity={night ? 3.6 : 0}
              roughness={0.4}
            />
          </mesh>
        ))}
        {night && (
          <pointLight position={[0, 2.45, 0]} intensity={2.4} distance={8} color="#FFB861" />
        )}
        {/* outdoor table under it */}
        <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.08, 1.2]} />
          <meshStandardMaterial {...joinery} color="#C0A883" roughness={0.5} />
        </mesh>
        {[[-1.1, 0], [1.1, 0]].map(([lx], i) => (
          <mesh key={`lg${i}`} position={[lx, 0.37, 0]} castShadow>
            <boxGeometry args={[0.1, 0.74, 1.0]} />
            <meshStandardMaterial color="#3A3833" roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
        <Chair position={[-0.75, 0, 1.0]} rotation={Math.PI} />
        <Chair position={[0.75, 0, 1.0]} rotation={Math.PI} />
        <Chair position={[-0.75, 0, -1.0]} rotation={0} />
        <Chair position={[0.75, 0, -1.0]} rotation={0} />
      </group>

      {/* ================= PLANTING ================= */}
      {trees.map((t, i) => (
        <Tree key={i} position={[t.x, 0, t.z]} height={t.h} radius={t.r} seed={i} barkProps={bark} />
      ))}
      {/* Clipped hedge blocks closing either end of the terrace. */}
      {[-25, 23].map((x) => (
        <group key={x} position={[x, 0, 10]}>
          {[-2.45, 0, 2.45].map((z, i) => (
            <group key={z} position={[0, 0, z]}>
              <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.6, 1.04, 2.15]} />
                <meshStandardMaterial
                  {...hedge}
                  color={['#33492C', '#374F2F', '#2E4429'][i % 3]}
                  roughness={1}
                />
              </mesh>
              <mesh position={[0, 1.055, 0]} receiveShadow>
                <boxGeometry args={[2.45, 0.03, 2.02]} />
                <meshStandardMaterial {...hedge} color="#3E5836" roughness={1} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}
