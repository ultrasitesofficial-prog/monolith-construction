import type { Metadata } from "next";
import Link from "next/link";
import { timeline, values } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";
import { Reveal, RevealLines } from "@/components/reveal";
import { Crew } from "@/components/home/sections";

export const metadata: Metadata = {
  title: "The firm",
  description:
    "Fifty years of Monolith Construction Group — the values, the eras, and the people who sign the drawings.",
};

export default function AboutPage() {
  return (
    <>
      {/* ————— intro ————— */}
      <section className="mx-auto max-w-[1600px] px-5 pt-32 pb-20 sm:px-8 sm:pt-40">
        <Reveal>
          <p className="sheet-label mb-4">
            THE FIRM <b>■</b> EST. {siteConfig.business.foundedYear}
          </p>
        </Reveal>
        <RevealLines
          as="h1"
          lines={["A BUILDER,", "NOT A BRAND"]}
          className="font-display text-ink block text-[clamp(3rem,8vw,7.5rem)] leading-[0.88] font-bold tracking-tight uppercase"
        />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Reveal delay={0.15}>
            <p className="font-display text-soft text-2xl leading-snug font-medium sm:text-3xl">
              {siteConfig.business.description} The name on the hoarding changes
              with the client; the discipline behind it hasn&apos;t changed since
              two cranes and a rented rail yard in {siteConfig.business.foundedYear}.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="border-line space-y-4 border-l pl-6">
              <p className="text-soft text-sm leading-relaxed">
                We are engineers who stayed on site. Preconstruction, structures,
                facades, and delivery live under one roof, so a promise made in a
                boardroom survives contact with bedrock.
              </p>
              <p className="text-soft text-sm leading-relaxed">
                What follows isn&apos;t a manifesto. It&apos;s the four rules our
                superintendents can recite at 6 a.m. — and the eras that taught
                us each one.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ————— values ————— */}
      <section aria-label="Values" className="border-line border-t">
        <div className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8">
          <Reveal>
            <p className="sheet-label mb-10">
              FIELD RULES <b>■</b> POSTED AT EVERY GATE
            </p>
          </Reveal>
          <div className="grid gap-px sm:grid-cols-2" role="list">
            {values.map((value, i) => (
              <Reveal key={value.id} delay={(i % 2) * 0.1}>
                <article role="listitem" className="group border-line hover:bg-surface relative h-full border p-7 transition-colors duration-500 sm:p-9">
                  <div className="flex items-start justify-between">
                    <p className="font-mono text-accent text-[11px] tracking-[0.24em]">{value.code}</p>
                    <div className="reg-mark opacity-0 transition-opacity duration-500 group-hover:opacity-60" />
                  </div>
                  <h2 className="font-display text-ink mt-5 text-3xl font-semibold tracking-tight uppercase sm:text-4xl">
                    {value.name}
                  </h2>
                  <p className="text-soft mt-4 max-w-lg leading-relaxed">{value.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ————— chronicle, vertical ————— */}
      <section aria-label="History" className="border-line border-t">
        <div className="mx-auto max-w-[1600px] px-5 py-20 sm:px-8">
          <Reveal>
            <p className="sheet-label mb-12">
              THE ERAS <b>■</b> {siteConfig.business.foundedYear} → {new Date().getFullYear()}
            </p>
          </Reveal>
          <ol className="relative space-y-0">
            {timeline.map((event, i) => (
              <Reveal key={event.id} delay={0.05}>
                <li className="border-line grid gap-4 border-t py-8 sm:grid-cols-[180px_1fr] sm:gap-10">
                  <p className="outline-text font-display text-5xl leading-none font-bold sm:text-6xl">
                    {event.year}
                  </p>
                  <div>
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-accent text-[10px] tracking-[0.2em]">
                        ERA {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-display text-ink text-2xl font-semibold tracking-tight uppercase">
                        {event.title}
                      </h3>
                    </div>
                    <p className="text-soft mt-2 max-w-2xl leading-relaxed">{event.description}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ————— the crew ————— */}
      <div className="border-line border-t">
        <Crew />
      </div>

      {/* ————— CTA band ————— */}
      <section className="border-line border-t">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-8 px-5 py-16 sm:px-8">
          <Reveal>
            <p className="font-display text-ink text-3xl font-semibold tracking-tight uppercase sm:text-4xl">
              Put a director on your project
              <span className="text-accent">.</span>
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/contact" className="btn-plate press" data-cursor="enter">
              <span>Start a project</span>
              <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
