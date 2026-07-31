"use client";

import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Grid, Lightformer, Sparkles } from "@react-three/drei";
import { Tower, TOWER } from "./tower";
import { Crane, type CraneState } from "./crane";

/**
 * The hero's 3D stage. A choreographer smooths the raw scroll value and
 * conducts everything from it each frame: the day cycle (dawn survey →
 * working noon → golden envelope → dusk handover), the crane's life,
 * and a crane-like camera dolly that orbits the rising tower.
 */

export interface HeroSceneProps {
  /** Raw scroll progress 0→1, written by the hero's ScrollTrigger. */
  progress: RefObject<number>;
  /** Normalized pointer (-1…1), for parallax. */
  pointer: RefObject<{ x: number; y: number }>;
  /** Render the delivered dusk state statically. */
  reduced?: boolean;
  /** Freeze the frameloop when the hero is offscreen. */
  active?: boolean;
  quality?: "high" | "low";
}

/* Day-cycle keyframes across master progress. */
const STOPS = [0, 0.3, 0.62, 0.88, 1] as const;
const SUN_COLORS = ["#6f86c9", "#ffd9b0", "#ffb37a", "#ff8f52", "#ff7a3c"];
const SUN_INTENSITY = [1.1, 2.6, 2.8, 2.0, 1.3];
const SUN_POS: [number, number, number][] = [
  [-26, 10, -18],
  [18, 34, 10],
  [30, 22, 20],
  [26, 10, 28],
  [20, 6, 30],
];
const SKY_COLORS = ["#22304f", "#45536a", "#4a4a55", "#3a2f4a", "#2b2a44"];
const HEMI_INTENSITY = [0.7, 1.05, 1.05, 0.9, 0.75];
const BG_COLORS = ["#0a0d14", "#11141a", "#14131a", "#12101a", "#0d0e16"];
const FOG_DENSITY = [0.016, 0.009, 0.009, 0.011, 0.013];

function segment(p: number) {
  let i = 0;
  while (i < STOPS.length - 2 && p > STOPS[i + 1]!) i++;
  const t = THREE.MathUtils.clamp(
    (p - STOPS[i]!) / (STOPS[i + 1]! - STOPS[i]!),
    0,
    1,
  );
  return { i, t };
}

const lerpN = (arr: number[], p: number) => {
  const { i, t } = segment(p);
  return THREE.MathUtils.lerp(arr[i]!, arr[i + 1]!, t);
};

/* Camera dolly: a full slow orbit that rises with the structure. */
const CAM_PATH = new THREE.CatmullRomCurve3(
  [
    [13, 2.2, 18],
    [21, 9, 8],
    [14, 18, -18],
    [-16, 22, -13],
    [-19, 17, 13],
    [25, 15, 36],
  ].map((v) => new THREE.Vector3(...v)),
  false,
  "catmullrom",
  0.35,
);
const TARGET_PATH = new THREE.CatmullRomCurve3(
  [
    [0, 3, 0],
    [0, 7, 0],
    [0, 12.5, 0],
    [0, 16.5, 0],
    [0, 14, 0],
    [0, 12.5, 0],
  ].map((v) => new THREE.Vector3(...v)),
  false,
  "catmullrom",
  0.35,
);

function Choreographer({
  progress,
  pointer,
  reduced,
  smoothRef,
  craneRef,
  sunRef,
  hemiRef,
}: {
  progress: RefObject<number>;
  pointer: RefObject<{ x: number; y: number }>;
  reduced?: boolean;
  smoothRef: RefObject<number>;
  craneRef: RefObject<CraneState>;
  sunRef: RefObject<THREE.DirectionalLight | null>;
  hemiRef: RefObject<THREE.HemisphereLight | null>;
}) {
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const colA = useMemo(() => new THREE.Color(), []);
  const colB = useMemo(() => new THREE.Color(), []);
  const vec = useMemo(() => new THREE.Vector3(), []);
  const tgt = useMemo(() => new THREE.Vector3(), []);

  if (!(scene.fog instanceof THREE.FogExp2)) {
    scene.fog = new THREE.FogExp2("#0a0d14", 0.017);
  }
  if (!(scene.background instanceof THREE.Color)) {
    scene.background = new THREE.Color("#0a0d14");
  }

  useFrame((_, delta) => {
    const raw = reduced ? 1 : THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);
    smoothRef.current = reduced
      ? 1
      : THREE.MathUtils.damp(smoothRef.current, raw, 5.5, Math.min(delta, 0.05));
    const p = smoothRef.current;
    const { i, t } = segment(p);

    /* Crane lifecycle */
    craneRef.current.build = THREE.MathUtils.clamp((p - 0.05) / 0.08, 0, 1);
    craneRef.current.fade = THREE.MathUtils.clamp((p - 0.88) / 0.08, 0, 1);
    craneRef.current.work =
      THREE.MathUtils.clamp((p - 0.13) / 0.08, 0, 1) *
      (1 - THREE.MathUtils.clamp((p - 0.44) / 0.1, 0, 1));

    /* Day cycle */
    if (sunRef.current) {
      colA.set(SUN_COLORS[i]!);
      colB.set(SUN_COLORS[i + 1]!);
      sunRef.current.color.copy(colA.lerp(colB, t));
      sunRef.current.intensity = lerpN(SUN_INTENSITY, p);
      const a = SUN_POS[i]!;
      const b = SUN_POS[i + 1]!;
      sunRef.current.position.set(
        THREE.MathUtils.lerp(a[0], b[0], t),
        THREE.MathUtils.lerp(a[1], b[1], t),
        THREE.MathUtils.lerp(a[2], b[2], t),
      );
    }
    if (hemiRef.current) {
      colA.set(SKY_COLORS[i]!);
      colB.set(SKY_COLORS[i + 1]!);
      hemiRef.current.color.copy(colA.lerp(colB, t));
      hemiRef.current.intensity = lerpN(HEMI_INTENSITY, p);
    }
    colA.set(BG_COLORS[i]!);
    colB.set(BG_COLORS[i + 1]!);
    const bg = colA.lerp(colB, t);
    (scene.background as THREE.Color).copy(bg);
    (scene.fog as THREE.FogExp2).color.copy(bg);
    (scene.fog as THREE.FogExp2).density = lerpN(FOG_DENSITY, p);

    /* Camera dolly + pointer parallax */
    const px = reduced ? 0 : (pointer.current?.x ?? 0);
    const py = reduced ? 0 : (pointer.current?.y ?? 0);
    CAM_PATH.getPoint(p, vec);
    TARGET_PATH.getPoint(p, tgt);
    camera.position.set(vec.x + px * 1.1, vec.y + py * -0.7, vec.z);
    camera.lookAt(tgt.x + px * 0.8, tgt.y + py * -0.5, tgt.z);
  });

  return null;
}

