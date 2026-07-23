import Link from "next/link";
import { Logo, PlugMark } from "@/components/brand";
import type { PanelCopy } from "./auth-copy";

/**
 * Split auth shell from the design-out prototype: a violet-gradient brand panel
 * (desktop only — wordmark, two-line Sora headline with a lime second line,
 * lime check-bullets, mono footer, PlugMark watermark) beside a centered form
 * column. Mobile drops the panel and shows the logo above the card.
 */
export function AuthShell({ panel, children }: { panel: PanelCopy; children: React.ReactNode }) {
  return (
    <main className="bg-background text-foreground grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
      {/* brand panel (desktop) */}
      <div className="relative hidden min-h-dvh flex-col justify-between overflow-hidden bg-[linear-gradient(155deg,hsl(var(--brand-violet)),hsl(var(--brand-violet-deep)))] px-12 py-[52px] text-white lg:flex">
        <div aria-hidden className="absolute -bottom-[14%] -left-[10%] w-[60%] opacity-[0.13]">
          <PlugMark tone="flat" className="text-brand-lime h-auto w-full" />
        </div>
        <Link href="/" aria-label="Plugfolio home" className="relative">
          <Logo layout="reversed" />
        </Link>
        <div className="relative">
          <p className="font-display text-[38px] font-extrabold leading-[1.08] tracking-[-0.035em] text-white">
            {panel.h1}
            <br />
            <span className="text-brand-lime">{panel.h2}</span>
          </p>
          <p className="mt-[18px] max-w-[360px] text-[14.5px] leading-[1.6] text-white/85">
            {panel.desc}
          </p>
          <ul className="mt-[26px] flex flex-col gap-3.5">
            {panel.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-[11px]">
                <span
                  aria-hidden
                  className="bg-brand-lime/15 text-brand-lime inline-flex size-[22px] shrink-0 items-center justify-center rounded-[6px] text-xs font-extrabold"
                >
                  ✓
                </span>
                <span className="text-[14.5px] text-white/90">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative font-mono text-[11px] tracking-[0.1em] text-white/55">{panel.foot}</p>
      </div>

      {/* form column */}
      <div className="flex flex-1 flex-col justify-center px-[22px] pb-10 pt-8 lg:px-[52px] lg:py-11">
        <div className="mx-auto w-full max-w-[404px]">
          <Link
            href="/"
            aria-label="Plugfolio home"
            className="mb-[26px] inline-flex lg:hidden"
          >
            <Logo layout="horizontal" tone="auto" />
          </Link>
          {children}
        </div>
      </div>
    </main>
  );
}
