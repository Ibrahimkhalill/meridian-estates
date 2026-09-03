import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  ContactShadows,
  AdaptiveDpr,
  SoftShadows,
  Preload,
  useProgress,
} from '@react-three/drei';
import {
  EffectComposer,
  N8AO,
  ToneMapping,
  Vignette,
  BrightnessContrast,
  SMAA,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import Villa from './Villa';
import CameraRig from './CameraRig';

// Poly Haven skies (CC0), served from this site rather than their CDN: it is
// one less origin to resolve and connect to before anything can be drawn, and
// the night sky is only fetched if someone actually asks for dusk.
const HDRI_DAY = '/hdri/day.hdr';
const HDRI_NIGHT = '/hdri/night.hdr';

/**
 * three.js needs a second UV channel for aoMap. Box and plane geometries only
 * ship `uv`, so every aoMap in the scene was silently doing nothing — the
 * crevice shading baked into the ARM maps never reached the shader. One pass
 * over the scene graph aliases uv -> uv1 and switches them all on.
 */
function EnableAoMaps() {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.traverse((o) => {
      const g = (o as THREE.Mesh).geometry;
      if (g?.attributes?.uv && !g.attributes.uv1) {
        g.setAttribute('uv1', g.attributes.uv);
      }
    });
  });
  return null;
}

/**
 * Reports three's loading manager to the DOM overlay. It lives outside the
 * Canvas on purpose: `useProgress` re-renders on every file that lands, and
 * there is no reason to push that through the R3F tree.
 *
 * Both of these are here rather than in Hero because `useProgress` and
 * `useFrame` come from drei and fiber, and Hero is in the main bundle — the
 * whole point of loading this module lazily is to keep three out of there.
 */
function ProgressReporter({ onProgress }: { onProgress: (p: number) => void }) {
  const { progress } = useProgress();
  useEffect(() => {
    onProgress(progress);
  }, [progress, onProgress]);
  return null;
}

/**
 * Assets being downloaded is not the same as the villa being on screen: the
 * shaders still have to compile, which on a cold GPU cache is its own visible
 * stall. Sitting inside the Suspense boundary means this only mounts once
 * every texture has resolved, and waiting a few frames past that covers the
 * compile — so the overlay lifts on a drawn frame, not on an empty canvas.
 */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current || ++frames.current < 6) return;
    fired.current = true;
    onReady();
  });
  return null;
}

interface SceneProps {
  night: boolean;
  progressRef: React.RefObject<number>;
  onProgress: (p: number) => void;
  onReady: () => void;
}

export default function Scene({ night, progressRef, onProgress, onReady }: SceneProps) {
  const pointerRef = useRef({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Stop rendering entirely once the canvas leaves the viewport.
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => setVisible(entries.some((e) => e.isIntersecting)),
      { threshold: 0 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const handlePointer = (e: React.PointerEvent) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    pointerRef.current = {
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    };
  };

  return (
    <div ref={wrapRef} onPointerMove={handlePointer} className="absolute inset-0">
      <ProgressReporter onProgress={onProgress} />
      <Canvas
        shadows
        // Cap DPR at 2 — high-density laptops otherwise render 9x the pixels.
        dpr={[1, 2]}
        camera={{ fov: 42, near: 0.1, far: 400, position: [26, 11, 26] }}
        frameloop={visible ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          // Exposure is the difference between "lit" and "photographed".
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Suspense fallback={null}>
          {/* Percentage-closer soft shadows: penumbra widens with distance,
              which is most of what separates a render from a diagram. */}
          <SoftShadows size={26} samples={12} focus={0.9} />
          {/* The sky is the backdrop AND the reflection source. This single
              choice does more for realism than any number of point lights. */}
          <Environment
            files={night ? HDRI_NIGHT : HDRI_DAY}
            background
            backgroundBlurriness={0.02}
            environmentIntensity={night ? 0.55 : 1}
          />

          <directionalLight
            position={[22, 30, 18]}
            intensity={night ? 0.12 : 2.4}
            color={night ? '#9BB6E8' : '#FFF6E8'}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-60}
            shadow-camera-right={60}
            shadow-camera-top={60}
            shadow-camera-bottom={-60}
            shadow-bias={-0.0004}
            shadow-normalBias={0.02}
          />
          <ambientLight intensity={night ? 0.25 : 0.4} />
          {/* Bounce: real interiors are lit as much by light coming back off
              the floor as by the sun. Without it the undersides go dead. */}
          <hemisphereLight
            args={[night ? '#2A3550' : '#DCEAFF', night ? '#1A1712' : '#C9BFA8', night ? 0.3 : 0.7]}
          />

          {/* Aerial perspective. The lawn runs 340 units to a hard horizon
              line, and a tiled texture at that distance moires into a visible
              grid. Real distance desaturates toward the sky colour, which both
              reads as depth and dissolves the tiling. */}
          <fog attach="fog" args={[night ? '#141A26' : '#C9D6E4', 70, 260]} />

          <EnableAoMaps />
          <Villa night={night} />

          <ContactShadows
            position={[0, -0.01, 0]}
            scale={90}
            blur={2.6}
            opacity={night ? 0.18 : 0.28}
            far={10}
            resolution={1024}
          />

          {!reduced && (
            <CameraRig progressRef={progressRef} pointerRef={pointerRef} />
          )}

          {/* Little Workshop's showroom bakes its ambient occlusion in Unity and
              ships it as Lightmap-*.png. There is no bake step here, so the
              equivalent has to be computed per frame: N8AO darkens creases,
              wall/floor junctions and the undersides of furniture, which is the
              single largest thing separating a real-time scene from a render. */}
          <EffectComposer multisampling={0} enableNormalPass>
            <N8AO
              aoRadius={1.2}
              distanceFalloff={0.9}
              intensity={night ? 2.2 : 2.8}
              halfRes
              color="#2A2519"
            />
            <BrightnessContrast brightness={0.01} contrast={0.06} />
            <Vignette offset={0.32} darkness={0.42} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            <SMAA />
          </EffectComposer>

          <AdaptiveDpr pixelated />
          <Preload all />
          <ReadySignal onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
