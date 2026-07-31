import Link from "next/link";
import { SocialIcon, hasSocialIcon, type SocialPlatform } from "@atelier/core";
import { siteConfig } from "@/config/site.config";

/**
 * Footer as the final drawing sheet: "AS-BUILT". A giant outlined wordmark,
 * the title block, and the revision line.
 */
export function SiteFooter() {
  const word = siteConfig.business.logo.text ?? siteConfig.business.name.toUpperCase();
  const year = new Date().getFullYear();

  return (
    <footer className="border-line relative overflow-hidden border-t">
      <div className="mx-auto max-w-[1600px] px-5 pt-16 pb-8 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <p className="sheet-label mb-4">SHEET A-000 — AS-BUILT</p>
            <p className="text-soft max-w-xs text-sm leading-relaxed">
              {siteConfig.business.description}
            </p>
          </div>
          <div>
            <p className="sheet-label mb-4">NAVIGATE</p>
            <ul className="space-y-2.5">
              {[{ label: "Home", href: "/" }, ...siteConfig.navigation.filter((l) => !l.cta)].map(
                (link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="link-draw text-soft hover:text-ink text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
          <div>
            <p className="sheet-label mb-4">FIELD OFFICE</p>
            <address className="text-soft text-sm leading-relaxed not-italic">
              {siteConfig.contact.address.street}
              <br />
              {siteConfig.contact.address.city}, {siteConfig.contact.address.region}{" "}
              {siteConfig.contact.address.postalCode}
            </address>
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="link-draw text-soft hover:text-ink mt-3 inline-block text-sm transition-colors"
            >
              {siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone}
            </a>
            <br />
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="link-draw text-soft hover:text-ink mt-1 inline-block text-sm transition-colors"
            >
              {siteConfig.contact.email}
            </a>
          </div>
          <div>
            <p className="sheet-label mb-4">SITE HOURS</p>
            <ul className="text-soft space-y-2 text-sm">
              {siteConfig.hours.map((row) => (
                <li key={row.days} className="flex justify-between gap-4">
                  <span>{row.days}</span>
                  <span className="font-mono text-xs">
                    {row.closed ? "CLOSED" : `${row.open}–${row.close}`}
                  </span>
                </li>
              ))}
            </ul>
            <ul className="mt-5 flex gap-4">
              {Object.entries(siteConfig.social).map(([platform, url]) =>
                url && hasSocialIcon(platform) ? (
                  <li key={platform}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={platform}
                      className="text-faint hover:text-accent block transition-colors"
                    >
                      <SocialIcon platform={platform as SocialPlatform} className="size-[18px] fill-current" />
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Giant as-built wordmark */}
      <div className="pointer-events-none select-none" aria-hidden>
        <p className="outline-text font-display -mb-[2vw] text-center text-[clamp(4.5rem,17.5vw,17rem)] leading-[0.8] font-bold tracking-[0.02em] whitespace-nowrap opacity-60">
          {word}
        </p>
      </div>

      <div className="border-line border-t">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <p className="font-mono text-faint text-[10px] tracking-[0.18em]">
            © {year} {siteConfig.business.legalName ?? siteConfig.business.name}. ALL RIGHTS RESERVED.
          </p>
          <p className="font-mono text-faint text-[10px] tracking-[0.18em]">
            REV {year}.{String(new Date().getMonth() + 1).padStart(2, "0")} — ISSUED FOR CONSTRUCTION
          </p>
        </div>
      </div>
      <div className="hazard-strip" aria-hidden />
    </footer>
  );
}
