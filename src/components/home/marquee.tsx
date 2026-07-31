"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { marqueeDisciplines } from "@/config/content.config";

/**
 * Discipline marquee — a steel band between hero and chronicle. CSS keyframes
 * carry it by default; on capable devices GSAP takes over and chases scroll
 * velocity, so flick-scrolling whips the band like a passing train.
 */
export function Marquee() {
  const wrap = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const [jsDriven, setJsDriven] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = row.current;
    if (!el) return;
    setJsDriven(true);

    const tween = gsap.to(el, {
      xPercent: -50,
      duration: 24,
      ease: "none",
      repeat: -1,
    });

    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 900, 3.4);
        gsap.to(tween, { timeScale: boost, duration: 0.3, overwrite: true });
      },
    });

    return () => {
      st.kill();
      tween.kill();
    };
  }, []);

  const items = [...marqueeDisciplines, ...marqueeDisciplines];

  return (
    <div
      ref={wrap}
      className="border-line overflow-hidden border-y py-5"
      aria-label="Disciplines"
      data-sheet="S.02 — DISCIPLINES"
    >
      <div
        ref={row}
        className={`flex w-max items-center gap-10 whitespace-nowrap ${jsDriven ? "" : "animate-marquee"}`}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-display text-soft text-3xl font-semibold tracking-wide uppercase sm:text-4xl">
              {item}
            </span>
            <span className="bg-accent inline-block size-2" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}
