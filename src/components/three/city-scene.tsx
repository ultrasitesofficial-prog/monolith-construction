"use client";

import { useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer } from "@react-three/drei";
import { projects, statusMeta, type Project } from "@/config/projects.config";
import { Crane, type CraneState } from "./crane";

/**
 * The District — an interactive WebGL model of a city quarter where every
 * Monolith project keeps its plot. Status drives the render: delivered
 * buildings glow warm at night, active sites carry cranes and a steel cage
 * above the built floors, designs stand as blueprint holograms.
 *
 * Drag orbits. Hovering raises a plot and its label. Clicking flies the
 * camera in and opens the project dossier (DOM side panel).
 */

export interface CitySceneProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  night: boolean;
  active?: boolean;
  quality?: "high" | "low";
  /** Horizontal orbit angle written by the explorer's drag handler. */
  orbitRef: RefObject<number>;
  zoomRef: RefObject<number>;
}

const WORKING_CRANE: CraneState = { build: 1, work: 0.5, fade: 0 };

const FLOOR = 0.62;

/* ----------------------------- day/night mixer ---------------------------- */

interface Mood {
  night: RefObject<number>;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function MoodController({
  night,
  mood,
  sunRef,
  hemiRef,
}: {
  night: boolean;
  mood: Mood;
  sunRef: RefObject<THREE.DirectionalLight | null>;
  hemiRef: RefObject<THREE.HemisphereLight | null>;
}) {
  const scene = useThree((s) => s.scene);
  const day = useMemo(() => new THREE.Color("#151920"), []);
  const dark = useMemo(() => new THREE.Color("#08090e"), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  if (!(scene.fog instanceof THREE.FogExp2)) scene.fog = new THREE.FogExp2("#0a0c12", 0.0085);
  if (!(scene.background instanceof THREE.Color)) scene.background = new THREE.Color("#0a0c12");

  useFrame((_, delta) => {
    const m = THREE.MathUtils.damp(mood.night.current, night ? 1 : 0, 3, Math.min(delta, 0.05));
    mood.night.current = m;
    tmp.copy(day).lerp(dark, m);
    (scene.background as THREE.Color).copy(tmp);
    (scene.fog as THREE.FogExp2).color.copy(tmp);
    if (sunRef.current) {
      sunRef.current.intensity = THREE.MathUtils.lerp(2.3, 0.6, m);
      sunRef.current.color.set(m > 0.5 ? "#8fa3d9" : "#ffe2c4");
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = THREE.MathUtils.lerp(0.75, 0.55, m);
    }
  });
  return null;
}

/* --------------------------------- camera --------------------------------- */

function Rig({
  selectedId,
  orbitRef,
  zoomRef,
}: {
  selectedId: string | null;
  orbitRef: RefObject<number>;
  zoomRef: RefObject<number>;
}) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const pos = useMemo(() => new THREE.Vector3(0, 52, 74), []);
  const tgt = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const selected = selectedId ? projects.find((p) => p.id === selectedId) : undefined;
    const aspect = size.width / Math.max(size.height, 1);
    const base = (aspect < 0.9 ? 105 : aspect < 1.4 ? 84 : 70) * (zoomRef.current ?? 1);
    const azimuth = orbitRef.current ?? 0;

    let px: number, py: number, pz: number, tx: number, ty: number, tz: number;
    if (selected) {
      // Fly toward the plot: closer, lower, looking at the massing's heart.
      const h =
        selected.plot.kind === "tower"
          ? (selected.plot.floors ?? 10) * FLOOR
          : selected.plot.kind === "campus"
            ? 6
            : 4;
      const r = Math.max(selected.plot.footprint[0], selected.plot.footprint[1]) * 2.3 + 11;
      const a = azimuth * 0.4 + Math.atan2(selected.plot.x, selected.plot.z + 40) * 0.5;
      px = selected.plot.x + Math.sin(a) * r;
      pz = selected.plot.z + Math.cos(a) * r + 7;
      py = h * 0.7 + 8;
      tx = selected.plot.x;
      ty = h * 0.5;
      tz = selected.plot.z;
    } else {
      px = Math.sin(azimuth) * base * 0.62;
      pz = Math.cos(azimuth) * base * 0.86;
      py = base * 0.72;
      tx = 0;
      ty = 0;
      tz = -2;
    }

    const speed = selected ? 2.6 : 3.4;
    pos.x = THREE.MathUtils.damp(pos.x, px, speed, dt);
    pos.y = THREE.MathUtils.damp(pos.y, py, speed, dt);
    pos.z = THREE.MathUtils.damp(pos.z, pz, speed, dt);
    tgt.x = THREE.MathUtils.damp(tgt.x, tx, speed, dt);
    tgt.y = THREE.MathUtils.damp(tgt.y, ty, speed, dt);
    tgt.z = THREE.MathUtils.damp(tgt.z, tz, speed, dt);
    camera.position.copy(pos);
    camera.lookAt(tgt);
  });
  return null;
}

