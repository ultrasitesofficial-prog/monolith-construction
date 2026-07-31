"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { methodPhases } from "@/config/content.config";

/**
 * S.06 — METHOD. The delivery method as a technical section drawing that
 * draws itself: the site pins while eight phases ink themselves in —
 * boundary survey, shored pit, piles and mat, steel frame, climbing core,
 * envelope hatching, interior fit-out, and the handover stamp.
 *
 * Strokes use pathLength=1 so every element draws with the same dash math.
 */
export function Method() {
  const section = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const svg = svgRef.current;
    const sec = section.current;
    if (!svg || !sec) return;

    const strokes = (p: string) => svg.querySelectorAll<SVGElement>(`[data-p="${p}"] [data-draw]`);
    const fills = (p: string) => svg.querySelectorAll<SVGElement>(`[data-p="${p}"] [data-fill]`);
    const pops = (p: string) => svg.querySelectorAll<SVGElement>(`[data-p="${p}"] [data-pop]`);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Present the finished drawing, no choreography.
      for (let i = 1; i <= 8; i++) {
        gsap.set(strokes(`p${i}`), { strokeDashoffset: 0 });
        gsap.set(fills(`p${i}`), { opacity: 1 });
        gsap.set(pops(`p${i}`), { scale: 1, opacity: 1 });
      }
      setPhase(7);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            const idx = Math.min(Math.floor(self.progress * 8), 7);
            if (idx !== phaseRef.current) {
              phaseRef.current = idx;
              setPhase(idx);
            }
          },
        },
      });

      for (let i = 1; i <= 8; i++) {
        const p = `p${i}`;
        const at = i - 1;
        if (strokes(p).length) {
          tl.to(strokes(p), { strokeDashoffset: 0, duration: 0.62, stagger: 0.05 }, at + 0.08);
        }
        if (fills(p).length) {
          tl.to(fills(p), { opacity: 1, duration: 0.4, stagger: 0.06 }, at + 0.4);
        }
        if (pops(p).length) {
          tl.to(
            pops(p),
            { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.05 },
            at + 0.55,
          );
        }
      }
      // A breath at the end so the stamp lands before unpinning.
      tl.to({}, { duration: 0.4 });
    }, sec);

    return () => ctx.revert();
  }, []);

  const draw = { strokeDasharray: 1, strokeDashoffset: 1 } as React.CSSProperties;
  const current = methodPhases[phase]!;

  return (
    <section
      ref={section}
      id="method"
      data-sheet="S.06 — METHOD"
      aria-label="Delivery method"
      className="relative motion-safe:h-[520svh]"
    >
      <div className="sticky top-0 flex min-h-svh flex-col justify-center overflow-hidden py-20">
        <div className="mx-auto grid w-full max-w-[1600px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.15fr]">
          {/* narration */}
          <div>
            <p className="sheet-label mb-6">
              S.06 — METHOD <b>■</b> EIGHT PHASES, ONE SIGNATURE
            </p>
            <h2 className="font-display text-ink mb-10 text-[clamp(2.4rem,4.5vw,4.2rem)] leading-[0.92] font-bold tracking-tight uppercase">
              How a promise
              <br />
              becomes a building
            </h2>

            <ol className="space-y-1">
              {methodPhases.map((ph, i) => {
                const active = i === phase;
                const done = i < phase;
                return (
                  <li
                    key={ph.code}
                    className="border-line grid grid-cols-[auto_1fr] items-baseline gap-4 border-l-2 py-2 pl-4 transition-colors duration-300"
                    style={{
                      borderLeftColor: active ? "var(--accent)" : done ? "var(--faint)" : "var(--line)",
                    }}
                    aria-current={active ? "step" : undefined}
                  >
                    <span
                      className="font-mono text-[10px] tracking-[0.2em] transition-colors duration-300"
                      style={{ color: active ? "var(--accent)" : "var(--faint)" }}
                    >
                      {ph.code}
                    </span>
                    <div>
                      <p
                        className="font-display text-lg font-semibold tracking-wide uppercase transition-colors duration-300"
                        style={{ color: active || done ? "var(--ink)" : "var(--faint)" }}
                      >
                        {ph.name}
                      </p>
                      <div
                        className="grid transition-[grid-template-rows,opacity] duration-500"
                        style={{
                          gridTemplateRows: active ? "1fr" : "0fr",
                          opacity: active ? 1 : 0,
                        }}
                      >
                        <div className="overflow-hidden">
                          <p className="text-soft pt-1 pb-1 text-sm leading-relaxed">{ph.description}</p>
                          <p className="font-mono text-faint pb-1 text-[10px] tracking-[0.16em]">{ph.spec}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* the drawing */}
          <div className="border-line bg-surface relative border p-4 sm:p-6" aria-hidden>
            <div className="mb-3 flex items-center justify-between">
              <p className="sheet-label">SECTION A–A · NTS</p>
              <p className="font-mono text-accent text-[10px] tracking-[0.2em]">{current.code}</p>
            </div>
            <svg
              ref={svgRef}
              viewBox="0 0 520 460"
              className="mx-auto h-auto max-h-[58svh] w-full"
              fill="none"
              strokeLinecap="square"
            >
              {/* ground line */}
              <line x1="16" y1="300" x2="504" y2="300" stroke="var(--soft)" strokeWidth="1.5" />

              {/* P1 — survey boundary + benchmark */}
              <g data-p="p1" stroke="var(--blueprint)" strokeWidth="1">
                <rect data-draw pathLength={1} style={draw} x="120" y="60" width="280" height="240" strokeDasharray="4 4" />
                <line data-draw pathLength={1} style={draw} x1="120" y1="40" x2="400" y2="40" />
                <line data-draw pathLength={1} style={draw} x1="120" y1="34" x2="120" y2="46" />
                <line data-draw pathLength={1} style={draw} x1="400" y1="34" x2="400" y2="46" />
                <circle data-pop cx="90" cy="300" r="6" style={{ opacity: 0, scale: 0, transformOrigin: "90px 300px" }} />
                <path data-pop d="M90 294 L90 306 M84 300 L96 300" style={{ opacity: 0, scale: 0, transformOrigin: "90px 300px" }} />
              </g>

              {/* P2 — shored excavation */}
              <g data-p="p2" stroke="var(--concrete)" strokeWidth="1.4">
                <path data-draw pathLength={1} style={draw} d="M150 300 L158 392 L362 392 L370 300" />
                <line data-draw pathLength={1} style={draw} x1="158" y1="316" x2="146" y2="308" />
                <line data-draw pathLength={1} style={draw} x1="160" y1="344" x2="148" y2="336" />
                <line data-draw pathLength={1} style={draw} x1="360" y1="316" x2="372" y2="308" />
                <line data-draw pathLength={1} style={draw} x1="358" y1="344" x2="370" y2="336" />
                <rect data-fill x="158" y="380" width="204" height="12" fill="#1c1f24" stroke="none" opacity="0" />
              </g>

              {/* P3 — piles + mat */}
              <g data-p="p3" stroke="var(--concrete)" strokeWidth="2">
                {[190, 236, 282, 328].map((x) => (
                  <line key={x} data-draw pathLength={1} style={draw} x1={x} y1="392" x2={x} y2="446" />
                ))}
                <rect data-fill x="158" y="372" width="204" height="20" fill="#3a3e45" stroke="none" opacity="0" />
              </g>

              {/* P4 — steel frame */}
              <g data-p="p4" stroke="var(--ink)" strokeWidth="1.6">
                {[200, 260, 320].map((x) => (
                  <line key={x} data-draw pathLength={1} style={{ ...draw }} x1={x} y1="372" x2={x} y2="96" />
                ))}
                {[96, 142, 188, 234, 280, 326].map((y) => (
                  <line key={y} data-draw pathLength={1} style={draw} x1="182" y1={y} x2="338" y2={y} stroke="var(--accent)" strokeWidth="1.3" />
                ))}
              </g>

              {/* P5 — core + slabs */}
              <g data-p="p5">
                <rect data-fill x="250" y="96" width="20" height="276" fill="#4a4e55" stroke="none" opacity="0" />
                {[96, 142, 188, 234, 280, 326].map((y) => (
                  <rect key={y} data-fill x="182" y={y - 3} width="156" height="5" fill="#5a5e66" stroke="none" opacity="0" />
                ))}
              </g>

              {/* P6 — envelope hatch */}
              <g data-p="p6" stroke="var(--blueprint)" strokeWidth="1">
                <rect data-draw pathLength={1} style={draw} x="176" y="90" width="168" height="282" strokeWidth="1.6" />
                {[110, 150, 190, 230, 270, 310, 350].map((y) => (
                  <line key={y} data-draw pathLength={1} style={draw} x1="180" y1={y + 14} x2="200" y2={y - 6} opacity="0.7" />
                ))}
                {[110, 150, 190, 230, 270, 310, 350].map((y) => (
                  <line key={`r${y}`} data-draw pathLength={1} style={draw} x1="320" y1={y + 14} x2="340" y2={y - 6} opacity="0.7" />
                ))}
              </g>

              {/* P7 — interiors wake up */}
              <g data-p="p7">
                <path
                  data-draw
                  pathLength={1}
                  style={draw}
                  stroke="var(--soft)"
                  strokeWidth="1.2"
                  d="M254 372 L266 358 L254 344 L266 330 L254 316 L266 302 L254 288 L266 274 L254 260 L266 246 L254 232 L266 218 L254 204 L266 190 L254 176 L266 162 L254 148 L266 134 L254 120 L266 106"
                />
                {[
                  [188, 148], [300, 194], [214, 240], [326, 286], [188, 332], [300, 102],
                ].map(([x, y], i) => (
                  <rect key={i} data-fill x={x} y={y} width="26" height="14" fill="var(--accent)" opacity="0" stroke="none" />
                ))}
              </g>

              {/* P8 — handover stamp + beacon */}
              <g data-p="p8">
                <line data-draw pathLength={1} style={draw} x1="260" y1="90" x2="260" y2="62" stroke="var(--ink)" strokeWidth="1.6" />
                <circle data-pop cx="260" cy="56" r="5" fill="var(--accent)" style={{ opacity: 0, scale: 0, transformOrigin: "260px 56px" }} />
                <g
                  data-pop
                  style={{ opacity: 0, scale: 0, transformOrigin: "430px 120px", rotate: "-8deg" }}
                >
                  <rect x="376" y="96" width="110" height="48" stroke="var(--accent)" strokeWidth="2" />
                  <text
                    x="431"
                    y="126"
                    textAnchor="middle"
                    fill="var(--accent)"
                    style={{ font: "600 15px var(--font-plex-mono), monospace", letterSpacing: "0.12em" }}
                  >
                    DELIVERED
                  </text>
                </g>
              </g>
            </svg>

            <div className="mt-3 flex items-center justify-between">
              <p className="font-mono text-faint text-[10px] tracking-[0.18em]">
                DWG M-100 · PHASES P-01 → P-08
              </p>
              <div className="flex gap-1" role="presentation">
                {methodPhases.map((ph, i) => (
                  <span
                    key={ph.code}
                    className="h-1 w-5 transition-colors duration-300"
                    style={{ background: i <= phase ? "var(--accent)" : "var(--raised)" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
