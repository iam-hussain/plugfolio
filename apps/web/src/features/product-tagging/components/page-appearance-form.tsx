"use client";

import type { PageAccent, PageGridStyle, PageHeaderStyle } from "@plugfolio/core";
import { Button, Input, Label, cn } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateProfileIdentity } from "../api";

/**
 * How the creator's page looks (ADR-0017) — the whole surface, and it's meant
 * to stay this small. Five accents, three header treatments, three grid
 * layouts, one greeting line. No custom colours, fonts or section order: the
 * lists are closed *because* they're closed, so nothing a creator picks can
 * make the Buy button on their own page fail AA.
 *
 * Admin-only, like the rest of profile identity — a Manager gets the picture.
 */
export type PageAppearanceFormProps = {
  profileId: string;
  /**
   * Already past the defaults. Resolving them here would mean importing a
   * value from `@plugfolio/core`, and a value import in a client component
   * drags the whole domain — node:crypto and all — into the browser bundle.
   */
  appearance: {
    accent: PageAccent;
    headerStyle: PageHeaderStyle;
    gridStyle: PageGridStyle;
    greeting: string | null;
  };
  role: "admin" | "manager";
};

/** The swatch classes are literal so the JIT can see them (§8). */
const ACCENTS: readonly { value: PageAccent; label: string; swatch: string }[] = [
  { value: "violet", label: "Violet", swatch: "bg-[#7C3AED]" },
  { value: "indigo", label: "Indigo", swatch: "bg-[#4338CA]" },
  { value: "coral", label: "Coral", swatch: "bg-[#CC3626]" },
  { value: "forest", label: "Forest", swatch: "bg-[#146B4A]" },
  { value: "magenta", label: "Magenta", swatch: "bg-[#B31D74]" },
];

const HEADERS: readonly { value: PageHeaderStyle; label: string; note: string }[] = [
  { value: "compact", label: "Compact", note: "Goods first. Everything tightens; nothing is dropped." },
  { value: "balanced", label: "Balanced", note: "Identity, then shelves, then posts." },
  { value: "centred", label: "Centred", note: "Big avatar, centred. Reads as a profile." },
];

const GRIDS: readonly { value: PageGridStyle; label: string; note: string }[] = [
  { value: "grid", label: "Grid", note: "Tight photo grid. Most posts on screen." },
  { value: "cards", label: "Cards", note: "Roomier, with the post title under each." },
  { value: "list", label: "List", note: "One per row. Easiest to scan on a phone." },
];

export function PageAppearanceForm({ profileId, appearance, role }: PageAppearanceFormProps) {
  const router = useRouter();
  const [accent, setAccent] = useState<PageAccent>(appearance.accent);
  const [headerStyle, setHeaderStyle] = useState<PageHeaderStyle>(appearance.headerStyle);
  const [gridStyle, setGridStyle] = useState<PageGridStyle>(appearance.gridStyle);
  const [greeting, setGreeting] = useState(appearance.greeting ?? "");
  const isAdmin = role === "admin";

  const save = useMutation({
    mutationFn: () =>
      updateProfileIdentity(profileId, {
        accent,
        headerStyle,
        gridStyle,
        greeting: greeting.trim() || null,
      }),
    onSuccess: () => router.refresh(),
  });

  if (!isAdmin) {
    return (
      <p className="text-muted-foreground text-sm">
        How the page looks is the Admin&apos;s to set.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="text-[13px] font-bold">Accent</legend>
        <p className="text-muted-foreground text-xs">
          Five, and only five — each one is checked to stay readable behind white text.
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {ACCENTS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setAccent(option.value)}
              aria-pressed={accent === option.value}
              className={cn(
                "rounded-pill inline-flex min-h-11 items-center gap-2 border px-3.5 text-[13px] font-semibold transition-colors",
                accent === option.value
                  ? "border-foreground bg-active"
                  : "border-border text-muted-foreground hover:border-primary",
              )}
            >
              <span aria-hidden className={cn("size-3.5 rounded-pill", option.swatch)} />
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <Choice
        legend="Header"
        options={HEADERS}
        value={headerStyle}
        onPick={(next) => setHeaderStyle(next)}
      />
      <Choice
        legend="Post layout"
        options={GRIDS}
        value={gridStyle}
        onPick={(next) => setGridStyle(next)}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="appearance-greeting">Greeting (optional)</Label>
        <Input
          id="appearance-greeting"
          value={greeting}
          onChange={(event) => setGreeting(event.target.value)}
          maxLength={80}
          placeholder="Hey — glad you found me."
        />
        <p className="text-muted-foreground text-xs">One line above your name. Leave it empty for none.</p>
      </div>

      {save.isError ? (
        <p role="alert" className="text-destructive text-xs">
          {save.error.message}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {save.isSuccess ? "Saved — live on your page." : "Changes show on your public page."}
        </p>
        <Button type="submit" size="sm" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save look"}
        </Button>
      </div>
    </form>
  );
}

/** A radio group that reads as cards — the note is why you'd pick it. */
function Choice<T extends string>({
  legend,
  options,
  value,
  onPick,
}: {
  legend: string;
  options: readonly { value: T; label: string; note: string }[];
  value: T;
  onPick: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-[13px] font-bold">{legend}</legend>
      <div className="mt-1 grid gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPick(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              "rounded-image border p-3 text-left transition-colors",
              value === option.value
                ? "border-primary bg-active"
                : "border-border hover:border-primary",
            )}
          >
            <b className="block text-[13px] font-bold">{option.label}</b>
            <span className="text-muted-foreground mt-1 block text-xs leading-[1.4]">
              {option.note}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
