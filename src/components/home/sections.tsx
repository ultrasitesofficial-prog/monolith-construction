"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { handover, reviews, stats, team } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";
import { Reveal, RevealLines } from "@/components/reveal";
import { DistrictExplorer } from "@/components/district/district-explorer";

/* ------------------------------ S.05 DISTRICT ------------------------------ */

export function DistrictSection() {
  return (
    <section
      id="district"
      data-sheet="S.05 — THE DISTRICT"
      aria-label="Featured projects district"
      className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <p className="sheet-label mb-4">
              S.05 — THE DISTRICT <b>■</b> LIVE MODEL
            </p>
          </Reveal>
          <RevealLines
            as="h2"
            lines={["EVERY PROJECT", "KEEPS ITS PLOT"]}
            className="font-display text-ink block text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.9] font-bold tracking-tight uppercase"
          />
        </div>
        <Reveal delay={0.15} className="max-w-sm">
          <p className="text-soft text-sm leading-relaxed">
            Our portfolio as a working district. Blue holograms are still on the
            drawing board, orange sites carry cranes, warm windows are keys we
            have already handed over. Enter any plot.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <DistrictExplorer />
      </Reveal>

      <div className="mt-6 flex justify-end">
        <Link href="/projects" className="link-draw font-mono text-ink text-[11px] tracking-[0.2em]">
          FULL PROJECT INDEX ↗
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------- S.07 LEDGER ------------------------------- */

function StatCell({ stat, index }: { stat: (typeof stats)[number]; index: number }) {
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const cell = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = numRef.current;
    if (!el) return;
    const decimals = Number.isInteger(stat.value) ? 0 : 1;
    if (reduce) {
      el.textContent = stat.value.toFixed(decimals);
      if (barRef.current) barRef.current.style.transform = "scaleY(1)";
      return;
    }
    const counter = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        v: stat.value,
        duration: 1.6,
        delay: index * 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: cell.current, start: "top 82%", once: true },
        onUpdate: () => {
          el.textContent = counter.v.toFixed(decimals);
        },
      });
      gsap.fromTo(
        barRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.4,
          delay: index * 0.12,
          ease: "power3.inOut",
          scrollTrigger: { trigger: cell.current, start: "top 82%", once: true },
        },
      );
    }, cell);
    return () => ctx.revert();
  }, [stat.value, index]);

  return (
    <div ref={cell} className="border-line relative border-t py-8 pr-6 pl-5">
      {/* concrete pour */}
      <div
        ref={barRef}
        className="absolute top-0 bottom-0 left-0 w-[3px] origin-bottom"
        style={{
          background:
            "repeating-linear-gradient(0deg, var(--accent) 0 6px, color-mix(in srgb, var(--accent) 55%, transparent) 6px 10px)",
          transform: "scaleY(0)",
        }}
        aria-hidden
      />
      <p className="font-display text-ink text-[clamp(3rem,5.5vw,5rem)] leading-none font-bold tabular-nums">
        {stat.prefix}
        <span ref={numRef}>0</span>
        <span className="text-accent text-[0.55em] font-semibold">{stat.suffix}</span>
      </p>
      <p className="text-soft mt-3 max-w-[22ch] text-sm leading-snug">{stat.label}</p>
    </div>
  );
}

