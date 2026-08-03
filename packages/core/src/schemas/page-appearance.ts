import { z } from "zod";

/**
 * Creator page appearance (ADR-0017) — a closed set of named choices, never a
 * theme editor. The lists are closed on purpose: every accent is measured
 * against white label text, so no setting a creator can express is able to
 * break the Buy button on their own page.
 */

/** Contrast on white label text: violet 5.70 · indigo 7.90 · coral 5.09 ·
 *  forest 6.50 · magenta 6.28. All AA. Adding one means measuring it. */
export const pageAccent = z.enum(["violet", "indigo", "coral", "forest", "magenta"]);
export type PageAccent = z.infer<typeof pageAccent>;

/** compact = goods first · balanced = identity, shelves, posts · centred = profile. */
export const pageHeaderStyle = z.enum(["compact", "balanced", "centred"]);
export type PageHeaderStyle = z.infer<typeof pageHeaderStyle>;

/** grid = tight photo wall · cards = roomier, titled · list = one per row. */
export const pageGridStyle = z.enum(["grid", "cards", "list"]);
export type PageGridStyle = z.infer<typeof pageGridStyle>;

/** The cover treatment (ADR-0026): band = edge-to-edge · tile = inside the
 *  measure · split = accent panel + imagery · none = the accent strip.
 *  Unset derives from the header style (compact→none, else tile). */
export const pageCoverStyle = z.enum(["band", "tile", "split", "none"]);
export type PageCoverStyle = z.infer<typeof pageCoverStyle>;

/** The links row: mono label pills (the v2 default) or icon circles. */
export const pageLinkMode = z.enum(["labels", "icons"]);
export type PageLinkMode = z.infer<typeof pageLinkMode>;

/** The stored-null cover resolves against the header style, not a constant. */
export function resolveCoverStyle(
  cover: PageCoverStyle | null,
  headerStyle: PageHeaderStyle,
): PageCoverStyle {
  return cover ?? (headerStyle === "compact" ? "none" : "tile");
}

export const PAGE_APPEARANCE_DEFAULTS = {
  accent: "violet",
  headerStyle: "balanced",
  gridStyle: "grid",
  linkMode: "labels",
} as const satisfies {
  accent: PageAccent;
  headerStyle: PageHeaderStyle;
  gridStyle: PageGridStyle;
  linkMode: PageLinkMode;
};

/** The greeting is one line above the name; longer than this is a bio. */
export const pageGreeting = z.string().trim().min(1).max(80);
