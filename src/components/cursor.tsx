"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { siteConfig } from "@/config/site.config";

type CursorVariant = "default" | "link" | "drag" | "view" | "enter";

const LABELS: Partial<Record<CursorVariant, string>> = {
  drag: "DRAG",
  view: "VIEW",
  enter: "ENTER",
};

/**
 * Survey-reticle cursor: a small square dot chased by a square ring with
 * corner ticks. Context aware via event delegation — elements opt into
 * variants with data-cursor="drag|view|enter"; links and buttons get the
 * ring expansion automatically. Fine pointers only; reduced motion opts out.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [pressed, setPressed] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!siteConfig.features?.customCursor) return;
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    setEnabled(true);
    document.documentElement.dataset.cursor = "on";

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.38, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.38, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setHidden(false);
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target || !(target instanceof Element)) return;
      const tagged = target.closest<HTMLElement>("[data-cursor]");
      if (tagged?.dataset.cursor) {
        setVariant(tagged.dataset.cursor as CursorVariant);
        return;
      }
      const interactive = target.closest(
        "a, button, [role='button'], input, textarea, select, label",
      );
      setVariant(interactive ? "link" : "default");
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);

    return () => {
      delete document.documentElement.dataset.cursor;
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  const label = LABELS[variant];
  const expanded = variant !== "default";

  return (
    <div aria-hidden className={enabled ? "" : "hidden"}>
      {/* dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[120]"
        style={{ opacity: hidden ? 0 : 1, transition: "opacity 0.25s" }}
      >
        <div
          className="bg-accent size-[5px]"
          style={{
            transform: `translate(-50%,-50%) scale(${label ? 0 : pressed ? 0.6 : 1})`,
            transition: "transform 0.25s cubic-bezier(0.23,1,0.32,1)",
          }}
        />
      </div>
      {/* reticle ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[119]"
        style={{ opacity: hidden ? 0 : 1, transition: "opacity 0.25s" }}
      >
        <div
          className="border-soft/60 relative flex items-center justify-center border"
          style={{
            width: 34,
            height: 34,
            transform: `translate(-50%,-50%) scale(${
              pressed ? 0.8 : label ? 2.1 : expanded ? 1.4 : 1
            }) rotate(${expanded && !label ? 45 : 0}deg)`,
            background: label ? "color-mix(in srgb, var(--bg) 78%, transparent)" : "transparent",
            borderColor: expanded ? "var(--accent)" : undefined,
            transition:
              "transform 0.35s cubic-bezier(0.23,1,0.32,1), background 0.3s, border-color 0.3s",
          }}
        >
          {/* corner ticks */}
          <span className="bg-accent absolute -top-px -left-px size-[3px]" />
          <span className="bg-accent absolute -top-px -right-px size-[3px]" />
          <span className="bg-accent absolute -bottom-px -left-px size-[3px]" />
          <span className="bg-accent absolute -right-px -bottom-px size-[3px]" />
          {label ? (
            <span
              className="font-mono text-ink text-[9px] tracking-[0.2em]"
              style={{ transform: `rotate(0deg) scale(${1 / 2.1})` }}
            >
              {label}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