export function Ledger() {
  return (
    <section
      data-sheet="S.07 — THE LEDGER"
      aria-label="Company statistics"
      className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8"
    >
      <Reveal>
        <p className="sheet-label mb-10">
          S.07 — THE LEDGER <b>■</b> AS-BUILT NUMBERS
        </p>
      </Reveal>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s, i) => (
          <StatCell key={s.id} stat={s} index={i} />
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- S.08 CREW -------------------------------- */

function CrewCard({ member, index }: { member: (typeof team)[number]; index: number }) {
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 160, damping: 18 });
  const ry = useSpring(0, { stiffness: 160, damping: 18 });

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -10);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Reveal delay={(index % 3) * 0.08}>
      <motion.article
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 900 }}
        className="group border-line bg-surface/60 relative overflow-hidden border backdrop-blur-sm"
      >
        {/* shine sweep */}
        <div
          className="pointer-events-none absolute inset-0 z-10 -translate-x-[130%] transition-transform duration-700 ease-out group-hover:translate-x-[130%]"
          style={{
            background:
              "linear-gradient(105deg, transparent 42%, rgba(237,238,239,0.07) 50%, transparent 58%)",
          }}
          aria-hidden
        />
        <div className="bg-raised relative aspect-[4/5] overflow-hidden">
          {/* monogram bedrock — always present under the photo */}
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="outline-text font-display text-8xl font-bold">{initials}</span>
          </div>
          {member.image ? (
            <Image
              src={member.image}
              alt={member.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover grayscale transition duration-700 group-hover:scale-[1.04] group-hover:grayscale-0"
            />
          ) : null}
          <div className="from-bg/85 absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent" />
          <p className="font-mono text-faint absolute top-3 right-3 text-[9px] tracking-[0.2em]">
            CREW-{String(index + 1).padStart(2, "0")}
          </p>
        </div>
        <div className="relative p-5">
          <h3 className="font-display text-ink text-2xl font-semibold tracking-tight uppercase">
            {member.name}
          </h3>
          <p className="font-mono text-accent mt-1 text-[10px] tracking-[0.2em] uppercase">
            {member.role}
          </p>
          {/* bio unfolds on hover; touch devices see it inline */}
          <div className="grid [grid-template-rows:0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:[grid-template-rows:1fr] group-focus-within:[grid-template-rows:1fr] [@media(hover:none)]:[grid-template-rows:1fr]">
            <div className="overflow-hidden">
              <p className="text-soft pt-3 text-sm leading-relaxed">{member.bio}</p>
            </div>
          </div>
        </div>
      </motion.article>
    </Reveal>
  );
}