function SetDressing() {
  const barrier = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#b7440f", roughness: 0.6 }),
    [],
  );
  const dark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#191c20", roughness: 0.85 }),
    [],
  );
  const steel = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#5c636b", roughness: 0.45, metalness: 0.7 }),
    [],
  );
  return (
    <group>
      {/* site cabin */}
      <mesh position={[10.5, 0.85, 6.5]} rotation-y={-0.4} material={dark} castShadow>
        <boxGeometry args={[3.6, 1.7, 1.6]} />
      </mesh>
      {/* steel laydown */}
      <mesh position={[-8, 0.22, 7.5]} rotation-y={0.25} material={steel} castShadow>
        <boxGeometry args={[5.4, 0.4, 1.4]} />
      </mesh>
      <mesh position={[-7.4, 0.62, 7.2]} rotation-y={0.25} material={steel}>
        <boxGeometry args={[4.6, 0.34, 1]} />
      </mesh>
      {/* jersey barriers along the gate line — kept off the camera axis so
          they frame the foreground without blocking narrow viewports */}
      {Array.from({ length: 7 }, (_, k) => (
        <mesh key={k} position={[-15 + k * 2.1, 0.3, 12.8]} material={barrier} castShadow>
          <boxGeometry args={[1.7, 0.6, 0.42]} />
        </mesh>
      ))}
    </group>
  );
}

export function HeroScene({
  progress,
  pointer,
  reduced = false,
  active = true,
  quality = "high",
}: HeroSceneProps) {
  const smoothRef = useRef(reduced ? 1 : 0);
  const craneRef = useRef<CraneState>({ build: 0, work: 0, fade: 0 });
  const sunRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiRef = useRef<THREE.HemisphereLight | null>(null);
  const shadows = quality === "high";

  return (
    <Canvas
      frameloop={reduced ? "demand" : active ? "always" : "never"}
      dpr={quality === "high" ? [1, 1.5] : [1, 1.25]}
      shadows={shadows}
      camera={{ fov: 40, near: 0.5, far: 220, position: [12.5, 1.9, 16.5] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="!absolute !inset-0"
      aria-hidden
    >
      <Choreographer
        progress={progress}
        pointer={pointer}
        reduced={reduced}
        smoothRef={smoothRef}
        craneRef={craneRef}
        sunRef={sunRef}
        hemiRef={hemiRef}
      />

      <hemisphereLight ref={hemiRef} args={["#45536a", "#0b0c0e", 0.85]} />
      <directionalLight
        ref={sunRef}
        position={[18, 34, 10]}
        intensity={2.4}
        castShadow={shadows}
        shadow-mapSize={[768, 768]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={34}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0004}
      />

      <Tower pRef={smoothRef} shadows={shadows} />
      <Crane
        stateRef={craneRef}
        position={[-7.6, 0, -4.2]}
        height={TOWER.height + 6}
        jib={13}
        castShadow={shadows}
      />
      <SetDressing />

      {/* survey grid + ground */}
      <Grid
        position={[0, 0.02, 0]}
        args={[240, 240]}
        cellSize={2}
        cellThickness={0.6}
        cellColor="#1c2432"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#2b3f63"
        fadeDistance={95}
        fadeStrength={1.6}
      />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#0d0e11" roughness={1} />
      </mesh>

      {/* site dust */}
      <Sparkles
        count={quality === "high" ? 90 : 40}
        scale={[34, 18, 34]}
        position={[0, 8, 0]}
        size={2}
        speed={0.22}
        opacity={0.3}
        color="#8b929c"
      />

      <Environment resolution={64} frames={1}>
        <Lightformer intensity={2.2} color="#ffd9b0" position={[10, 14, 8]} scale={[16, 10, 1]} />
        <Lightformer
          intensity={0.55}
          color="#5b8dff"
          position={[-12, 8, -10]}
          rotation-y={Math.PI}
          scale={[14, 8, 1]}
        />
        <Lightformer
          intensity={0.5}
          color="#2e3138"
          position={[0, -4, 0]}
          rotation-x={Math.PI / 2}
          scale={[30, 30, 1]}
        />
      </Environment>
    </Canvas>
  );
}
