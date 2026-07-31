import type { Metadata } from "next";
import { faqs } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";
import { Reveal, RevealLines } from "@/components/reveal";
import { RfpForm } from "@/components/contact/rfp-form";

export const metadata: Metadata = {
  title: "Start a project",
  description:
    "Tell Monolith what you're planning — a director replies within one working day. Field office, site hours, and RFP intake.",
};

export default function ContactPage() {
  const { contact, hours } = siteConfig;

  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-32 pb-24 sm:px-8 sm:pt-40">
      <div className="mb-14">
        <Reveal>
          <p className="sheet-label mb-4">
            RFP INTAKE <b>■</b> RESPONSE ≤ 1 WORKING DAY
          </p>
        </Reveal>
        <RevealLines
          as="h1"
          lines={["TELL US WHAT", "YOU'RE PLANNING"]}
          className="font-display text-ink block text-[clamp(3rem,8vw,7.5rem)] leading-[0.88] font-bold tracking-tight uppercase"
        />
      </div>

      <div className="grid gap-14 lg:grid-cols-[1.25fr_1fr]">
        <Reveal delay={0.1}>
          <div className="border-line bg-surface relative border p-6 sm:p-9">
            <div className="hazard-strip absolute inset-x-0 top-0" aria-hidden />
            <RfpForm />
          </div>
        </Reveal>

        <div className="space-y-10">
          <Reveal delay={0.15}>
            <div>
              <p className="sheet-label mb-4">FIELD OFFICE</p>
              <address className="text-ink text-lg not-italic">
                {contact.address.street}
                <br />
                {contact.address.city}, {contact.address.region} {contact.address.postalCode}
              </address>
              <div className="mt-4 space-y-1.5">
                <a href={`tel:${contact.phone}`} className="link-draw text-soft hover:text-ink block text-sm">
                  {contact.phoneDisplay ?? contact.phone}
                </a>
                <a href={`mailto:${contact.email}`} className="link-draw text-soft hover:text-ink block text-sm">
                  {contact.email}
                </a>
                {contact.address.mapsUrl ? (
                  <a
                    href={contact.address.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw font-mono text-accent mt-2 inline-block text-[11px] tracking-[0.18em]"
                  >
                    GET DIRECTIONS ↗
                  </a>
                ) : null}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div>
              <p className="sheet-label mb-4">SITE HOURS</p>
              <ul className="border-line divide-line divide-y border-y">
                {hours.map((row) => (
                  <li key={row.days} className="flex items-baseline justify-between gap-4 py-2.5">
                    <span className="text-soft text-sm">{row.days}</span>
                    <span className="font-mono text-ink text-xs">
                      {row.closed ? "CLOSED" : `${row.open} – ${row.close}`}
                      {row.note ? <span className="text-faint"> · {row.note}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {contact.address.mapsEmbedUrl ? (
            <Reveal delay={0.25}>
              <div className="border-line relative overflow-hidden border">
                <iframe
                  src={contact.address.mapsEmbedUrl}
                  title={`Map — ${siteConfig.business.name} field office`}
                  className="h-64 w-full grayscale-[0.4] invert-[0.88] hue-rotate-180"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>

      {/* FAQs */}
      <section aria-label="Frequently asked questions" className="mt-24">
        <Reveal>
          <p className="sheet-label mb-8">
            RFI — COMMON QUESTIONS <b>■</b> ANSWERED IN ADVANCE
          </p>
        </Reveal>
        <div className="border-line border-t">
          {faqs.map((faq, i) => (
            <Reveal key={faq.id} delay={i * 0.05}>
              <details className="group border-line border-b">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-accent text-[10px] tracking-[0.2em]">
                      RFI-{String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-ink text-xl font-semibold tracking-tight uppercase sm:text-2xl">
                      {faq.question}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="text-accent font-mono transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="text-soft max-w-3xl pb-6 leading-relaxed">{faq.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
