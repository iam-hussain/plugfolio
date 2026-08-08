import { SITE_NAME, SITE_URL } from "./site";

/**
 * schema.org builders shared across the public surfaces (SEO/AEO). Each returns
 * a plain object for `<JsonLd>`; every value must already be visible on the page
 * it decorates. See per-page usage in the (public) routes.
 */

/** JSON-LD wants absolute URLs; page media may be a site-relative path. */
function absoluteUrl(url: string | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}

/** A trail of pages, absolute-URL'd — powers breadcrumb rich results. */
export function breadcrumbList(items: readonly { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** A Q&A block — the strongest AEO signal, so answer engines can quote it. */
export function faqPage(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/**
 * A creator's ProfilePage + breadcrumb `@graph` (SEO/AEO) — public facts only,
 * nothing session-derived. `sameAs` ties this page to the creator's other
 * platforms, which is how entity/answer engines connect them to one person.
 */
export function profilePage(
  page: {
    username: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
  },
  socials: readonly { href: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/${page.username}`,
        mainEntity: {
          "@type": "Person",
          name: page.displayName ?? `@${page.username}`,
          alternateName: `@${page.username}`,
          identifier: page.username,
          url: `${SITE_URL}/${page.username}`,
          ...(page.bio ? { description: page.bio } : {}),
          ...(page.avatarUrl?.startsWith("http") ? { image: page.avatarUrl } : {}),
          ...(socials.length > 0 ? { sameAs: socials.map((social) => social.href) } : {}),
        },
      },
      breadcrumbList([
        { name: SITE_NAME, path: "/" },
        { name: `@${page.username}`, path: `/${page.username}` },
      ]),
    ],
  };
}

/**
 * A tagged product as a schema.org Product, with an Offer when the tagged price
 * is known (SEO/AEO). Only what the page already shows — the price is the
 * display price, the image is the one on screen.
 */
export function product(args: {
  title: string;
  imageUrl: string | null;
  priceCents: number | null;
  currency: string;
  /** The creator's @handle, shown as the brand. */
  creatorUsername: string;
  /** Site-relative path to the product page. */
  path: string;
}) {
  const image = absoluteUrl(args.imageUrl);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: args.title,
    ...(image ? { image } : {}),
    description: `${args.title}, tagged by @${args.creatorUsername} on ${SITE_NAME}.`,
    brand: { "@type": "Brand", name: `@${args.creatorUsername}` },
    ...(args.priceCents !== null
      ? {
          offers: {
            "@type": "Offer",
            price: (args.priceCents / 100).toFixed(2),
            priceCurrency: args.currency.toUpperCase(),
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}${args.path}`,
          },
        }
      : {}),
  };
}
