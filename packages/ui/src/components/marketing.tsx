import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

/** A line in the illustrated collab thread — yours, or the other side's. */
const chatBubble = cva("rounded-tile text-copy m-0 max-w-[82%] px-[17px] py-[13px] leading-[1.5]", {
  variants: {
    from: {
      you: "bg-foreground text-background justify-self-end",
      them: "bg-card border-border text-muted-foreground border",
    },
  },
  defaultVariants: { from: "them" },
});

/**
 * The marketing vocabulary (DESIGN how-it-works.html / for-creators.html /
 * for-business.html) — the persuade surfaces.
 *
 * The rule these all follow: show the real component rather than describing
 * it. A screenshot of a feature is a claim; the feature itself is evidence.
 */

/* ── The loop (how-it-works) ───────────────────────────────────────────── */

/** Three steps across, each a real artefact rather than an illustration. */
export function LoopSteps({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-[clamp(22px,3vw,34px)] grid gap-4 min-[860px]:grid-cols-3 min-[860px]:gap-5">
      {children}
    </div>
  );
}

export function LoopStep({
  n,
  title,
  children,
  artefact,
}: {
  n: number;
  title: React.ReactNode;
  children: React.ReactNode;
  artefact: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "[&_[data-artefact]]:transition-transform [&_[data-artefact]]:duration-300 [&_[data-artefact]]:ease-design",
        "[&:nth-child(1)_[data-artefact]]:rotate-[-1.6deg] [&:nth-child(2)_[data-artefact]]:rotate-[1.4deg] [&:nth-child(3)_[data-artefact]]:rotate-[-1deg]",
        "[&:hover_[data-artefact]]:-translate-y-1.5 [&:hover_[data-artefact]]:rotate-0",
      )}
    >
      {artefact}
      <div className="flex items-baseline gap-2.5 px-1.5 pb-0.5 pt-3">
        <span className="bg-foreground text-background text-micro grid size-[26px] flex-none place-items-center rounded-pill font-bold">
          {n}
        </span>
        <div>
          <b className="font-display text-label font-bold tracking-[-0.01em]">{title}</b>
          <p className="text-muted-foreground text-copy mt-1 leading-[1.5]">{children}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * The retailer step is deliberately **not** a Plugfolio surface. The first
 * attempt said so with an empty dashed box, which read as a card that failed
 * to load rather than as a boundary — so it now shows the thing you actually
 * land on: the product, on someone else's shop, with their own buy button.
 * The dashed edge stays as the only cue that this frame isn't ours.
 */
export function RetailerFrame({
  children,
  name,
  note,
  buy = "Add to bag",
}: {
  children: React.ReactNode;
  name: React.ReactNode;
  note?: React.ReactNode;
  buy?: React.ReactNode;
}) {
  return (
    <div className="border-border rounded-image bg-background relative overflow-hidden border border-dashed">
      {children}
      <div className="flex items-center gap-2.5 px-[15px] pb-3.5 pt-[13px]">
        <div className="min-w-0">
          <b className="text-copy block font-bold">{name}</b>
          {note ? <span className="text-faint text-micro">{note}</span> : null}
        </div>
        {/* Their button, not ours — outlined and quiet, so it never reads as a
            Plugfolio action a shopper could take from this page. */}
        <span className="border-border text-muted-foreground text-micro ml-auto whitespace-nowrap rounded-pill border px-3.5 py-[7px] font-bold">
          {buy}
        </span>
      </div>
    </div>
  );
}

/* ── FAQ ───────────────────────────────────────────────────────────────── */

/** Native `<details>` — it works with no JS, and search engines read it. */
export function Faq({ children }: { children: React.ReactNode }) {
  return <div className="border-border mt-[clamp(20px,3vw,30px)] border-t">{children}</div>;
}

export function FaqItem({ q, children }: { q: React.ReactNode; children: React.ReactNode }) {
  return (
    <details className="border-border group border-b">
      <summary className="font-display text-label flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-0.5 py-[18px] font-bold tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
        {q}
        <span aria-hidden className="text-muted-foreground text-title leading-none">
          <span className="group-open:hidden">+</span>
          <span className="hidden group-open:inline">–</span>
        </span>
      </summary>
      <p className="text-muted-foreground text-copy mx-0.5 mb-5 max-w-[62ch] leading-[1.6]">
        {children}
      </p>
    </details>
  );
}

/* ── for-creators ──────────────────────────────────────────────────────── */

/**
 * The handle claim. Scarcity here is real — a handle is proved by a connected
 * social — so it is *stated*, not dramatised. No countdown, no "3 left".
 */
