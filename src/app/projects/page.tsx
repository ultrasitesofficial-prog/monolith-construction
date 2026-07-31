import type { Metadata } from "next";
import { ProjectsIndex } from "@/components/district/projects-index";
import { Reveal, RevealLines } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "The Monolith portfolio as a living district — towers, bridges, arenas, and districts across nine countries, from blueprint holograms to delivered landmarks.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-32 pb-24 sm:px-8 sm:pt-40">
      <div className="mb-12">
        <Reveal>
          <p className="sheet-label mb-4">
            INDEX — PROJECTS <b>■</b> NINE COUNTRIES
          </p>
        </Reveal>
        <RevealLines
          as="h1"
          lines={["THE WORK,", "PLOT BY PLOT"]}
          className="font-display text-ink block text-[clamp(3rem,8vw,7.5rem)] leading-[0.88] font-bold tracking-tight uppercase"
        />
        <Reveal delay={0.2} className="mt-6 max-w-xl">
          <p className="text-soft text-base leading-relaxed">
            Every project keeps a plot in the district model. Drag to orbit the
            quarter, switch the lights, and enter any building — or browse the
            flat index below if you prefer your portfolios in rows.
          </p>
        </Reveal>
      </div>

      <ProjectsIndex />
    </div>
  );
}
