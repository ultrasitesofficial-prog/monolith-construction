"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Moon, Plus, RotateCcw, Sun, X } from "lucide-react";
import { projects, statusMeta, type Project } from "@/config/projects.config";
import { siteConfig } from "@/config/site.config";

const CityScene = dynamic(
  () => import("@/components/three/city-scene").then((m) => m.CityScene),
  { ssr: false },
);

const EASE = [0.23, 1, 0.32, 1] as const;
const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

const STATUS_DOT: Record<Project["status"], string> = {
  "in-design": "#5b8dff",
  "under-construction": "#ff5a1f",
  delivered: "#ffb466",
};

/**
 * The interactive district: WebGL city + DOM instruments + project dossier.
 * Drag orbits (pointer capture, momentum-damped in the rig), buttons zoom,
 * night toggle relights the whole model. Selecting a plot flies the camera
 * in and slides the dossier over — the "walk into the building" moment.
 */
export function DistrictExplorer({
  initialProjectId,
  selectRequest,
}: {
  initialProjectId?: string;
  /** Imperative select-from-outside (e.g. the project index list). */
  selectRequest?: { id: string; at: number } | null;
}) {
  const reduce = useReducedMotion() ?? false;
  const [selectedId, setSelectedId] = useState<string | null>(initialProjectId ?? null);
  const [night, setNight] = useState(true);
  const [active, setActive] = useState(true);
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [webgl, setWebgl] = useState(true);

  const frame = useRef<HTMLDivElement>(null);
  const orbitRef = useRef(0);
  const zoomRef = useRef(1);
  const dragging = useRef<{ startX: number; startOrbit: number } | null>(null);

  useEffect(() => {
    const lean = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    setQuality(lean ? "low" : "high");
    try {
      const canvas = document.createElement("canvas");
      if (!canvas.getContext("webgl2") && !canvas.getContext("webgl")) setWebgl(false);
    } catch {
      setWebgl(false);
    }
  }, []);

  /* Freeze the GL loop offscreen. */
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e?.isIntersecting ?? false), {
      rootMargin: "60px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* External selection requests (project index cards). */
  useEffect(() => {
    if (selectRequest?.id) setSelectedId(selectRequest.id);
  }, [selectRequest]);

  /* Close dossier on Escape. */
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = { startX: e.clientX, startOrbit: orbitRef.current };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* pointer already released (pen lift, synthetic events) — drag still works */
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.startX;
    orbitRef.current = dragging.current.startOrbit + dx * 0.005;
  };
  const onPointerUp = () => {
    dragging.current = null;
  };

  const selected = selectedId ? projects.find((p) => p.id === selectedId) : undefined;

  return (
    <div className="relative">
      <div
        ref={frame}
        data-cursor="drag"
        className="border-line bg-surface relative h-[72svh] min-h-[480px] touch-pan-y overflow-hidden border select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="application"
        aria-label="Interactive project district map. Drag to orbit, select a plot to open its dossier."
      >
        {webgl ? (
          <CityScene
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
            night={night}
            active={active && !reduce}
            quality={quality}
            orbitRef={orbitRef}
            zoomRef={zoomRef}
          />
        ) : (
          <div className="grid-paper flex h-full items-center justify-center">
            <p className="text-soft max-w-sm px-6 text-center text-sm">
              The interactive district needs WebGL. The full project index is listed below.
            </p>
          </div>
        )}

        {/* corner registration marks */}
        <div className="reg-mark absolute top-3 left-3" aria-hidden />
        <div className="reg-mark absolute top-3 right-3" aria-hidden />
        <div className="reg-mark absolute bottom-3 left-3" aria-hidden />

        {/* legend */}
        <div className="glass pointer-events-none absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-4 px-4 py-2 sm:left-4 sm:translate-x-0">
          {(Object.keys(statusMeta) as Project["status"][]).map((s) => (
            <span key={s} className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.16em] whitespace-nowrap text-soft">
              <span className="inline-block size-1.5" style={{ background: STATUS_DOT[s] }} />
              {statusMeta[s].label.toUpperCase()}
            </span>
          ))}
        </div>

        {/* instruments */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-px">
          {siteConfig.features?.nightMode ? (
            <button
              type="button"
              onClick={() => setNight((v) => !v)}
              className="glass hover:border-accent flex size-10 items-center justify-center transition-colors"
              aria-label={night ? "Switch to day lighting" : "Switch to night lighting"}
              aria-pressed={night}
            >
              {night ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => (zoomRef.current = Math.max(0.55, zoomRef.current - 0.18))}
            className="glass hover:border-accent flex size-10 items-center justify-center transition-colors"
            aria-label="Zoom in"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => (zoomRef.current = Math.min(1.4, zoomRef.current + 0.18))}
            className="glass hover:border-accent flex size-10 items-center justify-center transition-colors"
            aria-label="Zoom out"
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              orbitRef.current = 0;
              zoomRef.current = 1;
              setSelectedId(null);
            }}
            className="glass hover:border-accent flex size-10 items-center justify-center transition-colors"
            aria-label="Reset view"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>

        <p className="sheet-label pointer-events-none absolute bottom-4 left-4 hidden sm:block">
          DRAG TO ORBIT — SELECT A PLOT TO ENTER
        </p>

        {/* ————— dossier ————— */}
        <AnimatePresence>
          {selected ? (
            <motion.aside
              key={selected.id}
              className="glass absolute inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto"
              initial={reduce ? { opacity: 0 } : { x: "104%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "104%", transition: { duration: 0.3, ease: EASE_DRAWER } }}
              transition={{ duration: 0.55, ease: EASE_DRAWER }}
              aria-label={`${selected.name} project dossier`}
            >
              <div className="flex items-start justify-between p-5 sm:p-6">
                <div>
                  <p className="sheet-label mb-2">
                    DOSSIER — {statusMeta[selected.status].label.toUpperCase()}
                  </p>
                  <h3 className="font-display text-ink text-4xl leading-none font-bold tracking-tight uppercase">
                    {selected.name}
                  </h3>
                  <p className="text-soft mt-2 text-sm">
                    {selected.sector} · {selected.city} · {selected.year}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Close dossier"
                  className="border-line hover:border-accent bg-bg/40 flex size-9 shrink-0 items-center justify-center border transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {selected.image ? (
                <div className="border-line relative mx-5 h-44 overflow-hidden border sm:mx-6">
                  <Image
                    src={selected.image}
                    alt={`${selected.name} — ${selected.sector}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 420px"
                    className="object-cover"
                  />
                </div>
              ) : null}

              <div className="space-y-6 p-5 sm:p-6">
                {/* progress */}
                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <p className="sheet-label">CONSTRUCTION PROGRESS</p>
                    <p className="font-mono text-accent text-sm tabular-nums">
                      {Math.round(selected.progress * 100)}%
                    </p>
                  </div>
                  <div className="bg-raised h-1.5 w-full overflow-hidden">
                    <motion.div
                      className="bg-accent h-full origin-left"
                      initial={reduce ? { scaleX: selected.progress } : { scaleX: 0 }}
                      animate={{ scaleX: selected.progress }}
                      transition={{ duration: 1, delay: 0.35, ease: EASE }}
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <p className="text-soft text-sm leading-relaxed">{selected.summary}</p>

                {/* facts */}
                <dl className="border-line grid grid-cols-2 border-t">
                  {selected.facts.map((f) => (
                    <div key={f.label} className="border-line border-b py-2.5 pr-3 odd:border-r odd:pr-4 even:pl-4">
                      <dt className="font-mono text-faint text-[9px] tracking-[0.18em] uppercase">{f.label}</dt>
                      <dd className="text-ink mt-0.5 text-sm font-medium">{f.value}</dd>
                    </div>
                  ))}
                </dl>

                {/* phases */}
                <div>
                  <p className="sheet-label mb-3">PHASE RECORD</p>
                  <ul className="space-y-2">
                    {selected.phases.map((ph) => (
                      <li key={ph.code} className="flex items-center gap-3 text-sm">
                        <span
                          className="inline-block size-2 shrink-0"
                          style={{
                            background:
                              ph.status === "done"
                                ? "var(--accent)"
                                : ph.status === "active"
                                  ? "transparent"
                                  : "var(--raised)",
                            border: ph.status === "active" ? "1px solid var(--accent)" : "none",
                            animation: ph.status === "active" ? "pulse 1.6s ease-in-out infinite" : undefined,
                          }}
                        />
                        <span className="font-mono text-faint text-[10px] tracking-[0.14em]">{ph.code}</span>
                        <span className={ph.status === "planned" ? "text-faint" : "text-soft"}>{ph.name}</span>
                        {ph.status === "active" ? (
                          <span className="font-mono text-accent ml-auto text-[9px] tracking-[0.2em]">LIVE</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/contact" className="btn-plate press w-full justify-center">
                  <span>Discuss a project like this</span>
                </Link>
              </div>
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
