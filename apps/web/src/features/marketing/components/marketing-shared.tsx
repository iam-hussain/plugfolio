import { Button, cn, measure, ProductTag } from "@plugfolio/ui";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

/**
 * Shared vocabulary for the marketing pages (/how-it-works, /for-creators,
 * /for-business), on the v2 system (ADR-0026): white canvas, Sora headlines,
 * mono eyebrows, bordered cards, real tagged-post artefacts. All colour and
 * type from tokens; positions are literal utility classes, never inline style.
 */
export const mk = {
  main: cn(measure({ width: "narrow" }), "pb-[clamp(56px,9vw,96px)]"),
  eyebrow: "font-mono text-pico font-bold uppercase tracking-eyebrow text-faint",
  h1: "font-display mt-2.5 text-display-xl font-bold tracking-[-0.05em]",
  lede: "text-muted-foreground mt-4 max-w-[52ch] text-body leading-[1.6]",
  cta: "mt-7 flex flex-wrap items-center gap-3",
  band: "mt-[clamp(48px,8vw,88px)]",
  h2: "font-display text-display-lg font-bold leading-[1.12] tracking-[-0.04em]",
  copy: "text-muted-foreground mt-3 max-w-[62ch] text-copy leading-[1.6]",
} as const;

/** Kept for call-site compatibility; v2 retired the tile hues (ADR-0026 §3). */
type TileTone = "butter" | "mint" | "sky" | "lavender" | "coral" | "blush";

type Tag = {
  name?: string;
  price: string;
  tone?: "affiliate" | "offer" | "own";
  /** Literal position utilities, e.g. "left-[8%] top-[24%]" (JIT-visible). */
  pos: string;
};

/**
 * The signature artefact — a real tagged post (the price pill is the actual
 * control, not a drawing of one). v2: a plain bordered card, no mat, no tilt.
 * `tone`/`wrap` survive so call sites keep compiling; neither changes anything.
 */
