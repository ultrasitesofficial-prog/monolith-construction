"use client";

import { useState } from "react";
import { buildWhatsAppUrl } from "@atelier/core";
import { capabilities } from "@/config/content.config";
import { siteConfig } from "@/config/site.config";

const BUDGETS = ["Under $20M", "$20M – $100M", "$100M – $500M", "$500M+", "Not sure yet"];
const HORIZONS = ["Breaking ground in 12 months", "1–3 years out", "Early feasibility", "Live tender"];

/**
 * RFP intake — composes a structured brief and hands it to WhatsApp (fastest
 * channel to a director) with a mailto fallback. No backend required; the
 * template stays deployable anywhere static.
 */
export function RfpForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const line = (label: string, key: string) => {
      const v = String(data.get(key) ?? "").trim();
      return v ? `${label}: ${v}` : null;
    };
    const message = [
      `— NEW PROJECT INQUIRY —`,
      line("Name", "name"),
      line("Organization", "org"),
      line("Email", "email"),
      line("Phone", "phone"),
      line("Sector", "sector"),
      line("Budget", "budget"),
      line("Horizon", "horizon"),
      "",
      String(data.get("message") ?? "").trim(),
    ]
      .filter((l) => l !== null)
      .join("\n");

    window.open(buildWhatsAppUrl(siteConfig.contact.whatsapp, message), "_blank", "noopener");
    setSent(true);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-label="Start a project">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="YOUR NAME" required>
          <input name="name" required autoComplete="name" className="input" placeholder="Full name" />
        </Field>
        <Field label="ORGANIZATION">
          <input name="org" autoComplete="organization" className="input" placeholder="Company / authority" />
        </Field>
        <Field label="EMAIL" required>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input"
            placeholder="you@company.com"
          />
        </Field>
        <Field label="PHONE">
          <input name="phone" type="tel" autoComplete="tel" className="input" placeholder="+1 …" />
        </Field>
        <Field label="SECTOR">
          <select name="sector" className="input" defaultValue="">
            <option value="" disabled>
              Select a sector
            </option>
            {capabilities.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="INDICATIVE BUDGET">
          <select name="budget" className="input" defaultValue="">
            <option value="" disabled>
              Select a range
            </option>
            {BUDGETS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="HORIZON">
        <select name="horizon" className="input" defaultValue="">
          <option value="" disabled>
            Where does the project stand?
          </option>
          {HORIZONS.map((h) => (
            <option key={h}>{h}</option>
          ))}
        </select>
      </Field>
      <Field label="THE PROJECT" required>
        <textarea
          name="message"
          required
          rows={5}
          className="input resize-y"
          placeholder="Site, program, and what a great outcome looks like…"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-5 pt-2">
        <button type="submit" className="btn-plate press" data-cursor="enter">
          <span>Send the brief</span>
          <span aria-hidden>→</span>
        </button>
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="link-draw font-mono text-soft hover:text-ink text-[11px] tracking-[0.18em]"
        >
          OR EMAIL {siteConfig.contact.email.toUpperCase()}
        </a>
      </div>

      <p aria-live="polite" className="font-mono text-accent min-h-5 text-[11px] tracking-[0.16em]">
        {sent ? "BRIEF HANDED TO WHATSAPP — A DIRECTOR REPLIES WITHIN ONE WORKING DAY." : ""}
      </p>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="sheet-label mb-2 block">
        {label}
        {required ? <b> *</b> : null}
      </span>
      {children}
    </label>
  );
}
