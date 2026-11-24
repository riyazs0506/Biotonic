import { Environment, Lightformer, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import * as THREE from 'three';
import { drawLabel, loadLogo } from './labels';

/**
 * Realistic, animated 3D model of the packs Biotonic supplies — a painted steel drum
 * (industrial chemicals & glycols), an HDPE jerrycan (textile chemicals) and a pail
 * (construction chemicals) — on a studio stage. Procedural geometry and canvas-drawn
 * labels with the real wordmark: no external models or textures are downloaded.
 *
 * Loaded lazily by `HeroVisual` after hydration, only where WebGL is available and the
 * visitor has not asked for reduced motion. Rendering stops while the hero is off-screen.
 */
export interface ProductSceneProps {
  /** Called once textures are drawn and the first frames have rendered. */
  onReady: () => void;
  /** Pointer position in [-1, 1], written by the hero. */
  pointer: RefObject<{ x: number; y: number }>;
  active: boolean;
  /** Fixed camera and preserved buffer, for generating the static poster image. */
  capture?: boolean;
}

interface Labels {
  drum: THREE.CanvasTexture;
  can: THREE.CanvasTexture;
  pail: THREE.CanvasTexture;
}

function useLabels(): Labels | null {
  const [labels, setLabels] = useState<Labels | null>(null);
  useEffect(() => {
    let cancelled = false;
    let made: Labels | null = null;
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    Promise.all([loadLogo(), fontsReady]).then(([logo]) => {
      if (cancelled) return;
      made = {
        drum: drawLabel(
          {
            width: 1400,
            height: 400,
            band: 'INDUSTRIAL · GLYCOLS',
            caption: 'INDUSTRIAL GRADE',
            footer: 'BATCH NO. · NET WT.',
            logoScale: 0.34,
          },
          logo,
        ),
        can: drawLabel(
          {
            width: 640,
            height: 500,
            band: 'TEXTILE',
            caption: 'PROCESS CHEMICALS',
            footer: 'BATCH NO. · NET 25 L',
            logoScale: 0.66,
          },
          logo,
        ),
        pail: drawLabel(
          {
            width: 900,
            height: 340,
            band: 'CONSTRUCTION',
            caption: 'WATERPROOFING',
            logoScale: 0.46,
          },
          logo,
        ),
      };
      setLabels(made);
    });
    return () => {
      cancelled = true;
      if (made) Object.values(made).forEach((t) => t.dispose());
    };
  }, []);
  return labels;
}

/* ---------- Packs ---------- */

function SteelDrum({ label }: { label: THREE.Texture }) {
  const paint = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#1b1f27',
        metalness: 0.65,
        roughness: 0.34,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
      }),
    [],
  );
  const steel = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#8b929c', metalness: 0.9, roughness: 0.28 }),
    [],
  );
  return (
    <group position={[0.15, 0, -0.75]}>
      <mesh position={[0, 1.25, 0]} material={paint}>
        <cylinderGeometry args={[0.9, 0.9, 2.5, 96, 1, true]} />
      </mesh>
      <mesh position={[0, 2.49, 0]} material={paint}>
        <cylinderGeometry args={[0.885, 0.885, 0.03, 96]} />
      </mesh>
      {/* Chimes (top and bottom rims) and rolling hoops */}
      {[2.5, 0.02].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation-x={Math.PI / 2} material={paint}>
          <torusGeometry args={[0.9, 0.04, 16, 128]} />
        </mesh>
      ))}
      {[0.83, 1.67].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation-x={Math.PI / 2} material={paint}>
          <torusGeometry args={[0.912, 0.028, 16, 128]} />
        </mesh>
      ))}
      {/* Bung caps */}
      <mesh position={[0.52, 2.53, 0.12]} material={steel}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 32]} />
      </mesh>
      <mesh position={[-0.55, 2.52, -0.05]} material={steel}>
        <cylinderGeometry args={[0.065, 0.065, 0.04, 32]} />
      </mesh>
      {/* Printed label wrapped round the front of the drum */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.906, 0.906, 0.64, 96, 1, true, -1.2, 2.4]} />
        <meshStandardMaterial map={label} roughness={0.55} side={THREE.FrontSide} />
      </mesh>
    </group>
  );
}

