import type { Review, Stat, TeamMember, TimelineEvent } from "@atelier/core";

/**
 * ┌──────────────────────────────────────────────────────────────┐
 * │  MONOLITH — CONTENT                                          │
 * │  Every word and number on the site lives here. The voice is  │
 * │  engineering understatement: measured, unitized, no froth.   │
 * └──────────────────────────────────────────────────────────────┘
 */

/* --------------------------------- hero ---------------------------------- */

export const hero = {
  /** Mono eyebrow over the headline. */
  eyebrow: "MONOLITH CONSTRUCTION GROUP — EST. 1974",
  /** The five construction states the scroll sequence moves through. */
  phases: [
    {
      code: "P-00",
      name: "Site",
      headline: ["WE BUILD", "WHAT OUTLASTS US"],
      note: "Scroll to raise the tower",
      spec: "GRID 40 × 40 M · BENCH ELEV +0.00",
    },
    {
      code: "P-01",
      name: "Structure",
      headline: ["STEEL FIRST.", "EVERYTHING AFTER."],
      note: "Frame erection · 2 floors / week",
      spec: "COLUMNS W14 × 90 · 412 T ERECTED",
    },
    {
      code: "P-02",
      name: "Core & slabs",
      headline: ["CONCRETE HOLDS", "THE PROMISES"],
      note: "Slip-form core · slab cycle 6 days",
      spec: "C50/60 MIX · 9,400 M³ POURED",
    },
    {
      code: "P-03",
      name: "Envelope",
      headline: ["GLASS CLOSES", "THE QUESTION"],
      note: "Unitized curtain wall · 60 panels / day",
      spec: "PANEL 1.5 × 3.6 M · U 0.9 W/M²K",
    },
    {
      code: "P-04",
      name: "Delivered",
      headline: ["HANDED OVER.", "LIGHTS ON."],
      note: "Certificate of occupancy issued",
      spec: "DEFECTS AT HANDOVER: 0 CRITICAL",
    },
  ],
  /** Bottom-right HUD readouts that accompany the whole sequence. */
  readouts: [
    { label: "TOWER", value: "DEMO-01 “VANTAGE”" },
    { label: "FLOORS", value: "24 + PLANT" },
    { label: "METHOD", value: "STEEL FRAME / SLIP CORE" },
  ],
} as const;

/* -------------------------------- marquee -------------------------------- */

export const marqueeDisciplines = [
  "Preconstruction",
  "Structural steel",
  "Deep foundations",
  "Slip-form concrete",
  "Curtain wall",
  "Heavy civil",
  "MEP coordination",
  "Digital twins",
  "Safety engineering",
];

/* ------------------------------ capabilities ------------------------------ */

export interface Capability {
  id: string;
  code: string;
  name: string;
  /** One-line card blurb. */
  blurb: string;
  /** Expanded panel copy. */
  description: string;
  bullets: string[];
  /** Mono stat line shown in the expanded panel. */
  spec: string;
  /** Which procedural 3D object the card renders. */
  object: "tower" | "bridge" | "gantry" | "pavilion" | "blocks" | "truss";
}

export const capabilities: Capability[] = [
  {
    id: "commercial",
    code: "C-01",
    name: "Commercial high-rise",
    blurb: "Towers from bedrock to beacon — office, hotel, and mixed-use verticals.",
    description:
      "We take towers from geotechnical report to certificate of occupancy under one contract. Our slip-form crews and unitized-facade logistics keep floor cycles under six days without trading away tolerance.",
    bullets: ["Design-build & CM at risk", "Slip-form cores to 400 m+", "Facade logistics & commissioning"],
    spec: "41 TOWERS · TALLEST 402 M · AVG CYCLE 5.6 DAYS/FLOOR",
    object: "tower",
  },
  {
    id: "infrastructure",
    code: "C-02",
    name: "Infrastructure & civil",
    blurb: "Bridges, interchanges, and transit — the parts of a city nobody may notice and everybody uses.",
    description:
      "Heavy civil is where our surveying discipline earns its keep. Launch girders, cut-and-cover stations, and marine works delivered against live traffic and tide tables.",
    bullets: ["Segmental & cable-stay bridges", "Transit stations & tunnels", "Marine & flood defense works"],
    spec: "38 KM OF BRIDGE DECK · 14 STATIONS · 6 PORTS",
    object: "bridge",
  },
  {
    id: "industrial",
    code: "C-03",
    name: "Industrial & logistics",
    blurb: "Gigafactories, ports, and fulfillment campuses measured in hectares, not floors.",
    description:
      "Wide-bay steel, super-flat slabs, and process integration on compressed schedules. We sequence civils, shell, and equipment install in parallel so lines start producing months earlier.",
    bullets: ["Super-flat slabs FF100+", "Clean rooms & cold chain", "Process & utilities integration"],
    spec: "2.1M M² OF SHELL · LARGEST SINGLE ROOF: 190,000 M²",
    object: "gantry",
  },
  {
    id: "civic",
    code: "C-04",
    name: "Civic & culture",
    blurb: "Arenas, museums, terminals — geometry that doesn't repeat, built to be looked at forever.",
    description:
      "One-off geometry demands one-off methods. We prototype facade nodes at full scale, digitally pre-assemble long-span roofs, and rehearse every crane pick that has no second take.",
    bullets: ["Long-span roofs & shells", "Heritage restoration", "Airport & terminal works"],
    spec: "9 ARENAS & HALLS · LONGEST CLEAR SPAN 148 M",
    object: "pavilion",
  },
  {
    id: "residential",
    code: "C-05",
    name: "Residential communities",
    blurb: "Masterplanned quarters — thousands of homes with the streets, parks, and schools between them.",
    description:
      "Volumetric bathrooms, precast frames, and a factory-fed logistics chain let us hand over homes in phases while the district around them keeps its promised dates.",
    bullets: ["Masterplan phasing", "Precast & modular systems", "Community infrastructure"],
    spec: "18,600 HOMES DELIVERED · 12 DISTRICTS",
    object: "blocks",
  },
  {
    id: "engineering",
    code: "C-06",
    name: "Engineering & design",
    blurb: "In-house structures, facades, and digital twins — the drawings we build are ours.",
    description:
      "Two hundred engineers model every project twice: once in the computer, once on site. The twin tracks progress, clashes, and as-built tolerance daily, so surprises stay in the software.",
    bullets: ["Structural & facade engineering", "4D sequencing & digital twins", "Value engineering"],
    spec: "200 ENGINEERS · 100% OF PROJECTS TWINNED SINCE 2019",
    object: "truss",
  },
];

