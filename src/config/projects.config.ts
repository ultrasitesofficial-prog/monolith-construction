/**
 * ┌──────────────────────────────────────────────────────────────┐
 * │  MONOLITH — PROJECT PORTFOLIO + DISTRICT MAP PLOTS           │
 * │  Each project carries its own map plot: where it stands in   │
 * │  the WebGL district, its massing type, and its build status. │
 * │  Status drives color: blueprint blue = in design, safety     │
 * │  orange = under construction, warm light = delivered.        │
 * └──────────────────────────────────────────────────────────────┘
 */

export type ProjectStatus = "in-design" | "under-construction" | "delivered";

export type PlotKind = "tower" | "arena" | "campus" | "shed" | "bridge";

export interface ProjectPhase {
  code: string;
  name: string;
  status: "done" | "active" | "planned";
}

export interface ProjectPlot {
  /** District coordinates. Ground is the XZ plane, origin at district center. */
  x: number;
  z: number;
  /** Massing archetype rendered on the map. */
  kind: PlotKind;
  /** Y-axis rotation in radians. */
  rotation?: number;
  /** Storey count for towers/campus blocks (map scale). */
  floors?: number;
  /** Footprint [width, depth] in district units. */
  footprint: [number, number];
  /** Attach an animated tower crane (under-construction sites usually). */
  crane?: boolean;
}

export interface Project {
  id: string;
  name: string;
  sector: string;
  city: string;
  year: string;
  status: ProjectStatus;
  /** 0–1 construction progress, drives the progress bar + map massing. */
  progress: number;
  summary: string;
  facts: { label: string; value: string }[];
  phases: ProjectPhase[];
  plot: ProjectPlot;
  image?: string;
}

export const statusMeta: Record<ProjectStatus, { label: string; short: string }> = {
  "in-design": { label: "In design", short: "DSN" },
  "under-construction": { label: "Under construction", short: "U/C" },
  delivered: { label: "Delivered", short: "DLV" },
};

