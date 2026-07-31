"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { timeline } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";

/**
 * S.03 — THE FIRM. Fifty years as a horizontal drive past the eras: the
 * section pins and the decades slide by, each era raising its own little
 * skyline of blocks as it arrives. Reduced motion reads it as a clean
 * vertical chronicle.
 */
export function Chronicle() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sec = section.current;
    const tr = track.current;
    if (!sec || !tr) return;

    const ctx = gsap.context(() => {
      const amount = () => tr.scrollWidth - window.innerWidth;
      const drive = gsap.to(tr, {
        x: () => -amount(),
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: () => `+=${amount()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Each era's skyline rises as its card drives into view.
      gsap.utils.toArray<HTMLElement>("[data-era]").forEach((card) => {
        const blocks = card.querySelectorAll("[data-block]");
        gsap.from(blocks, {
          scaleY: 0,
          transformOrigin: "bottom center",
          stagger: 0.06,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            containerAnimation: drive,
            start: "left 78%",
          },
        });
        gsap.from(card.querySelectorAll("[data-rise]"), {
          y: 34,
          opacity: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            containerAnimation: drive,
            start: "left 72%",
          },
        });
      });
    }, sec);

    return () => ctx.revert();
  }, []);

  /* Deterministic little skyline per era — grows denser through the years. */
  const skyline = (idx: number) =>
    Array.from({ length: 7 }, (_, b) => {
      const h = 12 + ((b * 37 + idx * 53) % 46) + idx * 9;
      const lit = (b + idx) % 3 === 0;
      return { h: Math.min(h, 104), lit };
    });

  return (
    <section
      ref={section}
      data-sheet="S.03 — THE FIRM"
      aria-label="Company history"
      className="relative overflow-hidden motion-safe:h-svh"
    >
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 flex items-start justify-between px-5 pt-20 sm:px-8 sm:pt-24">
        <p className="sheet-label">
          S.03 — THE FIRM <b>■</b> {siteConfig.business.foundedYear}–{new Date().getFullYear()}
        </p>
        <p className="sheet-label hidden sm:block">DRIVE EAST →</p>
      </div>

      <div
        ref={track}
        className="flex h-full flex-col gap-14 px-5 pt-36 pb-14 motion-safe:h-svh motion-safe:w-max motion-safe:flex-row motion-safe:items-stretch motion-safe:gap-0 motion-safe:px-[8vw] motion-safe:pt-0 motion-safe:pb-0 sm:px-8"
      >
        {/* opening slab */}
        <div className="flex shrink-0 flex-col justify-center pr-6 motion-safe:w-[46vw] motion-safe:min-w-[380px] motion-safe:pr-[7vw]">
          <h2 className="font-display text-ink text-[clamp(2.8rem,6.5vw,6rem)] leading-[0.9] font-bold tracking-tight uppercase">
            Fifty years,
            <br />
            <span className="text-accent">one habit:</span>
            <br />
            finishing.
          </h2>
          <p className="text-soft mt-6 max-w-sm text-base leading-relaxed">
            From two rented cranes to nine countries of active sites — the
            company grew the only way a builder should: one honest handover at
            a time.
          </p>
        </div>

        {timeline.map((event, i) => (
          <article
            key={event.id}
            data-era
            className="border-line relative flex shrink-0 flex-col justify-between border-t pt-8 motion-safe:w-[38vw] motion-safe:min-w-[330px] motion-safe:border-t-0 motion-safe:border-l motion-safe:px-[3vw] motion-safe:py-[14vh]"
          >
            <div>
              <p data-rise className="font-mono text-accent text-[11px] tracking-[0.24em]">
                ERA {String(i + 1).padStart(2, "0")}
              </p>
              <p
                data-rise
                className="outline-text font-display mt-3 text-[clamp(4rem,7vw,7.5rem)] leading-none font-bold"
              >
                {event.year}
              </p>
              <h3 data-rise className="font-display text-ink mt-4 text-3xl font-semibold tracking-tight uppercase">
                {event.title}
              </h3>
              <p data-rise className="text-soft mt-3 max-w-xs text-sm leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* the era's skyline */}
            <div className="mt-10 flex h-28 items-end gap-1.5" aria-hidden>
              {skyline(i).map((b, k) => (
                <div
                  key={k}
                  data-block
                  className="w-5"
                  style={{
                    height: `${b.h}px`,
                    background: b.lit ? "var(--accent)" : "var(--raised)",
                    opacity: b.lit ? 0.9 : 1,
                  }}
                />
              ))}
            </div>
          </article>
        ))}

        {/* closing slab */}
        <div className="flex shrink-0 items-center motion-safe:w-[36vw] motion-safe:min-w-[300px] motion-safe:px-[4vw]">
          <div>
            <p className="sheet-label mb-4">NEXT ERA</p>
            <p className="font-display text-ink text-4xl leading-tight font-semibold uppercase">
              The tallest thing
              <br />
              we&apos;ve promised
              <br />
              <span className="text-accent">is on schedule.</span>
            </p>
            <Link href="/projects" className="btn-plate press mt-8">
              <span>See the projects</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
