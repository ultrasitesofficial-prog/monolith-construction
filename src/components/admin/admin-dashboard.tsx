"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site.config";

const STORAGE_KEY = "monolith-admin";
const PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE ?? "demo";

interface Overrides {
  primary?: string;
  secondary?: string;
  name?: string;
  tagline?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

/**
 * Owner dashboard (demo gate — wire real auth before production).
 *
 * Brand colors apply live across the whole site (a pre-paint script in the
 * layout re-applies them on every load). Identity fields are collected for
 * handoff: export the JSON and paste the values into src/config/site.config.ts.
 */
export function AdminDashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [o, setO] = useState<Overrides>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setO(JSON.parse(raw) as Overrides);
    } catch {
      /* fresh start */
    }
  }, []);

  const applyColors = (next: Overrides) => {
    const root = document.documentElement.style;
    if (next.primary) root.setProperty("--cfg-primary", next.primary);
    else root.removeProperty("--cfg-primary");
    if (next.secondary) root.setProperty("--cfg-secondary", next.secondary);
    else root.removeProperty("--cfg-secondary");
  };

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
    } catch {
      /* storage blocked */
    }
    applyColors(o);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setO({});
    applyColors({});
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ overrides: o }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "monolith-overrides.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-sm px-5 pt-44 pb-32">
        <p className="sheet-label mb-4">
          OWNER ACCESS <b>■</b> GATE
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code === PASSCODE) setUnlocked(true);
            else setError(true);
          }}
          className="space-y-4"
        >
          <label className="block">
            <span className="sheet-label mb-2 block">PASSCODE</span>
            <input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              className="input"
              autoFocus
            />
          </label>
          {error ? (
            <p className="font-mono text-accent text-[11px] tracking-[0.16em]">ACCESS DENIED — CHECK THE PASSCODE.</p>
          ) : null}
          <button type="submit" className="btn-plate press w-full justify-center">
            <span>Unlock</span>
          </button>
          <p className="text-faint text-xs">
            Demo passcode: <code className="font-mono">demo</code> — set NEXT_PUBLIC_ADMIN_PASSCODE to change it.
          </p>
        </form>
      </div>
    );
  }

  const field = (key: keyof Overrides, label: string, placeholder: string, type = "text") => (
    <label className="block">
      <span className="sheet-label mb-2 block">{label}</span>
      <input
        type={type}
        value={o[key] ?? ""}
        placeholder={placeholder}
        onChange={(e) => setO((prev) => ({ ...prev, [key]: e.target.value || undefined }))}
        className="input"
      />
    </label>
  );

  return (
    <div className="mx-auto max-w-3xl px-5 pt-32 pb-24 sm:px-8">
      <p className="sheet-label mb-3">
        OWNER DASHBOARD <b>■</b> {siteConfig.business.name.toUpperCase()}
      </p>
      <h1 className="font-display text-ink mb-10 text-5xl font-bold tracking-tight uppercase">
        Site controls
      </h1>

      <div className="space-y-10">
        <section className="border-line border p-6">
          <h2 className="font-display text-ink mb-1 text-2xl font-semibold uppercase">Brand colors</h2>
          <p className="text-faint mb-5 text-xs">
            Applied live to every page on this device — use it to preview a client&apos;s palette.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-end gap-3">
              <div className="grow">{field("primary", "PRIMARY (SAFETY ORANGE)", siteConfig.theme.colors.primary)}</div>
              <span
                className="border-line block size-10 shrink-0 border"
                style={{ background: o.primary || siteConfig.theme.colors.primary }}
                aria-hidden
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="grow">
                {field("secondary", "SECONDARY (BLUEPRINT)", siteConfig.theme.colors.secondary ?? "#5b8dff")}
              </div>
              <span
                className="border-line block size-10 shrink-0 border"
                style={{ background: o.secondary || siteConfig.theme.colors.secondary }}
                aria-hidden
              />
            </div>
          </div>
        </section>

        <section className="border-line border p-6">
          <h2 className="font-display text-ink mb-1 text-2xl font-semibold uppercase">Identity & contact</h2>
          <p className="text-faint mb-5 text-xs">
            Collected for handoff — export the JSON and paste values into{" "}
            <code className="font-mono">src/config/site.config.ts</code>.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {field("name", "BUSINESS NAME", siteConfig.business.name)}
            {field("tagline", "TAGLINE", siteConfig.business.tagline)}
            {field("phone", "PHONE", siteConfig.contact.phoneDisplay ?? "")}
            {field("whatsapp", "WHATSAPP", siteConfig.contact.whatsapp)}
            {field("email", "EMAIL", siteConfig.contact.email, "email")}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={save} className="btn-plate press">
            <span>{saved ? "Saved ✓" : "Save & apply"}</span>
          </button>
          <button type="button" onClick={exportJson} className="btn-plate press">
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={reset}
            className="link-draw font-mono text-soft hover:text-ink text-[11px] tracking-[0.18em]"
          >
            RESET OVERRIDES
          </button>
        </div>
      </div>
    </div>
  );
}
