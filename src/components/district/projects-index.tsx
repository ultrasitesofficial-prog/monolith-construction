"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { projects, statusMeta, type Project } from "@/config/projects.config";
import { DistrictExplorer } from "./district-explorer";
import { Reveal } from "@/components/reveal";
import { RevealImage } from "@/components/reveal";

const STATUS_DOT: Record<Project["status"], string> = {
  "in-design": "#5b8dff",
  "under-construction": "#ff5a1f",
  delivered: "#ffb466",
};

/**
 * /projects — the district up top, the flat index underneath. Opening a card
 * scrolls back to the model and flies the camera into that plot: the index
 * and the district are two views of the same portfolio.
 */
export function ProjectsIndex() {
  const mapAnchor = useRef<HTMLDivElement>(null);
  const [request, setRequest] = useState<{ id: string; at: number } | null>(null);
  const [filter, setFilter] = useState<Project["status"] | "all">("all");

  const openInDistrict = (id: string) => {
    setRequest({ id, at: Date.now() });
    mapAnchor.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const list = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <>
      <div ref={mapAnchor} className="scroll-mt-24">
        <Reveal>
          <DistrictExplorer selectRequest={request} />
        </Reveal>
      </div>

      {/* filter rail */}
      <div className="mt-16 mb-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filter projects by status">
        {(["all", "under-construction", "delivered", "in-design"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`border px-4 py-2 font-mono text-[10px] tracking-[0.18em] uppercase transition-colors duration-300 ${
              filter === f
                ? "border-accent text-ink bg-raised"
                : "border-line text-faint hover:text-soft"
            }`}
          >
            {f === "all" ? "All plots" : statusMeta[f].label}
            <span className="text-accent ml-2">
              {f === "all" ? projects.length : projects.filter((p) => p.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* index */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" role="list">
        {list.map((project, i) => (
          <Reveal key={project.id} delay={(i % 3) * 0.07} className="min-w-0">
            <article role="listitem" className="group border-line bg-surface flex h-full flex-col border">
              <div className="relative">
                {project.image ? (
                  <RevealImage className="bg-raised relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={project.image}
                      alt={`${project.name} — ${project.sector}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                  </RevealImage>
                ) : (
                  <div className="bg-raised aspect-[16/10]" />
                )}
                <div className="glass absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1.5">
                  <span className="size-1.5" style={{ background: STATUS_DOT[project.status] }} />
                  <span className="font-mono text-soft text-[9px] tracking-[0.18em] uppercase">
                    {statusMeta[project.status].label}
                  </span>
                </div>
              </div>

              <div className="flex grow flex-col p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-ink text-2xl font-semibold tracking-tight uppercase">
                    {project.name}
                  </h3>
                  <span className="font-mono text-faint text-[10px] whitespace-nowrap">{project.year}</span>
                </div>
                <p className="text-faint mt-1 text-xs">
                  {project.sector} · {project.city}
                </p>
                <p className="text-soft mt-3 grow text-sm leading-relaxed">{project.summary}</p>

                <div className="border-line mt-5 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-raised h-1 w-24 overflow-hidden">
                      <div
                        className="bg-accent h-full"
                        style={{ width: `${Math.round(project.progress * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-faint text-[10px] tabular-nums">
                      {Math.round(project.progress * 100)}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openInDistrict(project.id)}
                    data-cursor="enter"
                    className="link-draw font-mono text-ink text-[10px] tracking-[0.18em]"
                  >
                    OPEN IN DISTRICT ↗
                  </button>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </>
  );
}
