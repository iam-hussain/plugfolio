import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

/**
 * `/llms.txt` (llmstxt.org) — the map an AI agent or crawler reads to
 * understand this site: what Plugfolio is, the rules that shape it, and every
 * feature and page grouped by who it's for. Served as a route (not a static
 * file) so links stay bound to `SITE_URL` and its per-environment override,
 * exactly like `robots.ts` and `sitemap.ts`.
 *
 * Kept in sync by hand with `docs/design/product-overview.md` — that doc is the
 * source of truth for the feature set; this is its machine-readable digest.
 */
export const dynamic = "force-static";

function body(): string {
  const u = SITE_URL;
  return `# ${SITE_NAME}

> ${SITE_TAGLINE}. ${SITE_DESCRIPTION}

Plugfolio turns a creator's content into a page where every post is shoppable. A
creator tags the products that appear in a post and pins their affiliate or
own-store link to each; a follower arriving from the creator's Instagram/TikTok
bio taps a post, sees exactly what's in it, taps Buy, and lands on the retailer —
three taps, no sign-up, no cart. Every tap is attributed so the creator sees
which content drives sales.

## The rules that define the product (read these first)

- Shopping NEVER requires an account. No login wall, modal, or "sign up to
  continue" appears between arriving at a creator page and landing on the
  retailer. An account only gates acting as yourself: follow, comment, report,
  sell, or hire.
- No money is handled. There is no cart, checkout, wallet, or payout. "Buy"
  forwards to the retailer through the creator's own link; brand-collab payment
  settles off-platform.
- Attribution is honest. Outbound taps and code copies are directly measured
  ("tracked"); where something can't be measured (an in-store coupon used at a
  till) the product says so. Nothing is estimated.
- One account, many hats. A single email can be a shopper, a creator, AND a
  business owner at once — roles are capabilities on one identity, not separate
  logins.
- Mobile-first. Most visitors arrive inside Instagram/TikTok's in-app browser.

## Core loop

Creator makes content → tags the products in it → publishes a shoppable page.
Follower taps the bio link → taps a post → sees the products → taps Buy →
retailer. Every tap is recorded, so the creator sees "this post drove N taps".

## Public & shopper pages (open to everyone — no account needed to shop)

- [Home](${u}/): what Plugfolio is, and the shoppable "Tagged Feed".
- [Explore](${u}/explore): discover creators, shoppable posts, and products.
- Creator page — \`${u}/{handle}\` (e.g. the shopfront for @handle): a creator's
  posts and directly-shelved products in one grid, filtered by shelves
  (categories), with their socials, a follow button, and comments. The
  no-login shopping surface. Unknown, deleted, hidden, and private things all
  return an identical 404 by design (so a stranger can't confirm a private
  thing exists).
- Post page — \`${u}/{handle}/post/{postId}\`: one post with every product tagged
  on it; each tag opens the product.
- Product page — \`${u}/{handle}/product/{productId}\`: a product's price, any
  coupon/offer, and the Buy (affiliate) or Shop-their-store (own) link that taps
  out to the retailer. This is where the outbound tap is attributed.
- [How it works](${u}/how-it-works): the loop, and what can and can't be measured.
- [For creators](${u}/for-creators): making posts shoppable and reading attribution.
- [For business](${u}/for-business): finding creators and running a collab.
- [Support](${u}/support): help and contact.

## Shopper account (optional — only to act as yourself)

- [Following](${u}/following): the creators you follow, as a list (never a feed).
- [Account](${u}/account): your handle and account settings.
- Follow a creator and comment on pages/posts/products (threaded one level).
  Registration is email + password with a single one-time verification link.

## Creator features (account required — the dashboard)

- [Dashboard](${u}/dashboard): a creator's back room, one per profile (an account
  holds up to 5 profiles, each a separate shopfront with a social-derived handle).
- Posts: create posts and tag products onto them; hide posts from the public.
- Products: affiliate (Buy → retailer), own (Shop their store), each optionally
  carrying a coupon — an online code or an in-store code — with an expiry.
- Categories ("shelves") that filter the creator page.
- Page appearance: a closed, WCAG-checked set — an accent colour, a header
  style, a grid layout, and an optional greeting. No free-form theming.
- Traffic: attribution — how many taps each post and product drove.
- Managers: invite up to a few helpers who can post and tag on a profile.

## Business features (collabs)

- [Collabs](${u}/collabs): post a brief creators can reply to, or approach a
  creator directly from their page, then negotiate to agreed terms in one thread.
  Payment settles off-platform.

## For AI agents browsing the site

- The buy path is the product: a tag on a photo is a real link with a visible
  price; tapping it records an outbound tap and forwards to the retailer.
- Product tag dots: violet = affiliate, lime = a live offer/coupon, violet-deep
  = the creator's own product.
- Never treat a 404 as "this exists but is private" — not-found and not-yours
  are deliberately indistinguishable.
- Private/utility routes (dashboard, collabs, account, following, and auth:
  join, signin, verify, forgot, reset) require an account and are disallowed to
  crawlers in ${u}/robots.txt.
`;
}

export function GET(): Response {
  return new Response(body(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
