import type { MediaKind, PageAppearance } from "@plugfolio/core";
import { pageAccent, pageGridStyle, pageHeaderStyle } from "@plugfolio/core";

/**
 * Appearance columns are plain strings (ADR-0017: Mongo enums buy nothing), so
 * they're parsed on the way out. A value outside the set reads back as unset —
 * i.e. the default — rather than as something no component knows how to render.
 * That's the difference between a hand-edited row being harmless and being a
 * blank page.
 */
export type AppearanceRow = {
  accent: string | null;
  headerStyle: string | null;
  gridStyle: string | null;
  greeting: string | null;
};

export function readAppearance(row: AppearanceRow): PageAppearance {
  return {
    accent: pageAccent.safeParse(row.accent).data ?? null,
    headerStyle: pageHeaderStyle.safeParse(row.headerStyle).data ?? null,
    gridStyle: pageGridStyle.safeParse(row.gridStyle).data ?? null,
    greeting: row.greeting,
  };
}

/** Post media kind (ADR-0019) — unset reads as a still, so every pre-video row
 *  keeps working and an unknown value degrades to the photo rather than to a
 *  frame no component knows how to render. */
const MEDIA_KINDS = ["still", "youtube", "instagram", "tiktok"] as const;

export function readMediaKind(value: string | null): MediaKind {
  return (MEDIA_KINDS as readonly string[]).includes(value ?? "") ? (value as MediaKind) : "still";
}