function Jerrycan({ label }: { label: THREE.Texture }) {
  const hdpe = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f1efe8',
        roughness: 0.48,
        clearcoat: 0.25,
        clearcoatRoughness: 0.5,
        sheen: 0.4,
        sheenRoughness: 0.6,
        sheenColor: new THREE.Color('#ffffff'),
      }),
    [],
  );
  const cap = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#109255', roughness: 0.35, clearcoat: 0.6 }),
    [],
  );
  return (
    <group position={[-1.35, 0, 0.55]} rotation-y={0.38}>
      <RoundedBox
        args={[1.02, 1.36, 0.64]}
        radius={0.09}
        smoothness={6}
        position={[0, 0.68, 0]}
        material={hdpe}
      />
      {/* Integrated handle */}
      <RoundedBox
        args={[0.58, 0.1, 0.16]}
        radius={0.04}
        position={[-0.12, 1.55, 0]}
        material={hdpe}
      />
      <RoundedBox
        args={[0.1, 0.2, 0.16]}
        radius={0.04}
        position={[-0.36, 1.43, 0]}
        material={hdpe}
      />
      <RoundedBox
        args={[0.1, 0.2, 0.16]}
        radius={0.04}
        position={[0.12, 1.43, 0]}
        material={hdpe}
      />
      {/* Spout and cap */}
      <mesh position={[0.32, 1.42, 0]} material={hdpe}>
        <cylinderGeometry args={[0.1, 0.11, 0.1, 32]} />
      </mesh>
      <mesh position={[0.32, 1.5, 0]} material={cap}>
        <cylinderGeometry args={[0.105, 0.105, 0.09, 32]} />
      </mesh>
      {/* Label on the front face */}
      <mesh position={[0, 0.64, 0.322]}>
        <planeGeometry args={[0.8, 0.62]} />
        <meshStandardMaterial map={label} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Pail({ label }: { label: THREE.Texture }) {
  const plastic = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#118f52',
        roughness: 0.3,
        clearcoat: 0.8,
        clearcoatRoughness: 0.18,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const lid = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#0b7443', roughness: 0.32, clearcoat: 0.7 }),
    [],
  );
  const wire = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2a2f38', metalness: 0.8, roughness: 0.35 }),
    [],
  );
  const body = useMemo(() => {
    const profile = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.5, 0),
      new THREE.Vector2(0.51, 0.02),
      new THREE.Vector2(0.6, 1.0),
      new THREE.Vector2(0.635, 1.02),
      new THREE.Vector2(0.635, 1.07),
    ];
    return new THREE.LatheGeometry(profile, 96);
  }, []);
  const handle = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.64, 0.98, 0),
      new THREE.Vector3(-0.5, 1.42, 0),
      new THREE.Vector3(0, 1.6, 0),
      new THREE.Vector3(0.5, 1.42, 0),
      new THREE.Vector3(0.64, 0.98, 0),
    ]);
    return new THREE.TubeGeometry(curve, 64, 0.014, 10, false);
  }, []);
  return (
    <group position={[1.4, 0, 0.5]} rotation-y={-0.3}>
      <mesh geometry={body} material={plastic} />
      <mesh position={[0, 1.1, 0]} material={lid}>
        <cylinderGeometry args={[0.655, 0.655, 0.07, 96]} />
      </mesh>
      <mesh position={[0, 1.145, 0]} rotation-x={Math.PI / 2} material={lid}>
        <torusGeometry args={[0.5, 0.02, 12, 96]} />
      </mesh>
      <mesh geometry={handle} material={wire} />
      {/* Label follows the taper of the pail */}
      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.587, 0.546, 0.42, 96, 1, true, -1.05, 2.1]} />
        <meshStandardMaterial map={label} roughness={0.55} />
      </mesh>
    </group>
  );
}