/* --------------------------------- method --------------------------------- */

export interface MethodPhase {
  code: string;
  name: string;
  description: string;
  spec: string;
}

/** The eight-phase delivery method, drawn as a cross-section that builds. */
export const methodPhases: MethodPhase[] = [
  {
    code: "P-01",
    name: "Planning & permits",
    description: "Feasibility, budget truth-telling, and a permit path with no optimism in it.",
    spec: "DELIVERABLE: CLASS-2 ESTIMATE ±10%",
  },
  {
    code: "P-02",
    name: "Excavation",
    description: "Shoring, dewatering, and muck-out — the project's only invisible phase.",
    spec: "TYP. DIG 18 M · 40,000 M³ REMOVED",
  },
  {
    code: "P-03",
    name: "Foundations",
    description: "Piles to refusal, mat pours through the night, survey nails at every axis.",
    spec: "PILE Ø1.2 M TO 60 M · MAT 3.5 M THICK",
  },
  {
    code: "P-04",
    name: "Structural steel",
    description: "Columns plumb to 1:1000, bolted, torqued, inspected, signed.",
    spec: "ERECTION 2 FLOORS/WEEK · 3,900 BOLTS/FLOOR",
  },
  {
    code: "P-05",
    name: "Concrete works",
    description: "The core climbs ahead of the frame; slabs chase it on a six-day cycle.",
    spec: "SLIP RATE 300 MM/HR · CUBE TESTS DAILY",
  },
  {
    code: "P-06",
    name: "Envelope",
    description: "Unitized panels hung from monorails, gaskets checked with a feeler gauge.",
    spec: "60 PANELS/DAY · AIR TEST 600 PA",
  },
  {
    code: "P-07",
    name: "Interiors & MEP",
    description: "Forty trades in one shaft, sequenced so nobody waits and nothing gets opened twice.",
    spec: "9,000 COMMISSIONING CHECKS",
  },
  {
    code: "P-08",
    name: "Handover",
    description: "Keys, as-builts, the digital twin, and a ten-year door we keep answering.",
    spec: "DEFECTS TARGET: 0 CRITICAL AT DAY 1",
  },
];

/* --------------------------------- ledger --------------------------------- */

export const stats: Stat[] = [
  { id: "projects", value: 214, label: "Projects delivered since 1974" },
  { id: "area", value: 3.4, suffix: "M m²", label: "Floor area built" },
  { id: "countries", value: 9, label: "Countries with active sites" },
  { id: "schedule", value: 96, suffix: "%", label: "Handovers on or ahead of schedule" },
  { id: "safety", value: 2.1, suffix: "M", label: "Consecutive safe work-hours" },
];

/* ---------------------------------- crew ---------------------------------- */

export const team: TeamMember[] = [
  {
    id: "costa",
    name: "Mariana Costa",
    role: "Chief Executive",
    bio: "Started as a site engineer on the Calder Exchange. Still walks a site every Friday.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "novak",
    name: "Daniel Novák",
    role: "Head of Engineering",
    bio: "Two hundred engineers, one rule: the model matches the site or the model is wrong.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "vasquez",
    name: "Marta Vásquez",
    role: "Preconstruction Director",
    bio: "Turns napkin sketches into Class-2 estimates. Allergic to optimism bias.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "lindqvist",
    name: "Erik Lindqvist",
    role: "Head of Safety",
    bio: "2.1 million safe hours and counting. The only director who can stop any site, any time.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "mensah",
    name: "Kwame Mensah",
    role: "Design Director",
    bio: "Believes a construction joint can be beautiful if you plan it like one.",
    image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "dawson",
    name: "Claire Dawson",
    role: "Head of Digital Delivery",
    bio: "Ships the twin with the keys. Once commissioned a plant room from an airport lounge.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&q=80&auto=format&fit=crop",
  },
];

