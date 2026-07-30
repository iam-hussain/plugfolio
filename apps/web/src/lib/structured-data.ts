import { SITE_URL } from "./site";

/**
 * schema.org builders shared across the public surfaces (SEO/AEO). Each returns
 * a plain object for `<JsonLd>`; every value must already be visible on the page
 * it decorates. See per-page usage in the (public) routes.
 */

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
