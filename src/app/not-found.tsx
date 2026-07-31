import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid-paper flex min-h-svh flex-col items-center justify-center px-5 text-center">
      <p className="sheet-label mb-6">
        RFI-404 <b>■</b> SHEET NOT FOUND
      </p>
      <p className="outline-text font-display text-[clamp(6rem,24vw,18rem)] leading-none font-bold" aria-hidden>
        404
      </p>
      <h1 className="font-display text-ink mt-4 text-3xl font-semibold tracking-tight uppercase sm:text-4xl">
        This sheet never made the set
      </h1>
      <p className="text-soft mt-3 max-w-md text-sm leading-relaxed">
        The drawing you requested was superseded, archived, or never issued.
        Return to the title sheet and navigate from there.
      </p>
      <Link href="/" className="btn-plate press mt-9" data-cursor="enter">
        <span>Back to the set</span>
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