function Stage() {
  return (
    <group>
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <cylinderGeometry args={[2.35, 2.4, 0.16, 128]} />
        <meshStandardMaterial color="#f5f2eb" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.001, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[2.345, 0.012, 8, 160]} />
        <meshStandardMaterial color="#21bf75" emissive="#21bf75" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

/** Soft contact shadow under a pack: a radial gradient baked once into a texture. */
let blobTexture: THREE.CanvasTexture | undefined;
function getBlobTexture(): THREE.CanvasTexture {
  if (blobTexture) return blobTexture;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(14,16,22,0.95)');
    g.addColorStop(0.5, 'rgba(14,16,22,0.6)');
    g.addColorStop(1, 'rgba(14,16,22,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  blobTexture = new THREE.CanvasTexture(canvas);
  return blobTexture;
}

function ContactBlob({
  position,
  scale,
  rotation = 0,
  opacity = 0.6,
}: {
  position: [number, number];
  scale: [number, number];
  rotation?: number;
  opacity?: number;
}) {
  const map = useMemo(() => getBlobTexture(), []);
  return (
    <mesh position={[position[0], 0.012, position[1]]} rotation={[-Math.PI / 2, 0, rotation]}>
      <planeGeometry args={scale} />
      <meshBasicMaterial map={map} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

/** Marks every mesh inside as a shadow caster (the packs are static, so this runs once). */
function CastShadows({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    group.current?.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) object.castShadow = true;
    });
  }, []);
  return <group ref={group}>{children}</group>;
}

/* ---------- Camera & light motion ---------- */

function Rig({
  pointer,
  capture,
}: {
  pointer: RefObject<{ x: number; y: number }>;
  capture?: boolean;
}) {
  const camera = useThree((s) => s.camera);
  const key = useRef<THREE.DirectionalLight>(null);
  const smooth = useRef({ x: 0, y: 0 });
  const target = useMemo(() => new THREE.Vector3(0.05, 1.0, 0), []);

  useFrame(({ clock }, delta) => {
    const t = capture ? 0 : clock.elapsedTime;
    const p = capture ? { x: 0, y: 0 } : (pointer.current ?? { x: 0, y: 0 });
    const ease = 1 - Math.exp(-delta * 3);
    smooth.current.x += (p.x - smooth.current.x) * ease;
    smooth.current.y += (p.y - smooth.current.y) * ease;

    // Slow turntable sway around the stage, nudged by the pointer.
    const angle = -0.32 + Math.sin(t * 0.16) * 0.24 + smooth.current.x * 0.14;
    const radius = 8.5;
    camera.position.set(
      Math.sin(angle) * radius,
      2.7 - smooth.current.y * 0.35,
      Math.cos(angle) * radius,
    );
    camera.lookAt(target);

    // A key light that drifts, so highlights move across the glossy surfaces.
    if (key.current) key.current.position.set(3 + Math.sin(t * 0.35) * 2.5, 6, 3.5);
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        ref={key}
        position={[3, 6, 3.5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-3.5}
        shadow-camera-right={3.5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-3.5}
        shadow-camera-near={1}
        shadow-camera-far={16}
      />
      <directionalLight position={[-5, 3, -2]} intensity={0.5} color="#dff5ea" />
    </>
  );
}

function ReadySignal({ ready, onReady }: { ready: boolean; onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (!ready || done.current) return;
    frames.current += 1;
    if (frames.current > 2) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

export default function ProductScene({ onReady, pointer, active, capture }: ProductSceneProps) {
  const labels = useLabels();
  const small = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <Canvas
      shadows
      dpr={capture ? 2 : small ? [1, 1.5] : [1, 1.75]}
      frameloop={active || !labels ? 'always' : 'never'}
      camera={{ fov: 30, position: [0, 2.7, 8.5], near: 0.1, far: 50 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: Boolean(capture),
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Rig pointer={pointer} capture={capture} />
      <Environment resolution={small ? 128 : 256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.4}
          position={[0, 6, -1]}
          rotation-x={Math.PI / 2}
          scale={[12, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[-6, 2.5, 1]}
          rotation-y={Math.PI / 2}
          scale={[4, 7, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[6, 2.5, 2]}
          rotation-y={-Math.PI / 2}
          scale={[3, 7, 1]}
        />
        <Lightformer
          form="ring"
          intensity={0.8}
          color="#21bf75"
          position={[2, 1.5, 7]}
          scale={2.5}
        />
      </Environment>

      <Stage />
      {labels && (
        <CastShadows>
          <ContactBlob position={[0.15, -0.75]} scale={[2.6, 2.6]} opacity={1} />
          <ContactBlob position={[-1.35, 0.55]} scale={[1.75, 1.3]} rotation={0.38} opacity={0.9} />
          <ContactBlob position={[1.4, 0.5]} scale={[1.6, 1.6]} opacity={0.9} />
          <SteelDrum label={labels.drum} />
          <Jerrycan label={labels.can} />
          <Pail label={labels.pail} />
        </CastShadows>
      )}
      <ReadySignal ready={Boolean(labels)} onReady={onReady} />
    </Canvas>
  );
}