/* --------------------------------- boards --------------------------------- */

export const reviews: Review[] = [
  {
    id: "meridian",
    author: "Sofia Reyes",
    role: "Chief Development Officer, Meridian Development Partners",
    rating: 5,
    text: "They gave us the only construction schedule I've ever framed. Eighty-eight floors, handed over eleven days early.",
    source: "Vantage 88",
  },
  {
    id: "portauth",
    author: "Cmdr. James Whitfield",
    role: "Director of Works, Port Authority of New Carden",
    rating: 5,
    text: "Four hundred trains a day never stopped running while they rebuilt the interchange over our heads.",
    source: "Calder Exchange",
  },
  {
    id: "aster",
    author: "Dr. Amara Osei",
    role: "Board Chair, Aster Health Network",
    rating: 5,
    text: "A hospital wing delivered mid-pandemic, two months compressed to six weeks. We staffed it the day they left.",
    source: "Aster Riverside Wing",
  },
  {
    id: "vireo",
    author: "Henrik Foss",
    role: "VP Infrastructure, Vireo Energy",
    rating: 5,
    text: "Monolith's twin flagged a clash our own engineers missed. That one catch paid for the contract.",
    source: "Foundry District 07",
  },
];

/* -------------------------------- chronicle -------------------------------- */

export const timeline: TimelineEvent[] = [
  {
    id: "t1974",
    year: "1974",
    title: "Two cranes and a yard",
    description: "Founded as a steel-erection subcontractor with two cranes and a rented rail yard on the South Branch.",
  },
  {
    id: "t1988",
    year: "1988",
    title: "First skyline entry",
    description: "The 41-floor Lakeview Financial tower — our first time above the city's shoulders, delivered nine days early.",
  },
  {
    id: "t1999",
    year: "1999",
    title: "Heavy civil division",
    description: "The Calder Exchange interchange wins national honors and a bridge division is born from one job.",
  },
  {
    id: "t2008",
    year: "2008",
    title: "Nine countries",
    description: "Through the downturn we kept every apprentice on payroll — and opened offices on three continents.",
  },
  {
    id: "t2016",
    year: "2016",
    title: "The twin era",
    description: "First full digital-twin delivery. The model now arrives at handover as part of the keys.",
  },
  {
    id: "t2024",
    year: "2024",
    title: "Vantage 88 tops out",
    description: "402 metres — the tallest thing we've ever promised, on schedule at the top of its arc.",
  },
];

/* --------------------------------- values --------------------------------- */

export const values = [
  {
    id: "tolerance",
    code: "V-01",
    name: "Tolerance is a moral position",
    description: "A millimetre honored at bedrock is a facade that closes at floor 88. Precision isn't pedantry — it's how promises compound.",
  },
  {
    id: "safety",
    code: "V-02",
    name: "Everyone goes home",
    description: "Any worker can stop any site, any time, no meeting required. The stop-work card outranks every schedule we've ever signed.",
  },
  {
    id: "candor",
    code: "V-03",
    name: "Bad news travels fast",
    description: "Problems reported same-day are engineering; problems reported month-end are archaeology. We pay for candor and get it.",
  },
  {
    id: "handover",
    code: "V-04",
    name: "The door stays open",
    description: "Ten years after handover we still answer the phone. A building is a relationship with a very long snag list.",
  },
];

/* ---------------------------------- faqs ---------------------------------- */

export const faqs = [
  {
    id: "f1",
    question: "What project sizes do you take on?",
    answer: "Typically $20M and up as general contractor or design-builder; below that we occasionally act as construction manager for repeat clients and civic work we believe in.",
  },
  {
    id: "f2",
    question: "How early should we involve you?",
    answer: "Before the architect finishes schematic design, ideally. Preconstruction is where 80% of cost certainty is won — a Class-2 estimate at concept stage is our standard first deliverable.",
  },
  {
    id: "f3",
    question: "Do you self-perform or subcontract?",
    answer: "We self-perform structure — steel, concrete, and facades — and manage specialist trades under our supervision. Roughly 60% of site hours are our own crews.",
  },
  {
    id: "f4",
    question: "What does the digital twin include at handover?",
    answer: "Full as-built geometry, every commissioning record, embedded maintenance schedules, and live sensor hooks. Your facilities team gets the model and the training.",
  },
];

/* --------------------------------- handover -------------------------------- */

export const handover = {
  eyebrow: "S.10 — HANDOVER",
  headline: ["YOUR PROJECT", "IS OUR NEXT", "PROMISE."],
  note: "Tell us what you're planning. A director — not a form-bot — replies within one working day.",
  cta: "Start a project",
} as const;
