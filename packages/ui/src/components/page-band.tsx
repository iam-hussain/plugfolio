import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * A full-width band under the header (DESIGN creator.html §.band-v / .band-biz)
 * — the owner's "this is your page", the tap count on a post, the business
 * "you run a brand" strip.
 *
 * It is deliberately not a Card: a band spans the measure and carries one
 * sentence plus one action, where a card is an object you might pick up.
 *
 * `tone="viewer"` is the soft violet-wash band a specific viewer sees;
 * `tone="surface"` is the hairline-on-white band that holds a form.
 */
const band = cva("rounded-tile mt-[18px] flex flex-wrap items-center gap-3 px-[18px] py-4", {
  variants: {
    tone: {
      viewer: "bg-active",
      surface: "bg-card border-border border",
    },
    layout: {
      row: "",
      // A band that holds a form stacks: the heading row, then the controls.
      stack: "flex-col items-stretch",
    },
  },
  defaultVariants: { tone: "viewer", layout: "row" },
});

export type PageBandProps = React.ComponentProps<"div"> & VariantProps<typeof band>;

export function PageBand({ tone, layout, className, ...props }: PageBandProps) {
  return <div className={cn(band({ tone, layout }), className)} {...props} />;
}

/** The band's sentence: a bold line, then the plain one under it. */
export function PageBandText({
  title,
  children,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <p className="text-copy m-0 min-w-0 flex-[1_1_240px]">
      <b className="text-label block font-bold">{title}</b>
      {children ? <span className="text-muted-foreground">{children}</span> : null}
    </p>
  );
}
