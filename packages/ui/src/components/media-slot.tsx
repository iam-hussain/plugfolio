"use client";

import * as React from "react";
import { ExternalLink, Play } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { SocialGlyph, type SocialPlatform } from "./socials-row";

/**
 * The post's media slot (DESIGN post.html §.media / §.embed, ADR-0019).
 *
 * A post is often a reel, so this holds a still OR a video — and a video loads
 * as a **facade**: poster, play control, provider name. The real player is
 * fetched only when the shopper presses play.
 *
 * That is not a performance nicety. An iframe from YouTube, Instagram or TikTok
 * sets third-party cookies the moment it mounts, on a page a shopper reached
 * with no account and having agreed to nothing. Click-to-load means nothing is
 * sent to them until the shopper asks for the video — the same promise the rest
 * of the buy path makes.
 *
 * The tap-out link is always present, because in-app browsers (where most of
 * our traffic lives) regularly refuse to play an embed at all. When that
 * happens the page must still get the shopper to the video rather than sit
 * there broken.
 */
export type MediaKind = "still" | "youtube" | "instagram" | "tiktok";

const PROVIDER: Record<Exclude<MediaKind, "still">, { name: string; glyph: SocialPlatform }> = {
  youtube: { name: "YouTube", glyph: "youtube" },
  instagram: { name: "Instagram", glyph: "instagram" },
  tiktok: { name: "TikTok", glyph: "tiktok" },
};

/* Aspect is the provider's, not ours: a reel letterboxed into 16:9 wastes half
   the frame, and a landscape video cropped to 9:16 loses the subject. A reel is
   also narrower than the measure, so it takes the middle rather than stranding
   the column beside it. */
const frame = cva(
  "shadow-rest border-border rounded-bay bg-brand-ink relative block overflow-hidden border",
  {
    variants: {
      kind: {
        still: "",
        youtube: "aspect-video",
        instagram: "mx-auto aspect-[9/16] max-w-[420px]",
        tiktok: "mx-auto aspect-[9/16] max-w-[420px]",
      },
    },
  },
);

export type MediaSlotProps = {
  kind?: MediaKind;
  /** The still, or the poster frame for a video. Always present. */
  poster: string;
  alt: string;
  /** The provider's embed URL — never rendered until play is pressed. */
  embedUrl?: string | null;
  /** Where the video lives publicly; the always-present way out. */
  sourceUrl?: string | null;
  className?: string;
};

export function MediaSlot({
  kind = "still",
  poster,
  alt,
  embedUrl,
  sourceUrl,
  className,
}: MediaSlotProps) {
  const [playing, setPlaying] = React.useState(false);

  if (kind === "still" || !embedUrl) {
    return (
      <div className={cn("shadow-rest border-border rounded-bay bg-active overflow-hidden border", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- framework-free package; apps pass an optimised element via the post view when they need one */}
        <img src={poster} alt={alt} className="block max-h-[62vh] w-full object-cover" />
      </div>
    );
  }

  const provider = PROVIDER[kind];
  const portrait = kind === "instagram" || kind === "tiktok";

  return (
    <div className={cn(portrait && "text-center", className)}>
      <div className={frame({ kind })}>
        {playing ? (
          <iframe
            src={embedUrl}
            title={alt}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
            <img src={poster} alt={alt} className="absolute inset-0 size-full object-cover" />
            {/* The poster dims so white controls clear AA over ANY frame. */}
            <span aria-hidden className="bg-brand-ink/45 absolute inset-0" />
            {/* Named before the press, not after: a shopper about to hand a
                request to YouTube should be told it is YouTube while they can
                still decide. */}
            <span className="bg-brand-ink/45 text-micro absolute left-3 top-3 inline-flex items-center gap-[7px] rounded-pill px-[11px] py-1.5 font-bold uppercase tracking-[0.04em] text-white [&_svg]:size-3.5">
              <SocialGlyph platform={provider.glyph} />
              {provider.name}
            </span>
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="focus-visible:outline-accent absolute inset-0 grid w-full content-center justify-items-center gap-3.5 border-0 bg-transparent text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[5px]"
            >
              <span className="grid size-[72px] place-items-center rounded-pill bg-white/[0.16] shadow-[inset_0_0_0_2px_#FFFFFF] transition-transform duration-200 ease-design group-hover:scale-105 motion-reduce:transition-none">
                <Play className="ml-1 size-[26px]" fill="currentColor" strokeWidth={0} aria-hidden />
              </span>
              <b className="text-label font-bold">Play on {provider.name}</b>
            </button>
          </>
        )}
      </div>
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-muted-foreground hover:text-primary text-label mt-3 inline-flex min-h-11 items-center gap-[7px] font-semibold no-underline transition-colors",
            portrait && "justify-center",
          )}
        >
          <ExternalLink className="size-[15px]" aria-hidden />
          Watch on {provider.name} instead
        </a>
      ) : null}
    </div>
  );
}

/**
 * The caption belongs to the media, so it sits close to it — 18px — while the
 * next section gets a clear break. A portrait video is a 420px column in the
 * middle of the measure, and the caption follows that column rather than
 * running flush left under it, where it reads as a stray line beside the frame.
 */
export function PostCaption({
  children,
  portrait,
}: {
  children: React.ReactNode;
  portrait?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-muted-foreground text-copy mt-[18px] max-w-[62ch]",
        portrait && "mx-auto max-w-[420px]",
      )}
    >
      {children}
    </p>
  );
}