export function PostCard({
  tone: _tone,
  photo,
  alt,
  tags,
  footer,
  square,
  wrap: _wrap,
}: {
  tone: TileTone;
  photo: string;
  alt: string;
  tags: readonly Tag[];
  footer?: { avatar: string; count: string };
  /** 4/3 landscape (the loop) instead of the default 4/5 portrait. */
  square?: boolean;
  wrap?: string;
}) {
  return (
    <div className="border-border-strong bg-card rounded-sheet border p-2.5 shadow-[0_22px_44px_-20px_rgba(18,16,28,.28)]">
      <div className="relative">
        <div className="rounded-lg overflow-hidden">
          <Image
            src={`/landing/posts/${photo}.jpg`}
            alt={alt}
            width={900}
            height={square ? 675 : 1125}
            sizes="360px"
            className={`block w-full object-cover ${square ? "aspect-[4/3]" : "aspect-[4/5]"}`}
          />
        </div>
        {tags.map((tag) => (
          <ProductTag
            key={tag.price + tag.pos}
            tone={tag.tone ?? "affiliate"}
            name={tag.name ?? ""}
            price={tag.price}
            className={`absolute ${tag.pos}`}
          />
        ))}
      </div>
      {footer ? (
        <div className="mt-2 flex items-center justify-between px-1 pb-0.5">
          <Image
            src={`/landing/avatars/${footer.avatar}.jpg`}
            alt=""
            width={60}
            height={60}
            className="rounded-pill size-7 object-cover"
          />
          <span className="bg-active text-muted-foreground rounded-pill text-nano px-2.5 py-1 font-mono font-semibold">
            {footer.count}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/**
 * A band whose payload is one capped object — a widget, a card, a stat
 * (DESIGN mk-band--split). From 900px the prose sits in a 5fr left column and
 * the artefact fills a 6fr right column, vertically centred; below that it
 * stacks. Left alone the object floated in a half-empty row and read as a
 * broken layout — the split gives both sides a reason to be where they are.
 */
export function SplitBand({
  title,
  lead,
  children,
}: {
  title: string;
  /** The left column's prose — one or more <p className={mk.copy}> paragraphs. */
  lead: React.ReactNode;
  /** The right-column artefact. */
  children: React.ReactNode;
}) {
  return (
    <section
      className={`${mk.band} min-[900px]:grid min-[900px]:grid-cols-[5fr_6fr] min-[900px]:items-center min-[900px]:gap-x-[clamp(32px,5vw,72px)]`}
    >
      <div className="min-[900px]:col-start-1 min-[900px]:row-start-1">
        <h2 className={mk.h2}>{title}</h2>
        {lead}
      </div>
      <div className="mt-6 min-[900px]:col-start-2 min-[900px]:row-start-1 min-[900px]:mt-0">
        {children}
      </div>
    </section>
  );
}

/** A named fact card (mk-fact) — a bold claim over one plain line. */
export function Fact({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-border bg-card rounded-sheet border p-6">
      <b className="font-display text-body block font-bold tracking-[-0.02em]">{title}</b>
      <p className="text-muted-foreground text-copy mt-2 leading-[1.55]">{children}</p>
    </div>
  );
}

/** A numbered step (mk-step) — dark ink badge, bold title, one line. */
export function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="border-border bg-card rounded-sheet border p-6">
      <span className="bg-brand-ink rounded-pill text-nano grid size-7 place-items-center font-mono font-bold text-white">
        {n}
      </span>
      <b className="font-display text-body mt-3.5 block font-bold tracking-[-0.02em]">{title}</b>
      <p className="text-muted-foreground text-copy mt-2 leading-[1.55]">{children}</p>
    </li>
  );
}

const DOORS = [
  {
    role: "shopper",
    micro: "For shoppers",
    title: "How it works",
    copy: "The whole loop, and what we can and can't measure.",
    go: "Read it",
    href: "/how-it-works",
  },
  {
    role: "creator",
    micro: "For creators",
    title: "Make your posts shoppable",
    copy: "Tag what's in your content and see which post drove the taps.",
    go: "See how",
    href: "/for-creators",
  },
  {
    role: "business",
    micro: "For business",
    title: "Find creators to work with",
    copy: "Post a brief or approach a creator directly, then agree terms in one thread.",
    go: "See how",
    href: "/for-business",
  },
] as const;

/**
 * "Here for something else?" — the cross-link band shared by every marketing
 * page, three role-coloured doors over the page's own CTA pair.
 */
export function MarketingDoors({
  primary,
  ghost,
  current,
}: {
  primary: { label: string; href: string };
  ghost: { label: string; href: string };
  /** The current page's href — its own door is dropped so it never self-links. */
  current?: string;
}) {
  const doors = DOORS.filter((door) => door.href !== current);
  return (
    <section className={mk.band}>
      <h2 className={mk.h2}>Here for something else?</h2>
      <div
        className={`mt-[clamp(24px,4vw,40px)] grid gap-4 ${doors.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
      >
        {doors.map((door) => (
          <Link
            key={door.href}
            href={door.href as Route}
            className="bg-card border-border hover:border-primary group/door rounded-sheet flex flex-col border p-6 no-underline transition-[transform,border-color] duration-150 hover:-translate-y-0.5"
          >
            <span className="text-primary text-pico tracking-eyebrow font-mono uppercase">
              {door.micro}
            </span>
            <h3 className="font-display text-title mt-2.5 font-bold tracking-[-0.03em]">
              {door.title}
            </h3>
            <p className="text-muted-foreground text-copy mt-2 leading-[1.55]">{door.copy}</p>
            <span className="text-primary text-label mt-auto flex items-center gap-1.5 pt-5 font-semibold">
              {door.go}
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover/door:translate-x-1"
              >
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
      <div className={mk.cta}>
        <Button asChild>
          <Link href={primary.href as Route}>{primary.label}</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href={ghost.href as Route}>{ghost.label}</Link>
        </Button>
      </div>
    </section>
  );
}

// The footer used to live here. It's now the one `SiteFooter` in
// components/chrome/ — every surface wears the same one (DESIGN `.foot`).
