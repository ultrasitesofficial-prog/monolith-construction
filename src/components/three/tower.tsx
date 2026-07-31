"use client";

import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * The hero tower — a parametric skyscraper that erects itself as the visitor
 * scrolls. One smoothed progress value (0→1) drives five construction states:
 *
 *   blueprint ghost → structural steel → slip-form core & slabs →
 *   curtain-wall glass → delivered, windows waking up
 *
 * Everything is instanced (≈1,150 instances) and updated imperatively in
 * useFrame — zero React re-renders during the scroll.
 */

export const TOWER = {
  floors: 24,
  floorHeight: 1.15,
  width: 8.4,
  depth: 8.4,
  get height() {
    return this.floors * this.floorHeight;
  },
};

/* Phase windows on the master progress track. */
const PHASE = {
  ghostFade: [0.12, 0.2],
  steel: [0.13, 0.47],
  core: [0.22, 0.6],
  slabs: [0.3, 0.64],
  glass: [0.55, 0.86],
  roof: [0.8, 0.88],
  lights: [0.87, 0.985],
} as const;

const win = (p: number, a: number, b: number) =>
  THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

/** Per-floor slice of a phase window: floor f gets its own sub-window. */
function floorWin(p: number, f: number, [a, b]: readonly [number, number], soft = 0.3) {
  const span = b - a;
  const start = a + (f / TOWER.floors) * span * (1 - soft);
  return win(p, start, start + span * soft);
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

const PANELS_PER_SIDE = 5;
const SIDES = [
  { rot: 0, nx: 0, nz: 1 }, // +Z
  { rot: Math.PI, nx: 0, nz: -1 }, // -Z
  { rot: Math.PI / 2, nx: 1, nz: 0 }, // +X
  { rot: -Math.PI / 2, nx: -1, nz: 0 }, // -X
];

export function Tower({
  pRef,
  shadows = true,
}: {
  /** Smoothed master progress 0→1 (written by the scene choreographer). */
  pRef: RefObject<number>;
  shadows?: boolean;
}) {
  const { floors, floorHeight: FH, width: W, depth: D, height: H } = TOWER;

  const columnsMesh = useRef<THREE.InstancedMesh>(null);
  const beamsMesh = useRef<THREE.InstancedMesh>(null);
  const slabsMesh = useRef<THREE.InstancedMesh>(null);
  const glassMesh = useRef<THREE.InstancedMesh>(null);
  const lightsMesh = useRef<THREE.InstancedMesh>(null);
  const coreMesh = useRef<THREE.Mesh>(null);
  const ghost = useRef<THREE.Group>(null);
  const ghostMat = useRef<THREE.LineBasicMaterial>(null);
  const scanline = useRef<THREE.LineSegments>(null);
  const roofGroup = useRef<THREE.Group>(null);
  const entrance = useRef<THREE.Group>(null);
  const entranceGlow = useRef<THREE.MeshBasicMaterial>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lastP = useRef(-1);

  /* ------------------------- static instance layouts ------------------------ */

  const columnXZ = useMemo(() => {
    const pts: { x: number; z: number }[] = [];
    const n = 4;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const edge = i === 0 || i === n - 1 || j === 0 || j === n - 1;
        if (!edge) continue;
        pts.push({
          x: -W / 2 + 0.14 + (i * (W - 0.28)) / (n - 1),
          z: -D / 2 + 0.14 + (j * (D - 0.28)) / (n - 1),
        });
      }
    }
    return pts; // 12 perimeter columns
  }, [W, D]);

  const glassPanels = useMemo(() => {
    const rand = mulberry32(7);
    const panels: {
      x: number;
      y: number;
      z: number;
      rot: number;
      nx: number;
      nz: number;
      key: number;
    }[] = [];
    for (let f = 0; f < floors; f++) {
      for (let s = 0; s < SIDES.length; s++) {
        const side = SIDES[s]!;
        for (let i = 0; i < PANELS_PER_SIDE; i++) {
          const along = -W / 2 + (i + 0.5) * (W / PANELS_PER_SIDE);
          const x = side.nz !== 0 ? along : side.nx * (W / 2 + 0.08);
          const z = side.nx !== 0 ? along : side.nz * (D / 2 + 0.08);
          panels.push({
            x,
            y: f * FH + FH / 2,
            z,
            rot: side.rot,
            nx: side.nx,
            nz: side.nz,
            // Diagonal install sweep with a little human jitter.
            key: (f / floors) * 0.75 + (i / PANELS_PER_SIDE) * 0.12 + s * 0.03 + rand() * 0.06,
          });
        }
      }
    }
    return panels;
  }, [floors, FH, W, D]);

  const windowLights = useMemo(() => {
    const rand = mulberry32(21);
    const lights: { x: number; y: number; z: number; rot: number; r: number }[] = [];
    for (let f = 1; f < floors; f++) {
      for (const side of SIDES) {
        for (let i = 0; i < PANELS_PER_SIDE; i++) {
          if (rand() > 0.52) continue;
          const along = -W / 2 + (i + 0.5) * (W / PANELS_PER_SIDE);
          // Sit just proud of the curtain wall — behind the glass they'd be
          // dimmed to nothing by the blended dark panels.
          lights.push({
            x: side.nz !== 0 ? along : side.nx * (W / 2 + 0.13),
            y: f * FH + FH / 2,
            z: side.nx !== 0 ? along : side.nz * (D / 2 + 0.13),
            rot: side.rot,
            r: rand(),
          });
        }
      }
    }
    return lights;
  }, [floors, FH, W, D]);

  /* ------------------------------- materials ------------------------------- */

  const mats = useMemo(
    () => ({
      column: new THREE.MeshStandardMaterial({ color: "#81878e", roughness: 0.4, metalness: 0.8 }),
      beam: new THREE.MeshStandardMaterial({ color: "#9c4517", roughness: 0.55, metalness: 0.45 }),
      slab: new THREE.MeshStandardMaterial({ color: "#7e8287", roughness: 0.92 }),
      core: new THREE.MeshStandardMaterial({ color: "#95989d", roughness: 0.95 }),
      glass: new THREE.MeshStandardMaterial({
        color: "#16222e",
        roughness: 0.12,
        metalness: 0.95,
        transparent: true,
        opacity: 0.85,
        envMapIntensity: 2.2,
        side: THREE.DoubleSide,
      }),
      light: new THREE.MeshBasicMaterial({
        color: "#ffb066",
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    }),
    [],
  );

  /* Warm per-window color variation, set once. */
  const lightTints = useMemo(() => {
    const rand = mulberry32(4);
    return windowLights.map(() =>
      new THREE.Color().setHSL(0.07 + rand() * 0.035, 0.9, 0.6 + rand() * 0.18),
    );
  }, [windowLights]);

  /* Ghost wireframe geometry: tower massing + core + floor tick rings. */
  const ghostGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions: number[] = [];
    const box = (w: number, h: number, d: number, y0: number) => {
      const x = w / 2;
      const z = d / 2;
      const y1 = y0 + h;
      const c = [
        [-x, y0, -z], [x, y0, -z], [x, y0, z], [-x, y0, z],
        [-x, y1, -z], [x, y1, -z], [x, y1, z], [-x, y1, z],
      ] as const;
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ] as const;
      for (const [a, b] of edges) positions.push(...c[a]!, ...c[b]!);
    };
    box(W + 0.35, H + 0.6, D + 0.35, 0);
    box(3.2, H + 0.6, 3.2, 0);
    for (let i = 1; i < 4; i++) box(W + 0.35, 0, D + 0.35, (H / 4) * i);
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [W, D, H]);

  const scanGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const x = W / 2 + 0.55;
    const z = D / 2 + 0.55;
    const pts = [
      [-x, 0, -z], [x, 0, -z], [x, 0, -z], [x, 0, z],
      [x, 0, z], [-x, 0, z], [-x, 0, z], [-x, 0, -z],
    ].flat();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [W, D]);

  /* ------------------------------ frame update ------------------------------ */

  useFrame(({ clock }) => {
    const p = THREE.MathUtils.clamp(pRef.current ?? 0, 0, 1);
    const t = clock.elapsedTime;
    /* Skip the ~1,150 matrix rebuilds while the scroll is settled — only the
       ambient layers (ghost pulse, window flicker) stay on the clock. */
    const settled = Math.abs(p - lastP.current) < 0.00004;
    lastP.current = p;

    /* Ghost blueprint */
    if (ghost.current && ghostMat.current) {
      const fade = 1 - win(p, PHASE.ghostFade[0], PHASE.ghostFade[1]);
      ghost.current.visible = fade > 0.01;
      ghostMat.current.opacity = fade * (0.32 + 0.1 * Math.sin(t * 2.2));
      if (scanline.current) {
        scanline.current.position.y = ((t * 2.6) % (H + 1.5));
        (scanline.current.material as THREE.LineBasicMaterial).opacity = fade * 0.8;
      }
    }

    /* Columns rise floor by floor */
    if (columnsMesh.current && !settled) {
      let i = 0;
      for (let f = 0; f < floors; f++) {
        const e = easeOutCubic(floorWin(p, f, PHASE.steel));
        for (const c of columnXZ) {
          dummy.position.set(c.x, f * FH + (e * FH) / 2, c.z);
          dummy.scale.set(1, Math.max(e, 0.0001), 1);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          columnsMesh.current.setMatrixAt(i++, dummy.matrix);
        }
      }
      columnsMesh.current.instanceMatrix.needsUpdate = true;
    }

    /* Primer-red ring beams slide in after their floor's columns */
    if (beamsMesh.current && !settled) {
      let i = 0;
      for (let f = 0; f < floors; f++) {
        const e = easeOutCubic(floorWin(p, f, PHASE.steel, 0.36));
        const y = (f + 1) * FH - 0.14 + (1 - e) * 0.5;
        const inset = 0.14;
        const sides = [
          { x: 0, z: D / 2 - inset, ry: 0 },
          { x: 0, z: -(D / 2 - inset), ry: 0 },
          { x: W / 2 - inset, z: 0, ry: Math.PI / 2 },
          { x: -(W / 2 - inset), z: 0, ry: Math.PI / 2 },
        ];
        for (const s of sides) {
          dummy.position.set(s.x, y, s.z);
          dummy.rotation.set(0, s.ry, 0);
          dummy.scale.set(Math.max(e, 0.0001), 1, 1);
          dummy.updateMatrix();
          beamsMesh.current.setMatrixAt(i++, dummy.matrix);
        }
      }
      beamsMesh.current.instanceMatrix.needsUpdate = true;
    }

    /* Slabs drop onto the frame */
    if (slabsMesh.current && !settled) {
      for (let f = 0; f <= floors; f++) {
        const e = floorWin(p, Math.max(f - 1, 0), PHASE.slabs);
        const eased = easeOutCubic(e);
        dummy.position.set(0, f * FH + 0.04 + (1 - eased) * 2.4, 0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(e > 0 ? 1 : 0.0001, 1, e > 0 ? 1 : 0.0001);
        dummy.updateMatrix();
        slabsMesh.current.setMatrixAt(f, dummy.matrix);
      }
      slabsMesh.current.instanceMatrix.needsUpdate = true;
    }

    /* Slip-form core climbs continuously */
    if (coreMesh.current) {
      const e = win(p, PHASE.core[0], PHASE.core[1]);
      const h = Math.max(e * H, 0.001);
      coreMesh.current.scale.y = h / H;
      coreMesh.current.position.y = h / 2;
      coreMesh.current.visible = e > 0;
    }

    /* Curtain wall flies in on a diagonal sweep */
    if (glassMesh.current && !settled) {
      const [g0, g1] = PHASE.glass;
      for (let i = 0; i < glassPanels.length; i++) {
        const panel = glassPanels[i]!;
        const start = g0 + panel.key * (g1 - g0) * 0.72;
        const e = easeOutCubic(win(p, start, start + (g1 - g0) * 0.24));
        const off = 1 - e;
        dummy.position.set(
          panel.x + panel.nx * off * 3.2,
          panel.y + off * 1.4,
          panel.z + panel.nz * off * 3.2,
        );
        dummy.rotation.set(0, panel.rot + off * 0.7, 0);
        dummy.scale.setScalar(e > 0 ? 1 : 0.0001);
        dummy.updateMatrix();
        glassMesh.current.setMatrixAt(i, dummy.matrix);
      }
      glassMesh.current.instanceMatrix.needsUpdate = true;
    }

    /* Windows wake up one by one, flickering like contactors closing */
    if (lightsMesh.current) {
      const [l0, l1] = PHASE.lights;
      lightsMesh.current.visible = p > l0;
      for (let i = 0; i < windowLights.length; i++) {
        const wl = windowLights[i]!;
        const on = win(p, l0 + wl.r * (l1 - l0 - 0.015), l0 + wl.r * (l1 - l0 - 0.015) + 0.015);
        let s = easeOutBack(on);
        if (on > 0 && on < 1) s *= 0.55 + 0.45 * Math.sin(t * 42 * (wl.r + 0.5));
        dummy.position.set(wl.x, wl.y, wl.z);
        dummy.rotation.set(0, wl.rot, 0);
        dummy.scale.setScalar(Math.max(s, 0.0001));
        dummy.updateMatrix();
        lightsMesh.current.setMatrixAt(i, dummy.matrix);
      }
      lightsMesh.current.instanceMatrix.needsUpdate = true;
    }

    /* Roof plant + parapet, then the entrance warms up */
    if (roofGroup.current) {
      const e = easeOutBack(win(p, PHASE.roof[0], PHASE.roof[1]));
      roofGroup.current.scale.setScalar(Math.max(e, 0.0001));
      roofGroup.current.visible = e > 0.01;
    }
    if (entrance.current && entranceGlow.current) {
      const e = win(p, 0.88, 0.96);
      entrance.current.visible = e > 0.01;
      entranceGlow.current.opacity = e * (0.62 + 0.12 * Math.sin(t * 1.4));
    }
  });

  /* Set static per-instance window tints once. */
  const setLightColors = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    lightsMesh.current = mesh;
    lightTints.forEach((c, i) => mesh.setColorAt(i, c));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  return (
    <group>
      {/* blueprint ghost */}
      <group ref={ghost}>
        <lineSegments geometry={ghostGeom}>
          <lineBasicMaterial ref={ghostMat} color="#5b8dff" transparent opacity={0.35} />
        </lineSegments>
        <lineSegments ref={scanline} geometry={scanGeom}>
          <lineBasicMaterial color="#8fb0ff" transparent opacity={0.8} />
        </lineSegments>
      </group>

      {/* structure */}
      <instancedMesh
        ref={columnsMesh}
        args={[undefined, undefined, columnXZ.length * floors]}
        material={mats.column}
        frustumCulled={false}
        castShadow={shadows}
      >
        <boxGeometry args={[0.24, FH, 0.24]} />
      </instancedMesh>
      <instancedMesh
        ref={beamsMesh}
        args={[undefined, undefined, 4 * floors]}
        material={mats.beam}
        frustumCulled={false}
      >
        <boxGeometry args={[W - 0.2, 0.16, 0.2]} />
      </instancedMesh>
      <instancedMesh
        ref={slabsMesh}
        args={[undefined, undefined, floors + 1]}
        material={mats.slab}
        frustumCulled={false}
        castShadow={shadows}
      >
        <boxGeometry args={[W - 0.24, 0.14, D - 0.24]} />
      </instancedMesh>
      <mesh ref={coreMesh} material={mats.core} castShadow={shadows} frustumCulled={false}>
        <boxGeometry args={[3.2, H, 3.2]} />
      </mesh>

      {/* envelope */}
      <instancedMesh
        ref={glassMesh}
        args={[undefined, undefined, glassPanels.length]}
        material={mats.glass}
        frustumCulled={false}
      >
        <boxGeometry args={[W / PANELS_PER_SIDE - 0.06, FH - 0.1, 0.06]} />
      </instancedMesh>

      {/* interior life */}
      <instancedMesh
        ref={setLightColors}
        args={[undefined, undefined, windowLights.length]}
        material={mats.light}
        frustumCulled={false}
      >
        <planeGeometry args={[1.16, 0.72]} />
      </instancedMesh>

      {/* roof plant */}
      <group ref={roofGroup} position={[0, H + 0.06, 0]}>
        <mesh position={[1.6, 0.5, 1.2]} material={mats.core} castShadow={shadows}>
          <boxGeometry args={[2.6, 1, 2]} />
        </mesh>
        <mesh position={[-1.8, 0.35, -1.4]} material={mats.column}>
          <boxGeometry args={[1.6, 0.7, 1.6]} />
        </mesh>
        <mesh position={[0, 1.1, 0]} material={mats.column}>
          <cylinderGeometry args={[0.04, 0.04, 2.2, 6]} />
        </mesh>
      </group>

      {/* entrance glow — the handover moment */}
      <group ref={entrance} position={[0, 0, D / 2 + 0.12]}>
        <mesh position={[0, 1.05, 0]}>
          <planeGeometry args={[2.6, 2.1]} />
          <meshBasicMaterial
            ref={entranceGlow}
            color="#ffc287"
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 2.72, 0.18]} material={mats.column}>
          <boxGeometry args={[4.2, 0.14, 0.9]} />
        </mesh>
      </group>
    </group>
  );
}
