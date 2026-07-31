"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { capabilities, type Capability } from "@/config/content.config";
import { Reveal, RevealLines } from "@/components/reveal";
import type { ObjectPose } from "@/components/three/service-objects";

/* The multi-viewport canvas ships in its own client chunk. */
const CapabilityViews = dynamic(() => import("./capability-views"), { ssr: false });

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * S.04 — CAPABILITIES. Each discipline is exhibited as a rotating study
 * model: one shared WebGL context, six scissored viewports tracking the
 * cards. Hover leans the model toward the cursor; opening a card slides in
 * the full brief.
 */
export function Capabilities() {
  const reduce = useReducedMotion() ?? false;
  const section = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<Capability | null>(null);
  const [canvasOn, setCanvasOn] = useState(false);

  /* One tracking div + pose ref per capability, stable across renders. */
  const viewRefs = useMemo(
    () => capabilities.map(() => createRef<HTMLDivElement>()),
    [],
  );
  const poseRefs = useMemo(
    () => capabilities.map(() => ({ current: { x: 0, y: 0, hover: 0 } as ObjectPose })),
    [],
  );

  /* Mount the GL context only once the section approaches the viewport. */
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setCanvasOn(true);
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onCardPointer = (i: number) => (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    poseRefs[i]!.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    poseRefs[i]!.current.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  };

  return (
    <section
      ref={section}
      id="capabilities"
      data-sheet="S.04 — CAPABILITIES"
      aria-label="Capabilities"
      className="relative mx-auto max-w-[1600px] px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <p className="sheet-label mb-4">
              S.04 — CAPABILITIES <b>■</b> SIX DISCIPLINES
            </p>
          </Reveal>
          <RevealLines
            as="h2"
            lines={["WHAT WE", "KNOW HOW TO RAISE"]}
            className="font-display text-ink block text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.9] font-bold tracking-tight uppercase"
          />
        </div>
        <Reveal delay={0.15} className="max-w-sm">
          <p className="text-soft text-sm leading-relaxed">
            Every discipline is a study model from our workshop — turn one over.
            The numbers underneath are as-built, not aspirational.
          </p>
        </Reveal>
      </div>

      <div className="relative">
        {/* shared GL context over the grid; pointer events pass through */}
        {canvasOn ? (
          <CapabilityViews viewRefs={viewRefs} poseRefs={poseRefs} reduced={reduce} eventSource={section} />
        ) : null}

        <div className="grid gap-px sm:grid-cols-2 xl:grid-cols-3" role="list">
          {capabilities.map((cap, i) => (
            <Reveal key={cap.id} delay={(i % 3) * 0.08} className="min-w-0">
              <article
                role="listitem"
                className="group border-line bg-surface hover:bg-raised relative flex h-full flex-col border transition-colors duration-500"
                onPointerMove={onCardPointer(i)}
                onPointerEnter={() => (poseRefs[i]!.current.hover = 1)}
                onPointerLeave={() => {
                  poseRefs[i]!.current.hover = 0;
                }}
              >
                <div className="flex items-start justify-between p-5 pb-0">
                  <p className="font-mono text-accent text-[11px] tracking-[0.24em]">{cap.code}</p>
                  <div className="reg-mark opacity-0 transition-opacity duration-500 group-hover:opacity-60" />
                </div>

                {/* the model viewport the canvas tracks */}
                <div ref={viewRefs[i]} className="h-44 w-full sm:h-52" aria-hidden />

                <div className="flex grow flex-col p-5 pt-0">
                  <h3 className="font-display text-ink text-2xl font-semibold tracking-tight uppercase">
                    {cap.name}
                  </h3>
                  <p className="text-soft mt-2 grow text-sm leading-relaxed">{cap.blurb}</p>
                  <button
                    type="button"
                    onClick={() => setOpen(cap)}
                    data-cursor="view"
                    className="link-draw text-ink font-mono mt-5 self-start text-[11px] tracking-[0.2em]"
                    aria-haspopup="dialog"
                  >
                    OPEN THE BRIEF ↗
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ————— brief dialog ————— */}
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              aria-label="Close brief"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${open.name} brief`}
              className="border-line bg-surface relative m-0 w-full max-w-2xl border p-6 sm:m-6 sm:p-9"
              initial={reduce ? { opacity: 0 } : { y: 56, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="hazard-strip absolute inset-x-0 top-0" aria-hidden />
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-accent text-[11px] tracking-[0.24em]">{open.code}</p>
                  <h3 className="font-display text-ink mt-2 text-4xl font-bold tracking-tight uppercase sm:text-5xl">
                    {open.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Close brief"
                  className="border-line hover:border-accent flex size-10 shrink-0 items-center justify-center border transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              <p className="text-soft mt-5 leading-relaxed">{open.description}</p>

              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {open.bullets.map((b) => (
                  <li key={b} className="text-ink flex items-baseline gap-2.5 text-sm">
                    <span className="bg-accent inline-block size-1.5 shrink-0 translate-y-[-1px]" />
                    {b}
                  </li>
                ))}
              </ul>

              <p className="font-mono text-faint border-line mt-7 border-t pt-4 text-[11px] tracking-[0.18em]">
                {open.spec}
              </p>

              <Link href="/contact" className="btn-plate press mt-7">
                <span>Scope this with us</span>
              </Link>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
