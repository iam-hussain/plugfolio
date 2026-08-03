"use client";

import type {
  PageAccent,
  PageCoverStyle,
  PageGridStyle,
  PageHeaderStyle,
  PageLinkMode,
} from "@plugfolio/core";
import { useMutation } from "@tanstack/react-query";
import { cva } from "class-variance-authority";
import { useRouter } from "next/navigation";
import { useState } from "react";
// A leaf import, not the product-tagging barrel — the barrel drags the
// dashboard shell (and through core, node:crypto) into this client bundle.
import { updateProfileIdentity } from "@/features/product-tagging/api";

/**
 * The live look panel (v2, `Plugfolio v2.dc.html` §creator owner band) — the
 * page's own customiser, inline under "Change the look": accent, header,
 * cover treatment, wall layout, link row, and the links themselves. Changes
 * land on the page AS YOU PICK — each pick saves and refreshes, so the page
 * behind the panel is always the truth, never a preview.
 *
 * The set is closed on purpose (ADR-0017/0026): nothing here can pick a value
 * that breaks the Buy button on this page.
 */
type Appearance = {
  accent: PageAccent;
  headerStyle: PageHeaderStyle;
  gridStyle: PageGridStyle;
  coverStyle: PageCoverStyle;
  linkMode: PageLinkMode;
};

const eyebrow = "text-faint text-pico tracking-eyebrow font-mono font-bold uppercase";

const chip = cva(
  "rounded-md text-label inline-flex min-h-10 items-center border px-[15px] font-semibold transition-colors",
  {
    variants: {
      on: {
        true: "bg-primary text-primary-foreground border-transparent",
        false: "border-border-strong text-foreground/80 hover:border-primary hover:text-primary",
      },
    },
    defaultVariants: { on: false },
  },
);

const accentChip = cva(
  "text-pico tracking-eyebrow rounded-pill inline-flex min-h-9 items-center gap-[7px] border px-[13px] font-mono font-bold uppercase transition-colors",
  {
    variants: {
      on: {
        // Scoped by its own data-accent, so the fill IS the option's colour.
        true: "bg-primary text-primary-foreground border-transparent",
        false: "border-border-strong text-muted-foreground hover:border-primary",
      },
    },
    defaultVariants: { on: false },
  },
);

const ACCENTS: readonly { value: PageAccent; label: string }[] = [
  { value: "violet", label: "Violet" },
  { value: "indigo", label: "Indigo" },
  { value: "coral", label: "Coral" },
  { value: "forest", label: "Forest" },
  { value: "magenta", label: "Magenta" },
];
const HEADERS: readonly PageHeaderStyle[] = ["compact", "balanced", "centred"];
const COVERS: readonly PageCoverStyle[] = ["band", "tile", "split", "none"];
const GRIDS: readonly PageGridStyle[] = ["grid", "cards", "list"];

const label = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function LookPanel({
  profileId,
  appearance,
}: {
  profileId: string;
  appearance: Appearance;
}) {
  const router = useRouter();
  // Optimistic per-axis: the chip flips on the tap; the refreshed page (the
  // real thing behind this panel) is the truth it lands back on.
  const [look, setLook] = useState<Appearance>(appearance);
  const save = useMutation({
    mutationFn: (patch: Partial<Appearance>) => updateProfileIdentity(profileId, patch),
    onSuccess: () => router.refresh(),
  });
  const pick = <K extends keyof Appearance>(axis: K, value: Appearance[K]) => {
    setLook((current) => ({ ...current, [axis]: value }));
    save.mutate({ [axis]: value });
  };

  return (
    <div className="border-border mt-3.5 border-t pt-3.5">
      <p className={eyebrow}>Accent — every option is guaranteed readable behind label text</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {ACCENTS.map((option) => (
          <button
            key={option.value}
            type="button"
            data-accent={option.value}
            aria-pressed={look.accent === option.value}
            onClick={() => pick("accent", option.value)}
            className={accentChip({ on: look.accent === option.value })}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className={`${eyebrow} mt-4`}>Header</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {HEADERS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={look.headerStyle === value}
            onClick={() => pick("headerStyle", value)}
            className={chip({ on: look.headerStyle === value })}
          >
            {label(value)}
          </button>
        ))}
      </div>

      <p className={`${eyebrow} mt-4`}>Cover treatment</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {COVERS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={look.coverStyle === value}
            onClick={() => pick("coverStyle", value)}
            className={chip({ on: look.coverStyle === value })}
          >
            {label(value)}
          </button>
        ))}
      </div>

      <p className={`${eyebrow} mt-4`}>Wall layout</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {GRIDS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={look.gridStyle === value}
            onClick={() => pick("gridStyle", value)}
            className={chip({ on: look.gridStyle === value })}
          >
            {label(value)}
          </button>
        ))}
      </div>

      <p className={`${eyebrow} mt-[18px]`}>Link row — icons or text</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {(
          [
            { value: "icons", label: "Icons" },
            { value: "labels", label: "Text" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={look.linkMode === option.value}
            onClick={() => pick("linkMode", option.value)}
            className={chip({ on: look.linkMode === option.value })}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className={`${eyebrow} mt-[18px]`}>Your links — the row under your name</p>
      <p className="text-muted-foreground text-label mt-2 leading-[1.55]">
        Links are data, and data lives in one place —{" "}
        <a
          href={`/dashboard/settings?profile=${profileId}`}
          className="text-primary font-semibold no-underline hover:underline"
        >
          edit them in Settings →
        </a>
      </p>

      {save.isError ? (
        <p role="alert" className="text-destructive text-micro mt-3">
          That didn&apos;t save — try the pick again.
        </p>
      ) : null}
      <p className="text-faint text-label mt-3.5 leading-[1.55]">
        Changes are live on this page as you pick. No fonts, no backgrounds, no custom colours —
        every combination is guaranteed to work.
      </p>
    </div>
  );
}
