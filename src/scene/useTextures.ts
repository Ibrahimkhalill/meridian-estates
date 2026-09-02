import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const BASE = 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k';

/**
 * Poly Haven PBR sets (CC0, CORS-enabled). Three maps per surface:
 *   diff    colour
 *   nor_gl  normals — the surface relief. Without this everything reads as
 *           flat plastic no matter how good the colour is.
 *   arm     ambient occlusion / roughness / metalness packed into RGB
 *
 * Little Workshop's showroom ships albedo + normal + metallic-smoothness for
 * every single surface — there is no untextured material anywhere in it. That
 * is most of why it reads as photographic, so nothing here goes bare either.
 */
const set = (name: string) => ({
  map: `${BASE}/${name}/${name}_diff_1k.jpg`,
  normalMap: `${BASE}/${name}/${name}_nor_gl_1k.jpg`,
  aoMap: `${BASE}/${name}/${name}_arm_1k.jpg`,
  roughnessMap: `${BASE}/${name}/${name}_arm_1k.jpg`,
});

export const TEXTURE_SETS = {
  concrete: set('concrete_floor_worn_001'),
  stone: set('stone_brick_wall_001'),
  woodFloor: set('wood_floor_deck'),
  grass: set('aerial_grass_rock'),
  bark: set('bark_brown_02'),
  plaster: set('painted_plaster_wall'),
  planks: set('wood_planks'),
  oak: set('oak_veneer_01'),
  fabric: set('fabric_leather_02'),
  carpet: set('dirty_carpet'),
  marble: set('marble_01'),
};

/** Repeats a loaded set and returns props ready to spread onto a material. */
export function useTiled(
  which: keyof typeof TEXTURE_SETS,
  repeat: [number, number]
) {
  const tex = useTexture(TEXTURE_SETS[which]);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());

  return useMemo(() => {
    // useTexture caches by URL, so clone before mutating or every surface
    // sharing this set inherits the last repeat that was applied.
    const cloned = {
      map: tex.map.clone(),
      normalMap: tex.normalMap.clone(),
      aoMap: tex.aoMap.clone(),
      roughnessMap: tex.roughnessMap.clone(),
    };

    for (const t of Object.values(cloned)) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat[0], repeat[1]);
      // Without anisotropy a tiled floor or lawn smears into grey mush the
      // moment the camera looks along it — which is exactly what a walkthrough
      // camera does for most of its journey.
      t.anisotropy = maxAniso;
      t.needsUpdate = true;
    }
    cloned.map.colorSpace = THREE.SRGBColorSpace;

    return cloned;
  }, [tex, repeat, maxAniso]);
}

/**
 * A painted / plain surface that still has relief. Returns the plaster set's
 * normal and roughness with no colour map, so `color` on the material still
 * drives the hue. Use it for anything that would otherwise be a bare
 * meshStandardMaterial — steps, stair treads, ceilings, trim, furniture.
 */
export function useSurface(
  repeat: [number, number] = [3, 3],
  which: keyof typeof TEXTURE_SETS = 'plaster',
  strength = 0.35
) {
  const tex = useTexture({
    normalMap: TEXTURE_SETS[which].normalMap,
    roughnessMap: TEXTURE_SETS[which].roughnessMap,
  });
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());

  return useMemo(() => {
    const cloned = {
      normalMap: tex.normalMap.clone(),
      roughnessMap: tex.roughnessMap.clone(),
    };
    for (const t of Object.values(cloned)) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat[0], repeat[1]);
      t.anisotropy = maxAniso;
      t.needsUpdate = true;
    }
    return { ...cloned, normalScale: new THREE.Vector2(strength, strength) };
  }, [tex, repeat, maxAniso, strength]);
}