export function HandleClaim({
  prefix = "plugfolio.com/",
  handle,
  action,
}: {
  prefix?: string;
  handle: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <div className="border-border bg-card mt-[clamp(20px,3vw,28px)] flex min-h-[62px] items-center gap-0.5 rounded-pill border py-1.5 pl-5 pr-2">
      <span className="text-faint text-copy whitespace-nowrap">{prefix}</span>
      <span className="text-copy text-foreground font-bold">{handle}</span>
      <span className="ml-auto whitespace-nowrap">{action}</span>
    </div>
  );
}

/** Attribution: one post, one measured number, one honesty label. */
export function ProofRow({
  thumb,
  figure,
  caption,
  flag,
}: {
  thumb: React.ReactNode;
  figure: React.ReactNode;
  caption: React.ReactNode;
  /** "Tracked" — the label that keeps a measured number honest. */
  flag?: React.ReactNode;
}) {
  return (
    <div className="border-border bg-card rounded-tile mt-[clamp(20px,3vw,28px)] flex items-center gap-4 border p-4 pr-5">
      <span className="rounded-image bg-active size-16 flex-none overflow-hidden">{thumb}</span>
      <span className="min-w-0">
        <b className="font-display text-title block font-bold tracking-[-0.02em] tabular-nums">
          {figure}
        </b>
        <span className="text-faint text-micro mt-0.5 block font-semibold uppercase tracking-[0.06em]">
          {caption}
        </span>
      </span>
      {flag ? (
        <span className="bg-accent text-accent-foreground text-micro ml-auto rounded-pill px-3 py-1.5 font-bold uppercase tracking-[0.06em]">
          {flag}
        </span>
      ) : null}
    </div>
  );
}

/**
 * The limit gets a panel of its own. Creators have been burned by platforms
 * that hold funds, so saying "we never touch your money" first is a
 * differentiator, not fine print.
 */
export function LimitPanel({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-active rounded-tile mt-[clamp(24px,3.5vw,34px)] px-6 py-[22px]">
      <b className="font-display text-title text-primary block font-bold tracking-[-0.02em]">
        {title}
      </b>
      <p className="text-muted-foreground text-copy mt-2 leading-[1.6]">{children}</p>
    </div>
  );
}

/* ── for-business ──────────────────────────────────────────────────────── */

/** A brief, as a piece of paper — tilted, on the paper radius. */
export function BriefCard({
  eyebrow,
  title,
  children,
  meta,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <div className="shadow-rest rounded-paper bg-card text-foreground max-w-[460px] rotate-[-1.2deg] px-6 py-[22px]">
      {eyebrow ? (
        <span className="text-faint text-micro font-semibold uppercase tracking-[0.06em]">
          {eyebrow}
        </span>
      ) : null}
      <b className="font-display text-title my-2 block font-bold tracking-[-0.02em]">{title}</b>
      <p className="text-muted-foreground text-copy m-0 leading-[1.55]">{children}</p>
      {meta ? (
        <div className="border-border mt-[18px] flex items-center gap-2 border-t pt-3.5">{meta}</div>
      ) : null}
    </div>
  );
}

/**
 * One thread. A *shape*, not a screenshot — it says "this is where it all
 * happens" without inventing a conversation nobody had.
 */
export function CollabThread({ children }: { children: React.ReactNode }) {
  return <div className="mt-[clamp(22px,3vw,32px)] grid gap-2.5">{children}</div>;
}

export function CollabBubble({
  from = "them",
  children,
}: {
  from?: "them" | "you" | "deal";
  children: React.ReactNode;
}) {
  if (from === "deal") {
    return (
      <p className="bg-accent text-accent-foreground text-copy m-0 justify-self-center rounded-pill px-[22px] py-[11px] text-center font-bold leading-[1.5]">
        {children}
      </p>
    );
  }
  return (
    <p
      className={chatBubble({ from })}
    >
      {children}
    </p>
  );
}

/**
 * What this deliberately isn't. Dashed, because it's a boundary rather than a
 * feature — and stating the exclusions up front is what stops a business
 * arriving expecting a campaign suite.
 */
export function Exclusions({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border rounded-tile mt-[clamp(24px,3.5vw,34px)] border border-dashed px-6 py-[22px]">
      <b className="font-display text-label block font-bold tracking-[-0.01em]">{title}</b>
      <ul className="text-muted-foreground text-copy mt-3 list-disc pl-5 leading-[1.6]">
        {children}
      </ul>
    </div>
  );
}
