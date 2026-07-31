"use client";

import { useEffect, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import { capabilities } from "@/config/content.config";
import { ServiceObject, type ObjectPose } from "@/components/three/service-objects";

/**
 * One WebGL context, six scissored viewports — each View tracks its card's
 * placeholder div. Far cheaper than six canvases, and views outside the
 * viewport skip rendering entirely.
 */
export default function CapabilityViews({
  viewRefs,
  poseRefs,
  reduced,
  eventSource,
}: {
  viewRefs: RefObject<HTMLDivElement | null>[];
  poseRefs: { current: ObjectPose }[];
  reduced: boolean;
  eventSource: RefObject<HTMLElement | null>;
}) {
  /* Wait until every tracked div exists (first paint) before mounting views. */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (viewRefs.every((r) => r.current)) setReady(true);
  }, [viewRefs]);

  if (!ready) return null;

  return (
    <Canvas
      frameloop={reduced ? "demand" : "always"}
      dpr={[1, 1.5]}
      className="!pointer-events-none !absolute !inset-0 z-10"
      eventSource={eventSource as RefObject<HTMLElement>}
      gl={{ antialias: true }}
      aria-hidden
    >
      {capabilities.map((cap, i) => (
        <View key={cap.id} track={viewRefs[i] as RefObject<HTMLDivElement>}>
          <PerspectiveCamera makeDefault position={[0, 0.85, 3.1]} fov={34} />
          <ambientLight intensity={0.9} />
          <directionalLight position={[4, 6, 5]} intensity={3} color="#ffe3c8" />
          <directionalLight position={[-5, 3, -4]} intensity={1.3} color="#7ea3ff" />
          <directionalLight position={[0, -3, 6]} intensity={0.5} color="#ff5a1f" />
          <ServiceObject kind={cap.object} pose={poseRefs[i]!} reduced={reduced} />
        </View>
      ))}
    </Canvas>
  );
}
