/**
 * A single JSON-LD structured-data block for search & answer engines (SEO/AEO).
 * Server-rendered into `<head>`-adjacent markup; the data is a plain schema.org
 * object. Only ever fed values already on the page — structured data must never
 * claim something the visible page doesn't (Google's own rule, and the honest
 * one). Emitting via `dangerouslySetInnerHTML` is the standard, safe way to ship
 * a JSON-LD script — the payload is our own serialized object, not user HTML.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