/* -------------------------------- district -------------------------------- */

function GroundAndRoads() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#0e1013" roughness={1} />
      </mesh>
      {/* river along the north edge */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.03, -38]}>
        <planeGeometry args={[400, 16]} />
        <meshStandardMaterial color="#0d1522" roughness={0.25} metalness={0.7} />
      </mesh>
      {/* main avenue + cross streets */}
      {[
        { w: 7, d: 110, x: 0, z: 0 },
        { w: 130, d: 6, x: 0, z: 12 },
        { w: 130, d: 6, x: 0, z: -24 },
        { w: 6, d: 110, x: -52, z: 0 },
        { w: 6, d: 110, x: 52, z: 0 },
      ].map((r, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[r.x, 0.005, r.z]}>
          <planeGeometry args={[r.w, r.d]} />
          <meshStandardMaterial color="#15171b" roughness={0.95} />
        </mesh>
      ))}
      {/* dashed centerline on the avenue */}
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[0, 0.012, -51 + i * 6]}>
          <planeGeometry args={[0.28, 2.2]} />
          <meshBasicMaterial color="#3d4149" />
        </mesh>
      ))}
    </group>
  );
}

/** Anonymous city fill — instanced blocks that keep clear of plots & roads. */
function CityFill() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const rand = mulberry32(11);
    const list: { x: number; z: number; w: number; d: number; h: number; tint: number }[] = [];
    const clear = (x: number, z: number) => {
      if (Math.abs(x) < 6) return false; // avenue
      if (Math.abs(z - 12) < 5 || Math.abs(z + 24) < 5) return false; // streets
      if (z < -31) return false; // river
      for (const p of projects) {
        const rx = p.plot.footprint[0] / 2 + 4.5;
        const rz = p.plot.footprint[1] / 2 + 4.5;
        if (Math.abs(x - p.plot.x) < rx && Math.abs(z - p.plot.z) < rz) return false;
      }
      return true;
    };
    for (let gx = -58; gx <= 58; gx += 7.4) {
      for (let gz = -28; gz <= 44; gz += 7.2) {
        const x = gx + (rand() - 0.5) * 2.4;
        const z = gz + (rand() - 0.5) * 2.4;
        if (!clear(x, z)) continue;
        if (rand() < 0.22) continue; // vacant lots
        list.push({
          x,
          z,
          w: 3 + rand() * 3.4,
          d: 3 + rand() * 3.2,
          h: 1.2 + Math.pow(rand(), 1.6) * 7.5,
          tint: rand(),
        });
      }
    }
    return list;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const applied = useRef(false);
  useFrame(() => {
    if (!mesh.current || applied.current) return;
    applied.current = true;
    const c = new THREE.Color();
    data.forEach((b, i) => {
      dummy.position.set(b.x, b.h / 2, b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
      c.setHSL(0.58, 0.06, 0.15 + b.tint * 0.08);
      mesh.current!.setColorAt(i, c);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, data.length]}
      frustumCulled={false}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.85} metalness={0.1} />
    </instancedMesh>
  );
}