export const projects: Project[] = [
  {
    id: "vantage-88",
    name: "Vantage 88",
    sector: "Commercial high-rise",
    city: "Chicago, US",
    year: "2021 — 2026",
    status: "under-construction",
    progress: 0.72,
    summary:
      "An 88-floor, 402-metre mixed-use supertall — the tallest thing we've ever promised. The core slips day and night; the unitized facade chases it at sixty panels a day.",
    facts: [
      { label: "Height", value: "402 m" },
      { label: "Floors", value: "88 + 3 below" },
      { label: "Floor area", value: "310,000 m²" },
      { label: "Steel", value: "48,000 t" },
      { label: "Contract", value: "Design-build" },
    ],
    phases: [
      { code: "P-01", name: "Planning", status: "done" },
      { code: "P-03", name: "Foundations", status: "done" },
      { code: "P-04", name: "Structure", status: "done" },
      { code: "P-06", name: "Envelope", status: "active" },
      { code: "P-08", name: "Handover", status: "planned" },
    ],
    plot: { x: 16, z: -4, kind: "tower", floors: 22, footprint: [7, 7], crane: true },
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "calder-exchange",
    name: "The Calder Exchange",
    sector: "Infrastructure & civil",
    city: "New Carden, US",
    year: "1996 — 1999 · rebuilt 2019",
    status: "delivered",
    progress: 1,
    summary:
      "A rail-over-river interchange rebuilt above four hundred live trains a day. The award that founded our civil division — and the job our CEO started on.",
    facts: [
      { label: "Bridge deck", value: "1.9 km" },
      { label: "Spans", value: "11" },
      { label: "Longest span", value: "148 m" },
      { label: "Trains kept running", value: "400 / day" },
      { label: "Contract", value: "CM at risk" },
    ],
    phases: [
      { code: "P-01", name: "Planning", status: "done" },
      { code: "P-03", name: "Marine piers", status: "done" },
      { code: "P-04", name: "Deck launch", status: "done" },
      { code: "P-08", name: "Handover", status: "done" },
    ],
    plot: { x: -10, z: -33, kind: "bridge", rotation: Math.PI / 2, footprint: [26, 5] },
    image:
      "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "northbank-arena",
    name: "Northbank Arena",
    sector: "Civic & culture",
    city: "Rotterdam, NL",
    year: "2014 — 2017",
    status: "delivered",
    progress: 1,
    summary:
      "An 18,000-seat arena under a 148-metre clear-span roof, lifted in one national-news weekend. Every crane pick was rehearsed digitally for a year.",
    facts: [
      { label: "Seats", value: "18,000" },
      { label: "Clear span", value: "148 m" },
      { label: "Roof lift", value: "3,100 t in 62 h" },
      { label: "Events / year", value: "140+" },
      { label: "Contract", value: "Design-build" },
    ],
    phases: [
      { code: "P-01", name: "Planning", status: "done" },
      { code: "P-04", name: "Bowl structure", status: "done" },
      { code: "P-05", name: "Roof lift", status: "done" },
      { code: "P-08", name: "Handover", status: "done" },
    ],
    plot: { x: -34, z: -8, kind: "arena", footprint: [17, 13] },
    image:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "halcyon-quarter",
    name: "Halcyon Quarter",
    sector: "Residential communities",
    city: "Manchester, UK",
    year: "2023 — 2028",
    status: "under-construction",
    progress: 0.38,
    summary:
      " 3,200 homes across a former rail yard — four precast mid-rise phases around a two-hectare park. Phase one families moved in while phase three was still bedrock.",
    facts: [
      { label: "Homes", value: "3,200" },
      { label: "Phases", value: "4" },
      { label: "Park", value: "2.1 ha" },
      { label: "Precast elements", value: "41,000" },
      { label: "Contract", value: "Development partner" },
    ],
    phases: [
      { code: "P-01", name: "Masterplan", status: "done" },
      { code: "P-02", name: "Remediation", status: "done" },
      { code: "P-04", name: "Phase 1–2 frames", status: "active" },
      { code: "P-08", name: "Final handover", status: "planned" },
    ],
    plot: { x: -32, z: 22, kind: "campus", floors: 7, footprint: [19, 14], crane: true },
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "foundry-07",
    name: "Foundry District 07",
    sector: "Industrial & logistics",
    city: "Gdańsk, PL",
    year: "2019 — 2022",
    status: "delivered",
    progress: 1,
    summary:
      "A 190,000 m² battery plant under a single roof — the largest we've ever closed. Our digital twin caught a services clash that paid for the whole contract.",
    facts: [
      { label: "Single roof", value: "190,000 m²" },
      { label: "Slab flatness", value: "FF 104" },
      { label: "Columns", value: "1,240" },
      { label: "Schedule", value: "31 months" },
      { label: "Contract", value: "EPC" },
    ],
    phases: [
      { code: "P-01", name: "Planning", status: "done" },
      { code: "P-03", name: "Super-flat slab", status: "done" },
      { code: "P-06", name: "Envelope", status: "done" },
      { code: "P-08", name: "Handover", status: "done" },
    ],
    plot: { x: 36, z: 22, kind: "shed", footprint: [21, 14] },
    image:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "meridian-gate",
    name: "Meridian Gate",
    sector: "Commercial high-rise",
    city: "Singapore, SG",
    year: "2026 — 2030 (planned)",
    status: "in-design",
    progress: 0.04,
    summary:
      "A 54-floor twin-skin tower that breathes: a ventilated double facade cuts cooling loads by a third. Currently a hologram — 900 drawings and counting.",
    facts: [
      { label: "Floors", value: "54" },
      { label: "Facade", value: "Twin-skin, ventilated" },
      { label: "Cooling load", value: "−34%" },
      { label: "Target", value: "Net-zero operational" },
      { label: "Stage", value: "Detailed design" },
    ],
    phases: [
      { code: "P-00", name: "Concept", status: "done" },
      { code: "P-01", name: "Detailed design", status: "active" },
      { code: "P-02", name: "Enabling works", status: "planned" },
      { code: "P-08", name: "Handover", status: "planned" },
    ],
    plot: { x: 40, z: -16, kind: "tower", floors: 14, footprint: [8, 6] },
    image:
      "https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=1200&q=80&auto=format&fit=crop",
  },
];

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
