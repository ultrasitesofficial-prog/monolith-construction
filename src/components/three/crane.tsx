"use client";

import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Procedural tower crane — no model files. A latticed mast, slewing jib,
 * trolley, swaying hook load, and a pulsing aircraft beacon.
 *
 * Driven through a ref (no React re-renders per frame):
 * - build: 0→1 the crane telescopes up out of the ground
 * - work:  0→1 how hard it's slewing (phase-boosted during steel erection)
 * - fade:  0→1 dissolves the crane after handover
 */
export interface CraneState {
  build: number;
  work: number;
  fade: number;
}

export interface CraneProps {
  stateRef?: RefObject<CraneState>;
  height?: number;
  jib?: number;
  /** Per-instance time offset so multiple cranes never move in sync. */
  seed?: number;
  position?: [number, number, number];
  scale?: number;
  castShadow?: boolean;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function Crane({
  stateRef,
  height = 20,
  jib = 11,
  seed = 0,
  position = [0, 0, 0],
  scale = 1,
  castShadow = false,
}: CraneProps) {
  const root = useRef<THREE.Group>(null);
  const slew = useRef<THREE.Group>(null);
  const trolley = useRef<THREE.Group>(null);
  const cable = useRef<THREE.Mesh>(null);
  const load = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.Mesh>(null);

  const mats = useMemo(() => {
    const steel = new THREE.MeshStandardMaterial({
      color: "#c94f16",
      roughness: 0.55,
      metalness: 0.35,
      transparent: true,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: "#22262b",
      roughness: 0.6,
      metalness: 0.5,
      transparent: true,
    });
    const beaconMat = new THREE.MeshBasicMaterial({ color: "#ff3b30", transparent: true });
    return { steel, dark, beaconMat };
  }, []);

  /* Lattice crossbars up the mast. */
  const braces = useMemo(() => {
    const list: number[] = [];
    for (let y = 1; y < height; y += 1.1) list.push(y);
    return list;
  }, [height]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed * 17.31;
    const s = stateRef?.current ?? { build: 1, work: 0.4, fade: 0 };
    if (!root.current) return;

    const build = easeOutCubic(THREE.MathUtils.clamp(s.build, 0, 1));
    root.current.visible = build > 0.01 && s.fade < 0.99;
    root.current.scale.setScalar(scale);
    root.current.scale.y = scale * Math.max(build, 0.001);

    const opacity = 1 - THREE.MathUtils.clamp(s.fade, 0, 1);
    mats.steel.opacity = opacity;
    mats.dark.opacity = opacity;
    mats.beaconMat.opacity = opacity;

    // Slew: a slow patrol, boosted while the steel phase works.
    if (slew.current) {
      slew.current.rotation.y =
        Math.sin(t * 0.11) * 0.8 + Math.sin(t * 0.043) * 0.5 + s.work * t * 0.12;
    }
    // Trolley runs the jib; cable breathes; the load sways with momentum.
    if (trolley.current) {
      trolley.current.position.x = THREE.MathUtils.lerp(2.2, jib - 1, (Math.sin(t * 0.31) + 1) / 2);
    }
    const drop = 2.2 + ((Math.sin(t * 0.23) + 1) / 2) * (height * 0.42);
    if (cable.current) {
      cable.current.scale.y = drop;
      cable.current.position.y = -drop / 2;
    }
    if (load.current) {
      load.current.position.y = -drop;
      load.current.rotation.y = Math.sin(t * 0.4) * 0.5;
      load.current.rotation.z = Math.sin(t * 0.9) * 0.05;
    }
    if (beacon.current) {
      const pulse = (Math.sin(t * 2.4) + 1) / 2;
      beacon.current.scale.setScalar(0.8 + pulse * 0.55);
      mats.beaconMat.opacity = opacity * (0.35 + pulse * 0.65);
    }
  });

  const mastTop = height;

  return (
    <group ref={root} position={position}>
      {/* base pad */}
      <mesh position={[0, 0.15, 0]} material={mats.dark} castShadow={castShadow}>
        <boxGeometry args={[1.8, 0.3, 1.8]} />
      </mesh>
      {/* mast */}
      <mesh position={[0, mastTop / 2, 0]} material={mats.steel} castShadow={castShadow}>
        <boxGeometry args={[0.5, mastTop, 0.5]} />
      </mesh>
      {braces.map((y) => (
        <mesh key={y} position={[0, y, 0]} material={mats.dark}>
          <boxGeometry args={[0.62, 0.07, 0.62]} />
        </mesh>
      ))}

      {/* slewing assembly */}
      <group ref={slew} position={[0, mastTop, 0]}>
        {/* cab */}
        <mesh position={[0.15, 0.45, 0]} material={mats.dark} castShadow={castShadow}>
          <boxGeometry args={[1.1, 0.9, 0.9]} />
        </mesh>
        {/* jib */}
        <mesh position={[jib / 2 + 0.5, 0.95, 0]} material={mats.steel} castShadow={castShadow}>
          <boxGeometry args={[jib, 0.42, 0.42]} />
        </mesh>
        {/* counter-jib + weight */}
        <mesh position={[-2.1, 0.95, 0]} material={mats.steel}>
          <boxGeometry args={[3.4, 0.36, 0.5]} />
        </mesh>
        <mesh position={[-3.4, 0.5, 0]} material={mats.dark} castShadow={castShadow}>
          <boxGeometry args={[0.8, 1.1, 1.3]} />
        </mesh>
        {/* apex + tie bars */}
        <mesh position={[0, 2.2, 0]} material={mats.steel}>
          <coneGeometry args={[0.42, 1.8, 4]} />
        </mesh>
        <TieBar from={[0, 3, 0]} to={[jib - 0.6, 1.15, 0]} material={mats.dark} />
        <TieBar from={[0, 3, 0]} to={[-3.2, 1.15, 0]} material={mats.dark} />
        {/* beacon */}
        <mesh ref={beacon} position={[0, 3.25, 0]} material={mats.beaconMat}>
          <sphereGeometry args={[0.16, 10, 10]} />
        </mesh>

        {/* trolley + cable + hanging beam */}
        <group ref={trolley} position={[4, 0.7, 0]}>
          <mesh material={mats.dark}>
            <boxGeometry args={[0.5, 0.24, 0.5]} />
          </mesh>
          <mesh ref={cable} material={mats.dark}>
            <cylinderGeometry args={[0.02, 0.02, 1, 5]} />
          </mesh>
          <group ref={load}>
            <mesh material={mats.dark}>
              <boxGeometry args={[0.34, 0.3, 0.3]} />
            </mesh>
            <mesh position={[0, -0.35, 0]} material={mats.steel}>
              <boxGeometry args={[2.6, 0.22, 0.26]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/** Thin cylinder stretched between two points — crane tie bars. */
function TieBar({
  from,
  to,
  material,
}: {
  from: [number, number, number];
  to: [number, number, number];
  material: THREE.Material;
}) {
  const { position, rotation, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const dir = b.clone().sub(a);
    const len = dir.length();
    // Cylinder's long axis is Y; rotate Y onto the segment direction.
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    const euler = new THREE.Euler().setFromQuaternion(quat);
    return { position: mid, rotation: euler, length: len };
  }, [from, to]);

  return (
    <mesh position={position} rotation={rotation} material={material}>
      <cylinderGeometry args={[0.035, 0.035, length, 5]} />
    </mesh>
  );
}