/** Street lamps that only matter after dark. */
function StreetLights({ mood }: { mood: Mood }) {
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ffc98a", transparent: true, toneMapped: false }),
    [],
  );
  const poleMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#23262b", roughness: 0.7 }),
    [],
  );
  const spots = useMemo(() => {
    const pts: [number, number][] = [];
    for (let z = -48; z <= 52; z += 12.5) {
      pts.push([-4.6, z], [4.6, z + 6]);
    }
    return pts;
  }, []);
  useFrame(() => {
    mat.opacity = 0.15 + mood.night.current * 0.85;
  });
  return (
    <group>
      {spots.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 1.4, 0]} material={poleMat}>
            <cylinderGeometry args={[0.06, 0.06, 2.8, 5]} />
          </mesh>
          <mesh position={[0, 2.85, 0]} material={mat}>
            <sphereGeometry args={[0.22, 8, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Two loops of site trucks that never stop making deliveries. */
function Trucks({ mood }: { mood: Mood }) {
  const groups = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const lightMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ffd9a0", transparent: true, toneMapped: false }),
    [],
  );
  const paths = useMemo<{ rect: [number, number, number, number]; speed: number; phase: number }[]>(
    () => [
      { rect: [-48, -20, 48, 8], speed: 7, phase: 0 },
      { rect: [-48, -20, 48, 8], speed: 7, phase: 0.52 },
      { rect: [-44, 16, 44, 40], speed: 6, phase: 0.2 },
    ],
    [],
  );

  useFrame(({ clock }) => {
    lightMat.opacity = 0.2 + mood.night.current * 0.8;
    paths.forEach((path, i) => {
      const g = groups[i]!.current;
      if (!g) return;
      const [x0, z0, x1, z1] = path.rect;
      const w = x1 - x0;
      const d = z1 - z0;
      const per = 2 * (w + d);
      const dist = ((clock.elapsedTime * path.speed) / per + path.phase) % 1;
      let s = dist * per;
      let x = x0;
      let z = z0;
      let ry = 0;
      if (s < w) {
        x = x0 + s;
        z = z0;
        ry = Math.PI / 2;
      } else if ((s -= w) < d) {
        x = x1;
        z = z0 + s;
        ry = 0;
      } else if ((s -= d) < w) {
        x = x1 - s;
        z = z1;
        ry = -Math.PI / 2;
      } else {
        s -= w;
        x = x0;
        z = z1 - s;
        ry = Math.PI;
      }
      g.position.set(x, 0.32, z);
      g.rotation.y = ry;
    });
  });

  return (
    <>
      {paths.map((_, i) => (
        <group key={i} ref={groups[i]}>
          <mesh position={[0, 0.1, 0.5]} castShadow>
            <boxGeometry args={[0.8, 0.55, 0.9]} />
            <meshStandardMaterial color="#c94f16" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.12, -0.55]}>
            <boxGeometry args={[0.85, 0.5, 1.4]} />
            <meshStandardMaterial color="#2a2e34" roughness={0.7} />
          </mesh>
          <mesh position={[0.22, 0.05, 1] } material={lightMat}>
            <boxGeometry args={[0.12, 0.1, 0.06]} />
          </mesh>
          <mesh position={[-0.22, 0.05, 1]} material={lightMat}>
            <boxGeometry args={[0.12, 0.1, 0.06]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ---------------------------- project buildings ---------------------------- */

const glassMat = new THREE.MeshStandardMaterial({
  color: "#1d2b38",
  roughness: 0.18,
  metalness: 0.9,
  envMapIntensity: 1.6,
});
const concreteMat = new THREE.MeshStandardMaterial({ color: "#565b62", roughness: 0.9 });
const steelCage = new THREE.LineBasicMaterial({ color: "#ff5a1f", transparent: true, opacity: 0.85 });
const holoMat = new THREE.LineBasicMaterial({ color: "#5b8dff", transparent: true, opacity: 0.65 });
const holoFill = new THREE.MeshBasicMaterial({
  color: "#16233f",
  transparent: true,
  opacity: 0.28,
  side: THREE.DoubleSide,
});
const windowBand = new THREE.MeshBasicMaterial({
  color: "#ffb466",
  transparent: true,
  toneMapped: false,
});

/* Cached edge geometries — hover re-renders must not rebuild geometry. */
const edgeCache = new Map<string, THREE.EdgesGeometry>();
function edgesBoxMemo(w: number, h: number, d: number) {
  const key = `${w.toFixed(2)}|${h.toFixed(2)}|${d.toFixed(2)}`;
  let g = edgeCache.get(key);
  if (!g) {
    g = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
    edgeCache.set(key, g);
  }
  return g;
}

/** One project's massing, status-coded. */
function ProjectBuilding({
  project,
  hovered,
  selected,
  mood,
  onHover,
  onSelect,
}: {
  project: Project;
  hovered: boolean;
  selected: boolean;
  mood: Mood;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const { plot, status, progress } = project;
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const holo = useRef<THREE.Group>(null);
  const lift = useRef(0);

  const [w, d] = plot.footprint;
  const h =
    plot.kind === "tower"
      ? (plot.floors ?? 10) * FLOOR
      : plot.kind === "campus"
        ? (plot.floors ?? 6) * FLOOR
        : plot.kind === "arena"
          ? 4.6
          : plot.kind === "shed"
            ? 3
            : 2.6;

  const builtH = Math.max(h * Math.min(progress * 1.15, 1), 0.4);

  const cage = useMemo(() => {
    if (status !== "under-construction") return null;
    return edgesBoxMemo(
      w * (plot.kind === "campus" ? 0.42 : 0.94),
      h - builtH,
      d * (plot.kind === "campus" ? 0.42 : 0.94),
    );
  }, [status, w, d, h, builtH, plot.kind]);

  const holoGeom = useMemo(() => {
    if (status !== "in-design") return null;
    return edgesBoxMemo(w * 0.9, h, d * 0.9);
  }, [status, w, d, h]);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    lift.current = THREE.MathUtils.damp(lift.current, hovered || selected ? 1 : 0, 6, dt);
    if (group.current) {
      group.current.position.y = lift.current * 0.5;
    }
    if (ring.current) {
      const s = 0.6 + lift.current * 0.55;
      ring.current.scale.set(s, s, s);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = lift.current * 0.9;
    }
    if (holo.current) {
      holo.current.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.18;
      holoMat.opacity = 0.4 + Math.sin(clock.elapsedTime * 2.1) * 0.18;
    }
    windowBand.opacity = 0.12 + mood.night.current * 0.88;
  });

  const ringColor = status === "in-design" ? "#5b8dff" : "#ff5a1f";
  const maxDim = Math.max(w, d);

  return (
    <group position={[plot.x, 0, plot.z]} rotation-y={plot.rotation ?? 0}>
      {/* hover ring */}
      <mesh ref={ring} rotation-x={-Math.PI / 2} position={[0, 0.03, 0]}>
        <ringGeometry args={[maxDim * 0.72, maxDim * 0.78, 48]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0} toneMapped={false} />
      </mesh>

      <group ref={group}>
        {/* massing by kind + status */}
        {plot.kind === "tower" && status !== "in-design" ? (
          <>
            <mesh position={[0, builtH / 2, 0]} material={glassMat} castShadow>
              <boxGeometry args={[w * 0.94, builtH, d * 0.94]} />
            </mesh>
            {/* lit floor bands — delivered towers glow; active sites keep
                a couple of floodlit decks working the night shift */}
            {(status === "delivered" ? [0.25, 0.5, 0.75] : [0.32, 0.78]).map((f) => (
              <mesh key={f} position={[0, builtH * f, 0]} material={windowBand}>
                <boxGeometry args={[w * 0.96, 0.1, d * 0.96]} />
              </mesh>
            ))}
            {cage ? (
              <lineSegments
                geometry={cage}
                material={steelCage}
                position={[0, builtH + (h - builtH) / 2, 0]}
              />
            ) : null}
          </>
        ) : null}

        {plot.kind === "tower" && status === "in-design" && holoGeom ? (
          <group ref={holo}>
            <mesh position={[0, h / 2, 0]} material={holoFill}>
              <boxGeometry args={[w * 0.9, h, d * 0.9]} />
            </mesh>
            <lineSegments geometry={holoGeom} material={holoMat} position={[0, h / 2, 0]} />
            {[0.33, 0.66].map((f) => (
              <lineSegments
                key={f}
                geometry={edgesBoxMemo(w * 0.9, 0.001, d * 0.9)}
                material={holoMat}
                position={[0, h * f, 0]}
              />
            ))}
          </group>
        ) : null}

        {plot.kind === "campus" ? (
          <group>
            {(
              [
                [-w * 0.24, -d * 0.22],
                [w * 0.24, -d * 0.22],
                [-w * 0.24, d * 0.24],
                [w * 0.24, d * 0.24],
              ] as [number, number][]
            ).map(([bx, bz], i) => {
              const done = (i + 1) / 4 <= progress + 0.12;
              const bh = h * (0.7 + (i % 3) * 0.18);
              return done ? (
                <mesh key={i} position={[bx, bh / 2, bz]} material={glassMat} castShadow>
                  <boxGeometry args={[w * 0.34, bh, d * 0.34]} />
                </mesh>
              ) : (
                <lineSegments
                  key={i}
                  geometry={edgesBoxMemo(w * 0.34, bh, d * 0.34)}
                  material={steelCage}
                  position={[bx, bh / 2, bz]}
                />
              );
            })}
          </group>
        ) : null}

        {plot.kind === "arena" ? (
          <group>
            <mesh position={[0, 1.4, 0]} scale={[w / 6, 1, d / 6]} material={concreteMat} castShadow>
              <cylinderGeometry args={[3, 3.4, 2.8, 28]} />
            </mesh>
            <mesh position={[0, 3, 0]} scale={[w / 6, 1, d / 6]} rotation-x={Math.PI / 2} material={windowBand}>
              <torusGeometry args={[2.9, 0.22, 10, 40]} />
            </mesh>
          </group>
        ) : null}

        {plot.kind === "shed" ? (
          <group>
            <mesh position={[0, h / 2, 0]} material={concreteMat} castShadow>
              <boxGeometry args={[w * 0.96, h, d * 0.94]} />
            </mesh>
            {[-w * 0.25, 0, w * 0.25].map((x) => (
              <mesh key={x} position={[x, h + 0.18, 0]} material={windowBand}>
                <boxGeometry args={[w * 0.14, 0.36, d * 0.8]} />
              </mesh>
            ))}
          </group>
        ) : null}

        {plot.kind === "bridge" ? (
          <group>
            <mesh position={[0, 1.5, 0]} material={concreteMat} castShadow>
              <boxGeometry args={[w, 0.32, 3.4]} />
            </mesh>
            {[-w * 0.28, w * 0.28].map((x) => (
              <group key={x}>
                <mesh position={[x, 2.6, 0]} material={concreteMat}>
                  <boxGeometry args={[0.5, 5.2, 0.5]} />
                </mesh>
                {[-1, 1].map((sgn) => (
                  <mesh
                    key={sgn}
                    position={[x + sgn * w * 0.14, 2.9, 0]}
                    rotation-z={sgn * 0.62}
                    material={glassMat}
                  >
                    <cylinderGeometry args={[0.03, 0.03, w * 0.3, 4]} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        ) : null}

        {/* crane on active sites */}
        {plot.crane ? (
          <Crane
            stateRef={{ current: WORKING_CRANE }}
            position={[w * 0.62, 0, -d * 0.42]}
            height={h + 4}
            jib={Math.max(w * 0.8, 6)}
            scale={0.52}
            seed={plot.x}
          />
        ) : null}
      </group>

      {/* hit box */}
      <mesh
        position={[0, h / 2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(project.id);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(project.id);
        }}
      >
        <boxGeometry args={[w + 1.5, h + 1.5, d + 1.5]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* label chip */}
      <Html center position={[0, h + 2.6, 0]} zIndexRange={[30, 0]}>
        <button
          type="button"
          onClick={() => onSelect(project.id)}
          data-cursor="enter"
          className={`pointer-events-auto flex -translate-y-1 items-center gap-2 border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.14em] whitespace-nowrap transition-all duration-300 ${
            hovered || selected
              ? "border-accent bg-bg/90 text-ink scale-105"
              : "border-line bg-bg/60 text-soft"
          }`}
          style={{ backdropFilter: "blur(6px)" }}
        >
          <span
            className="inline-block size-1.5"
            style={{
              background: status === "in-design" ? "#5b8dff" : status === "delivered" ? "#ffb466" : "#ff5a1f",
            }}
          />
          {project.name.toUpperCase()}
          <span className="text-faint">{statusMeta[status].short}</span>
        </button>
      </Html>
    </group>
  );
}

/* --------------------------------- scene ---------------------------------- */

export function CityScene({
  selectedId,
  onSelect,
  night,
  active = true,
  quality = "high",
  orbitRef,
  zoomRef,
}: CitySceneProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const nightMix = useRef(night ? 1 : 0);
  const mood = useMemo<Mood>(() => ({ night: nightMix }), []);
  const sunRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiRef = useRef<THREE.HemisphereLight | null>(null);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={quality === "high" ? [1, 1.6] : [1, 1.25]}
      shadows={quality === "high"}
      camera={{ fov: 36, near: 1, far: 500, position: [0, 52, 74] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="!absolute !inset-0"
      onPointerMissed={() => onSelect(null)}
    >
      <MoodController night={night} mood={mood} sunRef={sunRef} hemiRef={hemiRef} />
      <Rig selectedId={selectedId} orbitRef={orbitRef} zoomRef={zoomRef} />

      <hemisphereLight ref={hemiRef} args={["#5a6f82", "#0a0b0d", 0.7]} />
      <directionalLight
        ref={sunRef}
        position={[40, 60, 30]}
        intensity={2.2}
        castShadow={quality === "high"}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-bias={-0.0005}
      />

      <GroundAndRoads />
      <CityFill />
      <StreetLights mood={mood} />
      <Trucks mood={mood} />

      {projects.map((p) => (
        <ProjectBuilding
          key={p.id}
          project={p}
          hovered={hoverId === p.id}
          selected={selectedId === p.id}
          mood={mood}
          onHover={setHoverId}
          onSelect={onSelect}
        />
      ))}

      <Environment resolution={64} frames={1}>
        <Lightformer intensity={1.6} color="#dfe6f2" position={[20, 30, 10]} scale={[24, 14, 1]} />
        <Lightformer
          intensity={0.7}
          color="#5b8dff"
          position={[-24, 12, -16]}
          rotation-y={Math.PI}
          scale={[18, 10, 1]}
        />
      </Environment>
    </Canvas>
  );
}
