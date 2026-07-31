# Monolith — Atelier Construction Template

A cinematic, dark construction/engineering group template. The site reads as a
set of construction documents coming to life: DIN-condensed headlines, mono
spec readouts, and color that encodes state — **blueprint blue** for the
unbuilt, **safety orange** for work in progress, **warm light** for the
delivered.

## Signature moments

- **S.01 The Build** — a procedural WebGL tower erects itself across a 500vh
  scroll: blueprint ghost → structural steel → slip-form core & slabs →
  curtain-wall glass → delivered at dusk, windows waking floor by floor. The
  camera rides a crane-like dolly; the sun completes a full day cycle.
- **S.05 The District** — the portfolio as an interactive city model. Drag to
  orbit, toggle day/night, hover plots, and *enter* any building: the camera
  flies in and the project dossier slides over. Status drives the render
  (holograms / cranes / lit windows). Ambient trucks and cranes never stop.
- **S.06 Method** — an engineering cross-section that draws itself through
  eight delivery phases while the section pins.
- Plus: velocity-reactive discipline marquee, pinned horizontal era chronicle,
  capability study-models (one shared WebGL context, six scissored viewports),
  concrete-pour stat counters, tilting crew cards, leaning site-board
  testimonials, and a handover finale whose facade lights up before the doors
  slide open.

## Rebranding for a client

Everything lives in `src/config/`:

| File                 | Owns                                                    |
| -------------------- | ------------------------------------------------------- |
| `site.config.ts`     | Name, colors, contact, hours, social, SEO, nav, features |
| `content.config.ts`  | Every word: hero phases, capabilities, method, stats, team, boards, values, FAQs |
| `projects.config.ts` | Portfolio + each project's plot in the 3D district      |
| `fonts.ts`           | Type system (Barlow Condensed / Barlow / IBM Plex Mono) |

No component code needs to be touched. The admin dashboard (`/admin`,
passcode `demo`) previews brand colors live and exports overrides as JSON.

## Engineering notes

- All 3D is procedural — zero model files, ~1,150 instanced meshes in the
  hero, cached edge geometries in the district. Canvases freeze offscreen
  (`frameloop="never"`), DPR is capped, and coarse-pointer devices get a lean
  scene automatically.
- Reduced motion is a first-class path: no pinning, no scrub, static
  "delivered" hero frame, vertical fallbacks for horizontal sections.
- Lenis is driven by the GSAP ticker so ScrollTrigger and scroll position
  never disagree by a frame. Import GSAP only via `src/lib/gsap.ts`.
- The RFP form composes a structured brief into WhatsApp (with mailto
  fallback) — no backend required.

## Run

```bash
npm run dev --workspace @atelier/construction   # port 3005
```
