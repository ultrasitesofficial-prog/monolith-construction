import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { buildMetadata, localBusinessJsonLd } from "@atelier/core";
import { siteConfig } from "@/config/site.config";
import { fontVariables } from "@/config/fonts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { BootProvider } from "@/components/boot";
import { Cursor } from "@/components/cursor";
import { LenisProvider } from "@/components/motion/lenis-provider";
import "./globals.css";

export const metadata: Metadata = buildMetadata(siteConfig) as Metadata;

export const viewport: Viewport = {
  themeColor: siteConfig.theme.colors.dark?.background ?? "#0c0d0f",
};

/** Flags repeat visits before paint so the boot curtain never flashes. */
const bootScript = `(function(){try{if(sessionStorage.getItem("monolith-boot")==="1"){document.documentElement.dataset.booted="1";}}catch(e){}})();`;

/** Owner color overrides from the admin dashboard, applied pre-paint. */
const adminScript = `(function(){try{var o=JSON.parse(localStorage.getItem("monolith-admin")||"{}");var r=document.documentElement.style;if(o.primary)r.setProperty("--cfg-primary",o.primary);if(o.secondary)r.setProperty("--cfg-secondary",o.secondary);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { colors } = siteConfig.theme;
  const cssVars = [
    `--cfg-primary:${colors.primary}`,
    colors.secondary ? `--cfg-secondary:${colors.secondary}` : "",
    colors.accent ? `--cfg-accent:${colors.accent}` : "",
    colors.dark?.background ? `--cfg-bg-dark:${colors.dark.background}` : "",
    colors.dark?.foreground ? `--cfg-ink-dark:${colors.dark.foreground}` : "",
  ]
    .filter(Boolean)
    .join(";");

  const jsonLd = localBusinessJsonLd(siteConfig);
  const ga = siteConfig.analytics?.googleAnalyticsId;

  return (
    <html lang={siteConfig.localization.defaultLocale} className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script dangerouslySetInnerHTML={{ __html: adminScript }} />
        <noscript>
          <style>{`#boot-loader{display:none}`}</style>
        </noscript>
        <style>{`:root{${cssVars}}`}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${fontVariables} font-body bg-bg text-ink min-h-dvh antialiased`}>
        <a
          href="#content"
          className="focus:bg-accent sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[140] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:tracking-widest focus:text-black"
        >
          Skip to content
        </a>
        <BootProvider>
          <SiteHeader />
          <main id="content">{children}</main>
          <SiteFooter />
          {siteConfig.features?.whatsappFab ? <WhatsAppFab /> : null}
        </BootProvider>
        <Cursor />
        <LenisProvider />
        {ga ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
