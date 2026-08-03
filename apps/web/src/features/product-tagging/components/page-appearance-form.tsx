"use client";

import type {
  PageAccent,
  PageCoverStyle,
  PageGridStyle,
  PageHeaderStyle,
  PageLinkMode,
} from "@plugfolio/core";
import { Button, Input, Label } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateProfileIdentity } from "../api";
import { cva } from "class-variance-authority";

/** The accent picker's chips — the dot inside carries the colour, not this. */
const accentChip = cva(
  "rounded-pill inline-flex min-h-11 items-center gap-2 border px-3.5 text-label font-semibold transition-colors",
  {
    variants: {
      selected: {
        true: "border-foreground bg-active",
        false: "border-border text-muted-foreground hover:border-primary",
      },
    },
    defaultVariants: { selected: false },
  },
);

/** Header-style and grid-style options: a card, held when it's the current one. */
const layoutCard = cva("rounded-image border p-3 text-left transition-colors", {
  variants: {
    selected: { true: "border-primary bg-active", false: "border-border hover:border-primary" },
  },
  defaultVariants: { selected: false },
});

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
    coverStyle: PageCoverStyle;
    linkMode: PageLinkMode;
    greeting: string | null;
  };
  role: "admin" | "manager";
};

/**
 * The five accents (ADR-0017). No swatch colour is written here: each dot wears
 * its own `data-accent`, which is the same scope the creator's page uses, and
 * fills with `bg-primary`. So the dot literally renders the token the choice
 * sets — the swatch cannot drift from the result, which a hardcoded hex per
 * option did the moment either side moved.
 */
const ACCENTS: readonly { value: PageAccent; label: string }[] = [
  { value: "violet", label: "Violet" },
  { value: "indigo", label: "Indigo" },
  { value: "coral", label: "Coral" },
  { value: "forest", label: "Forest" },
  { value: "magenta", label: "Magenta" },
];

const HEADERS: readonly { value: PageHeaderStyle; label: string; note: string }[] = [
  {
    value: "compact",
    label: "Compact",
    note: "Goods first. Everything tightens; nothing is dropped.",
  },
  { value: "balanced", label: "Balanced", note: "Identity, then shelves, then posts." },
  { value: "centred", label: "Centred", note: "Big avatar, centred. Reads as a profile." },
];

const GRIDS: readonly { value: PageGridStyle; label: string; note: string }[] = [
  { value: "grid", label: "Grid", note: "Tight photo grid. Most posts on screen." },
  { value: "cards", label: "Cards", note: "Roomier, with the post title under each." },
  { value: "list", label: "List", note: "One per row. Easiest to scan on a phone." },
];

const COVERS: readonly { value: PageCoverStyle; label: string; note: string }[] = [
  { value: "band", label: "Band", note: "Edge to edge, with your accent's baseline." },
  { value: "tile", label: "Tile", note: "A framed cover inside the page column." },
  { value: "split", label: "Split", note: "Your accent panel beside the imagery." },
  { value: "none", label: "None", note: "Straight to the goods — just the accent strip." },
];

const LINK_MODES: readonly { value: PageLinkMode; label: string; note: string }[] = [
  { value: "labels", label: "Text", note: "Named pills — Instagram, YouTube, your site." },
  { value: "icons", label: "Icons", note: "Circles. Quieter, if the row got long." },
];

export function PageAppearanceForm({ profileId, appearance, role }: PageAppearanceFormProps) {
  const router = useRouter();
  const [accent, setAccent] = useState<PageAccent>(appearance.accent);
  const [headerStyle, setHeaderStyle] = useState<PageHeaderStyle>(appearance.headerStyle);
  const [gridStyle, setGridStyle] = useState<PageGridStyle>(appearance.gridStyle);
  const [coverStyle, setCoverStyle] = useState<PageCoverStyle>(appearance.coverStyle);
  const [linkMode, setLinkMode] = useState<PageLinkMode>(appearance.linkMode);
  const [greeting, setGreeting] = useState(appearance.greeting ?? "");
  const isAdmin = role === "admin";

  const save = useMutation({
    mutationFn: () =>
      updateProfileIdentity(profileId, {
        accent,
        headerStyle,
        gridStyle,
        coverStyle,
        linkMode,
        greeting: greeting.trim() || null,
      }),
    onSuccess: () => router.refresh(),
  });

  if (!isAdmin) {
    return (
      <p className="text-muted-foreground text-copy">
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
        <legend className="text-label font-bold">Accent</legend>
        <p className="text-muted-foreground text-micro">
          Five, and only five — each one is checked to stay readable behind white text.
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {ACCENTS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setAccent(option.value)}
              aria-pressed={accent === option.value}
              className={accentChip({ selected: accent === option.value })}
            >
              <span
                aria-hidden
                data-accent={option.value}
                className="bg-primary rounded-pill size-3.5"
              />
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
        legend="Cover treatment"
        options={COVERS}
        value={coverStyle}
        onPick={(next) => setCoverStyle(next)}
      />
      <Choice
        legend="Wall layout"
        options={GRIDS}
        value={gridStyle}
        onPick={(next) => setGridStyle(next)}
      />
      <Choice
        legend="Link row"
        options={LINK_MODES}
        value={linkMode}
        onPick={(next) => setLinkMode(next)}
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
        <p className="text-muted-foreground text-micro">
          One line above your name. Leave it empty for none.
        </p>
      </div>

      {save.isError ? (
        <p role="alert" className="text-destructive text-micro">
          {save.error.message}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-micro">
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
      <legend className="text-label font-bold">{legend}</legend>
      <div className="mt-1 grid gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPick(option.value)}
            aria-pressed={value === option.value}
            className={layoutCard({ selected: value === option.value })}
          >
            <b className="text-label block font-bold">{option.label}</b>
            <span className="text-muted-foreground text-micro mt-1 block leading-[1.4]">
              {option.note}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
