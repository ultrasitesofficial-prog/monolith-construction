"use client";

import { motion, useReducedMotion } from "motion/react";
import { useInViewOnce } from "@atelier/core/client";

/** Scroll reveal — Monolith rises the way a panel is craned in: firm, damped. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Curtain image reveal (CSS transition, observer on the UNCLIPPED wrapper —
 * a fully clipped element never intersects, which would deadlock the reveal
 * AND native lazy loading).
 */
export function RevealImage({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.15 });
  const shown = inView || reduce;

  return (
    <div ref={ref} className={className}>
      {/* size-full keeps the 100%-height chain intact — the transformed inner
          div is the containing block for next/image `fill` children */}
      <div
        className="size-full"
        style={{
          clipPath: shown ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
          transition: reduce
            ? undefined
            : `clip-path 0.8s cubic-bezier(0.77, 0, 0.175, 1) ${delay}s`,
        }}
      >
        <div
          className="size-full"
          style={{
            transform: shown ? "scale(1)" : "scale(1.08)",
            transition: reduce
              ? undefined
              : `transform 1s cubic-bezier(0.23, 1, 0.32, 1) ${delay}s`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Line-mask headline: each line rises out of its own overflow mask.
 * Pass lines as an array so the mask boundaries are intentional.
 */
export function RevealLines({
  lines,
  delay = 0,
  stagger = 0.09,
  as: Tag = "span",
  className,
}: {
  lines: readonly string[];
  delay?: number;
  stagger?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="mask-line">
          <motion.span
            initial={reduce ? false : { y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.8,
              delay: delay + i * stagger,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
