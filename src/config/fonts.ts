import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";

/**
 * Monolith type system — descended from DIN, the letterforms of site signage
 * and engineering drawings. Barlow Condensed carries the monumental headlines,
 * Barlow does the reading, IBM Plex Mono measures everything: coordinates,
 * phase codes, tonnage, dates.
 */
export const fontDisplay = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
});

export const fontBody = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow",
});

export const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const fontVariables = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`;
