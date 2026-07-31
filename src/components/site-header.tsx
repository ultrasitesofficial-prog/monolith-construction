"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@atelier/core";
import { siteConfig } from "@/config/site.config";
import { Magnetic } from "@/components/motion/magnetic";

const EASE = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/** Home-page sheet index shown in the overlay menu. */
const SHEETS = [
  { code: "S.01", label: "The build", href: "/#build" },
  { code: "S.04", label: "Capabilities", href: "/#capabilities" },
  { code: "S.05", label: "The district", href: "/#district" },
  { code: "S.06", label: "Method", href: "/#method" },
  { code: "S.08", label: "People", href: "/#people" },
  { code: "S.10", label: "Handover", href: "/#handover" },
];

/**
 * Glass navigation. Transparent over the hero, condenses into a glass plate
 * once scrolling starts, and carries a live "current sheet" readout fed by
 * an IntersectionObserver over [data-sheet] sections. A hairline at the
 * bottom edge tracks scroll progress like a level rod.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  /* Scroll: condensed state + progress hairline (rAF-throttled). */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${Math.min(Math.max(p, 0), 1)})`;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* Sheet spy: which drawing sheet is the reader on? */
  useEffect(() => {
    setSheet(null);
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-sheet]"));
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSheet((entry.target as HTMLElement).dataset.sheet ?? null);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [pathname]);

  /* Menu overlay: lock scroll + close on Escape. */
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const nav = siteConfig.navigation.filter((l) => !l.cta);
  const cta = siteConfig.navigation.find((l) => l.cta);
  const word = siteConfig.business.logo.text ?? siteConfig.business.name.toUpperCase();

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[80] transition-[background,border-color,backdrop-filter] duration-500",
          scrolled || open ? "glass border-b" : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-5 sm:h-[72px] sm:px-8">
          <Link href="/" className="press group flex items-baseline gap-2" aria-label={`${siteConfig.business.name} — home`}>
            <span className="font-display text-ink text-2xl font-bold tracking-[0.04em]">
              {word}
            </span>
            <span className="bg-accent inline-block size-2 transition-transform duration-300 group-hover:rotate-45" />
            <span className="sheet-label mt-px hidden lg:inline">CONSTRUCTION GROUP</span>
          </Link>

          {/* Current sheet readout — quietly narrates the scroll */}
          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 md:block" aria-hidden>
            <AnimatePresence mode="wait">
              {sheet ? (
                <motion.p
                  key={sheet}
                  className="sheet-label"
                  initial={reduce ? false : { y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? undefined : { y: -8, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {sheet}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
              {nav.map((link, i) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className={cn(
                    "link-draw text-sm tracking-wide",
                    pathname === link.href ? "text-ink" : "text-soft hover:text-ink",
                  )}
                >
                  <span className="font-mono text-accent mr-1.5 text-[10px]">{String(i + 1).padStart(2, "0")}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
            {cta ? (
              <Magnetic strength={0.2} className="hidden sm:inline-block">
                <Link href={cta.href} className="btn-plate press !py-2.5 !px-4">
                  <span>{cta.label}</span>
                </Link>
              </Magnetic>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close index" : "Open index"}
              className="group text-ink flex h-10 items-center gap-2.5 px-1"
            >
              <span className="font-mono hidden text-[11px] tracking-[0.2em] sm:inline">
                {open ? "CLOSE" : "INDEX"}
              </span>
              <span className="relative block h-[10px] w-6">
                <span
                  className="bg-ink absolute left-0 top-0 h-px w-full transition-transform duration-300"
                  style={{ transform: open ? "translateY(4.5px) rotate(45deg)" : "none" }}
                />
                <span
                  className="bg-ink absolute bottom-0 left-0 h-px w-full transition-transform duration-300"
                  style={{ transform: open ? "translateY(-4.5px) rotate(-45deg)" : "none" }}
                />
              </span>
            </button>
          </div>
        </div>
        {/* scroll progress hairline */}
        <div
          ref={progressRef}
          className="bg-accent absolute inset-x-0 bottom-0 h-px origin-left"
          style={{ transform: "scaleX(0)" }}
          aria-hidden
        />
      </header>

      {/* ————— Index overlay ————— */}
      <AnimatePresence>
        {open ? (
          <motion.div
            className="bg-surface fixed inset-0 z-[70] overflow-y-auto"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE_IN_OUT }}
          >
            <div className="grid-paper pointer-events-none absolute inset-0 opacity-30" />
            <div className="relative mx-auto flex min-h-full max-w-[1600px] flex-col justify-between gap-12 px-5 pt-28 pb-10 sm:px-8">
              <nav aria-label="Index" className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
                {/* Pages */}
                <ul>
                  {[{ label: "Home", href: "/" }, ...nav, ...(cta ? [cta] : [])].map((link, i) => (
                    <li key={link.href + link.label} className="border-line border-b">
                      <Link
                        href={link.href}
                        className="group flex items-baseline gap-5 py-4 sm:py-5"
                        onClick={() => setOpen(false)}
                      >
                        <motion.span
                          className="font-mono text-accent text-xs"
                          initial={reduce ? false : { opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 + i * 0.06, duration: 0.5, ease: EASE }}
                        >
                          {String(i).padStart(2, "0")}
                        </motion.span>
                        <span className="mask-line">
                          <motion.span
                            className="font-display text-ink group-hover:text-accent block text-[clamp(2.6rem,7vw,5rem)] leading-[0.95] font-semibold tracking-tight uppercase transition-colors duration-300"
                            initial={reduce ? false : { y: "110%" }}
                            animate={{ y: 0 }}
                            transition={{ delay: 0.2 + i * 0.06, duration: 0.7, ease: EASE }}
                          >
                            {link.label}
                          </motion.span>
                        </span>
                        <span className="font-mono text-faint ml-auto hidden text-xs transition-transform duration-300 group-hover:translate-x-1 sm:inline">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Home sheet index + contact */}
                <div className="flex flex-col gap-10">
                  <div>
                    <p className="sheet-label mb-4">DRAWING INDEX — HOME</p>
                    <ul className="space-y-2.5">
                      {SHEETS.map((s, i) => (
                        <motion.li
                          key={s.code}
                          initial={reduce ? false : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 + i * 0.05, duration: 0.5, ease: EASE }}
                        >
                          <Link
                            href={s.href}
                            onClick={() => setOpen(false)}
                            className="group text-soft hover:text-ink flex items-baseline gap-3 text-sm transition-colors"
                          >
                            <span className="font-mono text-accent text-[10px]">{s.code}</span>
                            <span className="link-draw">{s.label}</span>
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <motion.div
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <p className="sheet-label mb-4">FIELD OFFICE</p>
                    <p className="text-soft text-sm leading-relaxed">
                      {siteConfig.contact.address.street}
                      <br />
                      {siteConfig.contact.address.city}, {siteConfig.contact.address.region}
                    </p>
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="link-draw text-ink mt-3 inline-block text-sm"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </motion.div>
                </div>
              </nav>

              <div className="border-line flex items-center justify-between border-t pt-5">
                <p className="sheet-label">
                  {word} <b>■</b> EST. {siteConfig.business.foundedYear}
                </p>
                <div className="reg-mark" />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
