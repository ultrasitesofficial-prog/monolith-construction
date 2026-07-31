"use client";

import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Capability } from "@/config/content.config";

/**
 * Procedural exhibit objects — one per capability, built from primitives like
 * architectural study models. Each sits on a museum plinth of air: idle turn
 * plus a damped lean toward the visitor's pointer while hovered.
 */

export interface ObjectPose {
  x: number;
  y: number;
  hover: number;
}

const steel = new THREE.MeshStandardMaterial({ color: "#a7adb4", roughness: 0.35, metalness: 0.8 });
const dark = new THREE.MeshStandardMaterial({ color: "#2b2f35", roughness: 0.6, metalness: 0.4 });
const accent = new THREE.MeshStandardMaterial({ color: "#ff5a1f", roughness: 0.45, metalness: 0.3 });
const glassy = new THREE.MeshStandardMaterial({
  color: "#2b3f52",
  roughness: 0.18,
  metalness: 0.85,
});

function TowerModel() {
  return (
    <group>
      <mesh material={glassy} position={[0, 0.9, 0]}>
        <boxGeometry args={[0.85, 1.8, 0.85]} />
      </mesh>
      {[0.35, 0.9, 1.45].map((y) => (
        <mesh key={y} material={steel} position={[0, y, 0]}>
          <boxGeometry args={[0.92, 0.05, 0.92]} />
        </mesh>
      ))}
      <mesh material={accent} position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
      </mesh>
      <mesh material={dark} position={[0, 0.02, 0]}>
        <boxGeometry args={[1.5, 0.06, 1.5]} />
      </mesh>
    </group>
  );
}

function BridgeModel() {
  return (
    <group position={[0, 0.5, 0]}>
      <mesh material={steel} position={[0, 0.3, 0]}>
        <boxGeometry args={[2.4, 0.09, 0.5]} />
      </mesh>
      {[-0.6, 0.6].map((x) => (
        <group key={x}>
          <mesh material={accent} position={[x, 0.62, 0]}>
            <boxGeometry args={[0.09, 0.85, 0.09]} />
          </mesh>
          {[-1, 1].map((sgn) => (
            <mesh
              key={sgn}
              material={steel}
              position={[x + sgn * 0.32, 0.62, 0]}
              rotation-z={sgn * 0.75}
            >
              <cylinderGeometry args={[0.012, 0.012, 0.72, 4]} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh material={dark} position={[-1.05, 0.06, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.6]} />
      </mesh>
      <mesh material={dark} position={[1.05, 0.06, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.6]} />
      </mesh>
    </group>
  );
}

function GantryModel() {
  return (
    <group position={[0, 0.25, 0]}>
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} material={accent} position={[x, 0.55, 0]}>
          <boxGeometry args={[0.12, 1.1, 0.12]} />
        </mesh>
      ))}
      <mesh material={accent} position={[0, 1.12, 0]}>
        <boxGeometry args={[1.95, 0.14, 0.16]} />
      </mesh>
      <mesh material={dark} position={[0.3, 0.86, 0]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
      </mesh>
      <mesh material={steel} position={[0.3, 0.5, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.34, 4]} />
      </mesh>
      <mesh material={steel} position={[0.3, 0.3, 0]}>
        <boxGeometry args={[0.5, 0.12, 0.14]} />
      </mesh>
      <mesh material={dark} position={[0, 0.02, 0]}>
        <boxGeometry args={[2.2, 0.05, 0.8]} />
      </mesh>
    </group>
  );
}

function PavilionModel() {
  return (
    <group position={[0, 0.3, 0]}>
      <mesh material={steel} position={[-0.45, 0.78, 0]} rotation-z={0.32}>
        <boxGeometry args={[1.15, 0.06, 1.1]} />
      </mesh>
      <mesh material={steel} position={[0.52, 0.66, 0]} rotation-z={-0.42}>
        <boxGeometry args={[1.05, 0.06, 1.1]} />
      </mesh>
      {(
        [
          [-0.85, 0.25],
          [-0.1, 0.3],
          [0.65, 0.18],
          [0.15, 0.28],
        ] as [number, number][]
      ).map(([x, h], i) => (
        <mesh key={i} material={i === 1 ? accent : dark} position={[x, h / 2 + 0.02, i % 2 ? 0.35 : -0.3]}>
          <cylinderGeometry args={[0.03, 0.03, h, 6]} />
        </mesh>
      ))}
      <mesh material={dark} position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.05, 1.4]} />
      </mesh>
    </group>
  );
}

function BlocksModel() {
  return (
    <group position={[0, 0.2, 0]}>
      <mesh material={glassy} position={[-0.3, 0.35, 0.1]}>
        <boxGeometry args={[0.9, 0.7, 0.8]} />
      </mesh>
      <mesh material={steel} position={[0.42, 0.55, -0.15]}>
        <boxGeometry args={[0.7, 1.1, 0.7]} />
      </mesh>
      <mesh material={accent} position={[-0.15, 0.92, -0.2]}>
        <boxGeometry args={[0.55, 0.45, 0.5]} />
      </mesh>
      <mesh material={dark} position={[0, 0, 0]}>
        <boxGeometry args={[1.9, 0.05, 1.4]} />
      </mesh>
    </group>
  );
}

function TrussModel() {
  const arms: [number, number, number][] = [
    [0.7, 0.4, 0],
    [-0.7, 0.4, 0],
    [0, 0.4, 0.7],
    [0, 0.4, -0.7],
    [0.45, 1, 0.45],
    [-0.45, 1, -0.45],
  ];
  return (
    <group position={[0, 0.35, 0]}>
      <mesh material={accent} position={[0, 0.55, 0]}>
        <icosahedronGeometry args={[0.2, 0]} />
      </mesh>
      {arms.map((end, i) => {
        const from = new THREE.Vector3(0, 0.55, 0);
        const to = new THREE.Vector3(...end);
        const mid = from.clone().add(to).multiplyScalar(0.5);
        const dir = to.clone().sub(from);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.normalize(),
        );
        return (
          <group key={i}>
            <mesh material={steel} position={mid} quaternion={quat}>
              <cylinderGeometry args={[0.035, 0.035, len, 6]} />
            </mesh>
            <mesh material={dark} position={to}>
              <icosahedronGeometry args={[0.09, 0]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

const MODELS: Record<Capability["object"], () => React.JSX.Element> = {
  tower: TowerModel,
  bridge: BridgeModel,
  gantry: GantryModel,
  pavilion: PavilionModel,
  blocks: BlocksModel,
  truss: TrussModel,
};

export function ServiceObject({
  kind,
  pose,
  reduced,
}: {
  kind: Capability["object"];
  pose: RefObject<ObjectPose>;
  reduced?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const Model = MODELS[kind];

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 0.05);
    const p = pose.current;
    const idle = reduced ? 0.6 : clock.elapsedTime * 0.25;
    const targetY = idle + p.x * 0.9 * p.hover;
    const targetX = -0.12 + p.y * -0.45 * p.hover;
    group.current.rotation.y = reduced
      ? targetY
      : THREE.MathUtils.damp(group.current.rotation.y, targetY, 4.5, dt);
    group.current.rotation.x = reduced
      ? targetX
      : THREE.MathUtils.damp(group.current.rotation.x, targetX, 4.5, dt);
    const scale = 1 + p.hover * 0.06;
    group.current.scale.setScalar(
      reduced ? 1 : THREE.MathUtils.damp(group.current.scale.x, scale, 5, dt),
    );
  });

  return (
    <group ref={group} position={[0, -0.05, 0]} scale={1.12}>
      <Model />
    </group>
  );
}
