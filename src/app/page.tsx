import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { Chronicle } from "@/components/home/chronicle";
import { Capabilities } from "@/components/home/capabilities";
import { Method } from "@/components/home/method";
import {
  Boards,
  Crew,
  DistrictSection,
  Handover,
  Ledger,
} from "@/components/home/sections";

/**
 * The drawing set, in reading order:
 * S.01 the scroll-built tower · S.02 disciplines band · S.03 the firm's eras ·
 * S.04 capabilities as study models · S.05 the interactive district ·
 * S.06 the method drawing itself · S.07 as-built numbers · S.08 the crew ·
 * S.09 site boards · S.10 handover, doors open.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Chronicle />
      <Capabilities />
      <DistrictSection />
      <Method />
      <Ledger />
      <Crew />
      <Boards />
      <Handover />
    </>
  );
}
