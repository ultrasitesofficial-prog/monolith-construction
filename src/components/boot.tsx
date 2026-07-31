"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { siteConfig } from "@/config/site.config";

/**
 * First-visit boot: the site "mobilizes" — a percentage climbs like a crane
 * load reading while pre-pour checks stamp in, then the gate lifts.
 *
 * Coordination notes:
 * - Repeat visits are hidden BEFORE first paint by an inline script in the
 *   layout <head> that sets `data-booted` from sessionStorage (matching CSS
 *   rule in globals.css) — no overlay flash either way.
 * - The hero holds its entrance choreography until `useBootDone()` is true.
 */

const BOOT_KEY = "monolith-boot";
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

const CHECKS = [
  "SURVEY CONTROL",
  "CRANE PERMIT",
  "CREWS ROSTERED",
  "CONCRETE BOOKED",
] as const;

const BootContext = createContext(true);

export function useBootDone() {
  return useContext(BootContext);
}

export function BootProvider({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(BOOT_KEY) === "1";
    } catch {
      /* storage blocked — treat as first visit */
    }

    if (seen || reduce) {
      finish();
      return;
    }

    // Load percentage with tiny plateaus — machines pause, then surge.
    const start = performance.now();
    const DURATION = 1700;
    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const stall = Math.sin(t * 19) * 0.02;
      setProgress(Math.min(Math.round((eased + stall) * 100), 100));
      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setTimeout(() => setExiting(true), 220);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const finish = () => {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      /* storage blocked — boot simply replays next load */
    }
    document.documentElement.dataset.booted = "1";
    setShowOverlay(false);
    setDone(true);
  };

  const word = siteConfig.business.logo.text ?? siteConfig.business.name.toUpperCase();
  const checksVisible = Math.floor((progress / 100) * CHECKS.length);

  return (
    <BootContext.Provider value={done}>
      <AnimatePresence>
        {showOverlay ? (
          <motion.div
            id="boot-loader"
            aria-hidden
            className="bg-bg fixed inset-0 z-[130] overflow-hidden"
            initial={false}
            animate={
              exiting
                ? { clipPath: "inset(0 0 100% 0)", transition: { duration: 0.65, ease: EASE_IN_OUT } }
                : { clipPath: "inset(0 0 0% 0)" }
            }
            onAnimationComplete={() => {
              if (exiting) finish();
            }}
          >
            <div className="grid-paper absolute inset-0 opacity-40" />
            <motion.div
              className="relative flex h-full flex-col justify-between p-6 sm:p-10"
              animate={exiting ? { y: -30, opacity: 0 } : { y: 0, opacity: 1 }}
              transition={{ duration: 0.35, ease: EASE_IN_OUT }}
            >
              <div className="flex items-start justify-between">
                <p className="sheet-label">
                  {word} <b>■</b> CONSTRUCTION GROUP
                </p>
                <p className="sheet-label hidden sm:block">SHEET S.00 — MOBILIZATION</p>
              </div>

              <div className="flex items-end justify-between gap-8">
                <div>
                  <ul className="font-mono text-faint mb-6 space-y-1.5 text-[11px] tracking-[0.18em]">
                    {CHECKS.map((check, i) => (
                      <li
                        key={check}
                        className="flex items-center gap-3"
                        style={{
                          opacity: i < checksVisible ? 1 : 0.25,
                          transition: "opacity 0.3s",
                        }}
                      >
                        <span>{check}</span>
                        <span className="text-accent">{i < checksVisible ? "— OK" : ""}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="font-mono text-soft text-[11px] tracking-[0.22em]">
                    MOBILIZING SITE<span className="animate-blink">_</span>
                  </p>
                </div>
                <p
                  className="font-display text-ink text-[clamp(5rem,18vw,13rem)] leading-[0.82] font-semibold tracking-tight tabular-nums"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {progress}
                  <span className="text-accent">%</span>
                </p>
              </div>

              <div className="bg-line relative h-px w-full">
                <div
                  className="bg-accent absolute inset-y-0 left-0"
                  style={{ width: `${progress}%`, transition: "width 0.15s linear" }}
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {children}
    </BootContext.Provider>
  );
}
