"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { hero } from "@/config/content.config";
import { useBootDone } from "@/components/boot";

const HeroScene = dynamic(
  () => import("@/components/three/hero-scene").then((m) => m.HeroScene),
  { ssr: false },
);

const EASE = [0.23, 1, 0.32, 1] as const;
/** Progress thresholds where the HUD narration flips to the next phase. */
const PHASE_AT = [0, 0.16, 0.4, 0.66, 0.9];

/**
 * S.01 — THE BUILD. A 500vh pinned sequence: the tower erects itself in
 * sync with scroll while the HUD narrates each construction state. The
 * canvas freezes offscreen; reduced motion gets the delivered dusk frame.
 */
export function Hero() {
  const outer = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const elevRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const phaseIdxRef = useRef(0);

  const reduce = useReducedMotion() ?? false;
  const booted = useBootDone();
  const [phase, setPhase] = useState(0);
  const [active, setActive] = useState(true);
  const [quality, setQuality] = useState<"high" | "low">("high");

  /* Device budget: coarse pointers and narrow screens get the lean scene. */
  useEffect(() => {
    const lean =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    setQuality(lean ? "low" : "high");
  }, []);

  /* Scroll drives the master progress; React only hears phase changes. */
  useEffect(() => {
    if (reduce) {
      setPhase(hero.phases.length - 1);
      progress.current = 1;
      return;
    }
    const st = ScrollTrigger.create({
      trigger: outer.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progress.current = self.progress;
        let idx = 0;
        for (let i = PHASE_AT.length - 1; i >= 0; i--) {
          if (self.progress >= PHASE_AT[i]!) {
            idx = i;
            break;
          }
        }
        if (idx !== phaseIdxRef.current) {
          phaseIdxRef.current = idx;
          setPhase(idx);
        }
      },
    });
    return () => st.kill();
  }, [reduce]);

  /* HUD instruments update outside React on the shared ticker. */
  useEffect(() => {
    if (reduce) {
      if (elevRef.current) elevRef.current.textContent = "+96.4 M";
      return;
    }
    const update = () => {
      const p = progress.current;
      if (elevRef.current) {
        elevRef.current.textContent = `+${(p * 96.4).toFixed(1)} M`;
      }
      if (railRef.current) {
        railRef.current.style.transform = `scaleY(${p})`;
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = String(Math.max(0, 1 - p * 22));
      }
    };
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, [reduce]);

  /* Freeze the GL loop when the hero leaves the viewport. */
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry?.isIntersecting ?? false), {
      rootMargin: "80px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  const current = hero.phases[phase]!;
  const show = booted;

  return (
    <section
      ref={outer}
      id="build"
      data-sheet="S.01 — THE BUILD"
      aria-label="Monolith — the build"
      className={reduce ? "relative" : "relative h-[500svh]"}
    >
      <div
        className="sticky top-0 h-svh overflow-hidden"
        onPointerMove={onPointerMove}
      >
        <HeroScene
          progress={progress}
          pointer={pointer}
          reduced={reduce}
          active={active}
          quality={quality}
        />

        {/* readability gradient over the horizon line */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/45 to-transparent"
          aria-hidden
        />

        {/* ————— HUD ————— */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-5 pt-24 pb-8 sm:px-8">
          {/* eyebrow */}
          <div className="flex items-start justify-between">
            <motion.p
              className="sheet-label"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            >
              {hero.eyebrow}
            </motion.p>
            <motion.div
              className="reg-mark mt-1 hidden sm:block"
              initial={reduce ? false : { opacity: 0 }}
              animate={show ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
            />
          </div>

          <div className="flex items-end justify-between gap-6">
            {/* phase narration */}
            <div className="max-w-[80%] sm:max-w-[70%]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.code}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0, y: -18, transition: { duration: 0.25 } }}
                >
                  <motion.p
                    className="font-mono text-accent mb-3 text-[11px] tracking-[0.24em]"
                    initial={reduce ? false : { opacity: 0, x: -14 }}
                    animate={show ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
                  >
                    {current.code} — {current.name.toUpperCase()}
                  </motion.p>
                  <h1 className="font-display text-ink text-[clamp(3rem,9.5vw,8.5rem)] leading-[0.86] font-bold tracking-tight uppercase">
                    {current.headline.map((line, i) => (
                      <span key={line} className="mask-line">
                        <motion.span
                          initial={reduce ? false : { y: "112%" }}
                          animate={show ? { y: 0 } : {}}
                          transition={{ duration: 0.85, delay: 0.08 + i * 0.09, ease: EASE }}
                        >
                          {line}
                        </motion.span>
                      </span>
                    ))}
                  </h1>
                  <motion.p
                    className="text-soft mt-4 max-w-md text-sm sm:text-base"
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={show ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
                  >
                    {current.note}
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* instruments */}
            <motion.div
              className="hidden shrink-0 flex-col items-end gap-4 text-right md:flex md:pb-14"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
            >
              <div>
                <p className="sheet-label mb-1">CRANE HOOK ELEV</p>
                <p className="font-display text-ink text-4xl font-semibold tabular-nums">
                  <span ref={elevRef}>+0.0 M</span>
                </p>
              </div>
              <dl className="space-y-1.5">
                {hero.readouts.map((r) => (
                  <div key={r.label} className="flex items-baseline justify-end gap-3">
                    <dt className="font-mono text-faint text-[10px] tracking-[0.18em]">{r.label}</dt>
                    <dd className="font-mono text-soft text-[11px] tracking-[0.12em]">{r.value}</dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-end gap-3">
                  <dt className="font-mono text-faint text-[10px] tracking-[0.18em]">SPEC</dt>
                  <dd className="font-mono text-soft text-[11px] tracking-[0.12em]">{current.spec}</dd>
                </div>
              </dl>
            </motion.div>
          </div>

          {/* scroll hint */}
          {!reduce ? (
            <div
              ref={hintRef}
              className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
            >
              <motion.p
                className="font-mono text-soft text-[10px] tracking-[0.3em]"
                initial={{ opacity: 0 }}
                animate={show ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 1 }}
              >
                SCROLL TO BUILD
              </motion.p>
              <motion.div
                className="bg-line relative h-9 w-px overflow-hidden"
                initial={{ opacity: 0 }}
                animate={show ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                <motion.span
                  className="bg-accent absolute top-0 left-0 h-3 w-px"
                  animate={{ y: [-12, 40] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          ) : null}

          {/* phase rail */}
          <motion.div
            className="absolute top-1/2 right-5 hidden -translate-y-1/2 items-stretch gap-3 lg:flex"
            initial={reduce ? false : { opacity: 0, x: 16 }}
            animate={show ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
          >
            <div className="flex flex-col justify-between py-0.5 text-right">
              {hero.phases.map((ph, i) => (
                <span
                  key={ph.code}
                  className="font-mono text-[9px] tracking-[0.2em] transition-colors duration-300"
                  style={{ color: i <= phase ? "var(--accent)" : "var(--faint)" }}
                >
                  {ph.code}
                </span>
              ))}
            </div>
            <div className="bg-line relative w-px">
              <div
                ref={railRef}
                className="bg-accent absolute inset-x-0 top-0 h-full origin-top"
                style={{ transform: "scaleY(0)" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