export function Crew() {
  return (
    <section
      id="people"
      data-sheet="S.08 — THE CREW"
      aria-label="Leadership team"
      className="mx-auto max-w-[1600px] px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <p className="sheet-label mb-4">
              S.08 — THE CREW <b>■</b> SIGNATURES ON THE SHEET
            </p>
          </Reveal>
          <RevealLines
            as="h2"
            lines={["THE PEOPLE WHO", "SIGN THE DRAWINGS"]}
            className="font-display text-ink block text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.9] font-bold tracking-tight uppercase"
          />
        </div>
        <Reveal delay={0.15} className="max-w-sm">
          <p className="text-soft text-sm leading-relaxed">
            Directors who still carry site boots in the car. Every signature
            below has stood on the structures it approved.
          </p>
        </Reveal>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((m, i) => (
          <CrewCard key={m.id} member={m} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------- S.09 BOARDS ------------------------------- */

export function Boards() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sec = section.current;
    const tr = track.current;
    if (!sec || !tr) return;

    const ctx = gsap.context(() => {
      const amount = () => tr.scrollWidth - window.innerWidth;
      gsap.to(tr, {
        x: () => -amount(),
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: () => `+=${amount() * 1.15}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sec);

    // Boards lean as they drive past — like passing site hoarding.
    const boards = Array.from(sec.querySelectorAll<HTMLElement>("[data-board]"));
    const setters = boards.map((b) => gsap.quickSetter(b, "rotateY", "deg"));
    const lean = () => {
      const mid = window.innerWidth / 2;
      boards.forEach((b, i) => {
        const r = b.getBoundingClientRect();
        const off = clampLean((r.left + r.width / 2 - mid) / mid);
        setters[i]!(off * 7);
      });
    };
    gsap.ticker.add(lean);

    return () => {
      gsap.ticker.remove(lean);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={section}
      data-sheet="S.09 — SITE BOARDS"
      aria-label="Client testimonials"
      className="border-line relative overflow-hidden border-t motion-safe:h-svh"
    >
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 flex items-start justify-between px-5 pt-20 sm:px-8 sm:pt-24">
        <p className="sheet-label">
          S.09 — SITE BOARDS <b>■</b> WORDS FROM THE CLIENTS
        </p>
        <p className="sheet-label hidden sm:block">HOARDING LINE →</p>
      </div>

      <div
        ref={track}
        className="flex flex-col gap-10 px-5 pt-36 pb-16 [perspective:1200px] motion-safe:h-svh motion-safe:w-max motion-safe:flex-row motion-safe:items-center motion-safe:gap-[6vw] motion-safe:px-[12vw] motion-safe:pt-0 motion-safe:pb-0 sm:px-8"
      >
        {reviews.map((review, i) => (
          <figure
            key={review.id}
            data-board
            className="relative shrink-0 motion-safe:w-[min(72vw,760px)]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* scaffold legs */}
            <div className="absolute -bottom-12 left-[12%] hidden h-12 w-1 bg-[var(--raised)] motion-safe:block" aria-hidden />
            <div className="absolute right-[12%] -bottom-12 hidden h-12 w-1 bg-[var(--raised)] motion-safe:block" aria-hidden />

            <div className="border-line bg-surface relative border p-7 sm:p-10">
              <div className="hazard-strip absolute inset-x-0 top-0" aria-hidden />
              <p className="font-mono text-accent mb-5 text-[10px] tracking-[0.24em]">
                BOARD {String(i + 1).padStart(2, "0")} · {review.source?.toUpperCase()}
              </p>
              <blockquote className="font-display text-ink text-[clamp(1.5rem,2.6vw,2.4rem)] leading-[1.12] font-medium tracking-tight">
                “{review.text}”
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-4">
                <span className="bg-accent inline-block size-2" aria-hidden />
                <div>
                  <p className="text-ink text-sm font-semibold">{review.author}</p>
                  <p className="text-faint text-xs">{review.role}</p>
                </div>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* Clamp helper for the board lean. */
function clampLean(v: number) {
  return Math.max(-1, Math.min(1, v));
}

/* ------------------------------ S.10 HANDOVER ------------------------------ */

export function Handover() {
  const section = useRef<HTMLElement>(null);
  const facade = useRef<HTMLDivElement>(null);
  const doorL = useRef<HTMLDivElement>(null);
  const doorR = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  const COLS = 12;
  const ROWS = 7;

  useEffect(() => {
    const sec = section.current;
    if (!sec) return;
    const cells = facade.current?.querySelectorAll("[data-window]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      if (cells) gsap.set(cells, { opacity: 1 });
      gsap.set(doorL.current, { xPercent: -101 });
      gsap.set(doorR.current, { xPercent: 101 });
      gsap.set(inner.current, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
        },
      });
      if (cells) {
        tl.to(
          cells,
          {
            opacity: 1,
            duration: 1.1,
            stagger: { grid: [ROWS, COLS], from: "center", amount: 0.9 },
          },
          0,
        );
      }
      tl.to(doorL.current, { xPercent: -101, duration: 0.8, ease: "power2.inOut" }, 1.05);
      tl.to(doorR.current, { xPercent: 101, duration: 0.8, ease: "power2.inOut" }, 1.05);
      tl.fromTo(
        inner.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        1.35,
      );
      tl.to({}, { duration: 0.3 });
    }, sec);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={section}
      id="handover"
      data-sheet="S.10 — HANDOVER"
      aria-label="Start a project"
      className="relative motion-safe:h-[260svh]"
    >
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        {/* the finished facade, lighting up */}
        <div
          ref={facade}
          className="absolute inset-0 grid gap-1.5 p-4 opacity-90"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
          aria-hidden
        >
          {Array.from({ length: COLS * ROWS }, (_, i) => (
            <div
              key={i}
              data-window
              className="border-line/60 border opacity-0"
              style={{
                background:
                  (i * 31) % 5 === 0
                    ? "color-mix(in srgb, #ffb466 38%, transparent)"
                    : "color-mix(in srgb, #ffb466 14%, transparent)",
                boxShadow: (i * 31) % 5 === 0 ? "0 0 30px rgba(255,180,102,0.2)" : undefined,
              }}
            />
          ))}
        </div>
        <div className="from-bg/70 via-bg/40 to-bg/70 absolute inset-0 bg-gradient-to-b" aria-hidden />

        {/* the doors */}
        <div ref={doorL} className="bg-raised border-line absolute inset-y-0 left-0 z-10 w-1/2 border-r" aria-hidden>
          <div className="hazard-strip absolute top-1/2 right-0 w-[38%] -translate-y-1/2" />
        </div>
        <div ref={doorR} className="bg-raised border-line absolute inset-y-0 right-0 z-10 w-1/2 border-l" aria-hidden>
          <div className="hazard-strip absolute top-1/2 left-0 w-[38%] -translate-y-1/2" />
        </div>

        {/* the room inside */}
        <div ref={inner} className="relative z-20 px-5 text-center opacity-0">
          <p className="sheet-label mb-6">
            {handover.eyebrow} <b>■</b> DOORS OPEN
          </p>
          <h2 className="font-display text-ink text-[clamp(3rem,9vw,8rem)] leading-[0.88] font-bold tracking-tight uppercase">
            {handover.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="text-soft mx-auto mt-6 max-w-md text-base leading-relaxed">{handover.note}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="btn-plate press" data-cursor="enter">
              <span>{handover.cta}</span>
              <span aria-hidden>→</span>
            </Link>
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="link-draw font-mono text-soft hover:text-ink text-[12px] tracking-[0.18em]"
            >
              {siteConfig.contact.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
