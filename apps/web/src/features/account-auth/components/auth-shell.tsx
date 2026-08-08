import Link from "next/link";
import { Logo } from "@/components/brand";
import type { AuthRole } from "./auth-copy";

/**
 * Auth shell (v2, ADR-0026): the ink pane beside the form. Desktop splits —
 * the fixed ink panel carries the reversed brand mark, "Plug yourself in."
 * and the three lime-dash promises; the form pane sits on the canvas with its
 * 400px card. On a phone the ink pane collapses to the promises-free top
 * band and the form takes the screen. Auth stays a dead end by design: no
 * nav, no pill — the mark is the only way out, plus the one honest escape
 * hatch ("keep shopping instead") every screen carries under its card.
 *
 * `role` still scopes copy downstream; the v2 pane itself is ink for
 * everyone — the lime accent is the auth surface's one colour.
 */
const PROMISES = [
  "No account is ever needed to buy.",
  "No cart, no checkout — you finish at the retailer.",
  "One account, whatever you turn out to be.",
] as const;

export function AuthShell({
  role,
  artefact,
  children,
}: {
  role: AuthRole | "generic";
  /** Extra pane content — /join's role deck; decorative elsewhere. */
  artefact?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    // v2 auth wears lime as its action colour (ink text on the fill) — the one
    // surface where the accent IS the offer: joining. Scoped here so every
    // primary button and ring inside inherits it from the tokens.
    <div
      data-role={role}
      className="relative min-h-dvh [--color-primary-foreground:250_27%_9%] [--color-primary:78_100%_62%] [--ring:78_100%_62%] lg:flex lg:items-stretch"
    >
      {/* ── pane one — the ink panel: DESKTOP ONLY. The design's narrow
          layout has no ink band; the brand lockup rides above the card
          instead (v2 §auth authSplit/authStacked). ── */}
      <aside className="bg-brand-ink hidden flex-col justify-center px-11 py-12 text-white lg:flex lg:w-2/5 lg:shrink-0">
        <Link href="/" aria-label="Plugfolio home" className="self-start">
          <Logo layout="reversed" />
        </Link>
        <h2 className="font-display text-display-sm mt-7 font-bold leading-[1.15] tracking-[-0.04em]">
          Plug yourself in.
        </h2>
        <ul className="mt-[18px] flex flex-col gap-2.5">
          {PROMISES.map((line) => (
            <li key={line} className="text-label flex gap-2.5 leading-[1.55] text-white/70">
              <span aria-hidden className="text-accent">
                —
              </span>
              {line}
            </li>
          ))}
        </ul>
        {artefact ? <div className="mt-6">{artefact}</div> : null}
      </aside>

      {/* ── pane two — the form ── */}
      <main className="bg-background flex flex-1 flex-col items-center justify-center px-5 py-9 lg:px-10">
        {/* The stacked layout's way out: the mark above the card. */}
        <Link href="/" aria-label="Plugfolio home" className="mb-6 lg:hidden">
          <Logo layout="horizontal" tone="auto" />
        </Link>
        <div className="border-border bg-card rounded-drawer w-full max-w-[400px] border p-[22px]">
          {children}
        </div>
        <p className="text-faint text-micro mt-[18px] max-w-[380px] text-center leading-[1.6]">
          Shopping never asks for any of this. An account is only for following, saving, commenting,
          selling or hiring.
        </p>
        <Link
          href="/explore"
          className="text-muted-foreground text-pico tracking-eyebrow mt-3 font-mono font-bold uppercase"
        >
          ← Keep shopping instead
        </Link>
      </main>
    </div>
  );
}
