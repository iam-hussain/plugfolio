import type { ProfileLinkView } from "@plugfolio/core";

export type SocialLink = {
  platform: ProfileLinkView["platform"];
  href: string;
  label: string;
};

/**
 * "Your links" → the socials row (design-out: required on every creator
 * header). Label = the platform; the website reads as its hostname.
 *
 * Shared by the creator route (which feeds the hrefs into JSON-LD `sameAs`) and
 * the view (which renders the row), so the two never drift apart.
 */
export function toSocials(links: readonly ProfileLinkView[]): SocialLink[] {
  return links.map((link) => ({
    platform: link.platform,
    href: link.url,
    label:
      link.platform === "website"
        ? new URL(link.url).hostname.replace(/^www\./, "")
        : link.platform.charAt(0).toUpperCase() + link.platform.slice(1),
  }));
}
