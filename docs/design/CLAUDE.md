# Plugfolio — Project Brand Rules (follow on ALL work)

The canonical brand reference is **`uploads/Plugfolio Brand Guidelines v1.1.dc.html`**. Every design, screen, and the UI/UX prototype in this project must follow it. When in doubt, open that file.

## Logo / symbol
- The mark is **PlugMark** — a two-prong plug whose prongs rise as upward arrows. Component: `uploads/PlugMark.dc.html`, mounted via `<dc-import name="PlugMark" body="..." prong="..." hint-size="100%,100%">`. Never redraw it by hand.
- Wordmark: lowercase `plugfolio` + a small square "spark" dot, set in **Sora 700**, letter-spacing ≈ -0.045em.
- Prong/spark color rule: **on light** → violet body + ink prongs (`#12101C`), spark violet/ink, never lime. **On dark/violet** → white (or violet) body + **lime prongs & spark**. Under 24px collapse to a single flat color; 16px minimum.
- Never stretch, rotate, recolor off-system, gradient, outline the mark, or put lime prongs on light.

## Color
- Brand Violet `#7C3AED` (primary) · Violet Deep `#5B21B6` (hover/dark) · Violet Tint `#A78BFA` · Ink `#12101C` (text/prongs/dark UI)
- Electric Lime `#C6FF3D` — **fill only**, with dark text; never lime type on white. Coral `#FF6B5C` (warm alt) · Violet Wash `#EFEAFB` · Canvas `#F5F4F8` (page bg)

## Typography
- **Sora** — display / wordmark / headlines (500–800), tracking -2% to -5% at display sizes.
- **Inter** — UI and body (400–700), body 16px / 1.6, tabular nums for data.
- **Space Mono** — micro labels, captions, uppercase eyebrows.

## Voice
Direct, confident, creator-native. Short lines, no hype/jargon. Keep honesty labels: "shopping never needs an account", "tracked", "payment settles off-platform".

## Product rules (from design-handoff.md)
- No login is ever required to shop. v1 handles no money (Buy forwards to retailer affiliate link — no cart/checkout/payout).
- Mobile-first at 360px; WCAG AA contrast; design all empty/error/busy states.
- Public shopper screens (creator page, post, product, /following) are wrapped in the **shopper bottom tab bar**: HOME / SHOP / FOLLOWING / ACCOUNT, Space Mono ~9px uppercase, 20px line icons (home / 2×2 grid / heart / user), active tab = the page's accent (SHOP is active on the creator page). Theme it per surface but keep this chrome — presets/mockups must inherit it, not invent a footer.
- **Every shopper screen carries the app top bar**: PlugMark + `plugfolio` wordmark (left, → feed) and, on the right, search + the account slot. The account slot signals role — anonymous = user glyph (→ sign-in), signed-in shopper = their avatar, business = their business mark, owner = avatar with a Dashboard link. Never drop this bar for a bare URL chip.
- **Creator page is one page, four viewers** (only the account slot + the band under the header change; the buy path is never walled): anonymous (outline Follow → sign-in; "Sign in to comment" band) · signed-in shopper (working Follow/Following + comment composer) · business viewer (adds the "You own a business" Request-collab strip) · owner/creator (no Follow; "This is your page" + View-as-visitor, Edit profile/Share, and inline layout/featured/metrics edit tools; Managers get the same minus Settings).
- **Creator header carries a socials row** under the name/Follow: Instagram · YouTube · TikTok · Facebook · personal website (themed per skin; icon-row default, labeled-pill variant for link-heavy creators). The creator adds/edits them in **dashboard Settings → "Your links"**: connected socials (IG/YT) auto-fill, others are pasted; drag to reorder; empty state points to Settings. Any creator-page design MUST include this row and account for where it's authored.

## Product card — three faces (ALWAYS consider these together)
Every product card is **outbound** — never a cart, checkout, or payment on Plugfolio.
1. **Affiliate (default, baseline look)** — someone else's product; creator earns a network commission. Card: photo · title · price · one **Buy** → retailer via the creator's affiliate link. **No label** — this is the baseline; commission is invisible to the shopper.
2. **Creator's own product** — creator's own item; button goes to their store. Same layout, two changes only: a quiet **"Their own product"** trust tag, and the button reads **"Shop their store"** (not "Buy"). No commission language anywhere on this card.
3. **Coupon** — an *offer that rides on face 1 or 2*, NOT a third card type. Adds a **copyable code chip** (tap → copies → chip swaps to "Copied ✓" inline, no toast; code never truncates). Optional expiry line ("Valid till 3 Aug"); after expiry it collapses to a muted **"Offer ended"** and the card returns to its normal face — the product never disappears. Three redemption channels, chosen by which fields the creator filled:
   - **Online** (code + link): Copy code → Buy/Shop their store (copy first, go second).
   - **In-store** (code + shop note, e.g. "Show this at the counter — Indiranagar store"; NO link → NO Buy button): the note + code IS the action — design so the card doesn't look broken.
   - **Both** (code + link + note): all actions present.
   The code chip is a **sanctioned accent-color moment** (the deal is the most persuasive thing on the card) but must not overpower the primary button; mind AA in light AND dark.
- **Authoring:** the tagging editor gets a **kind toggle (Affiliate / My own product)** + a collapsed **"+ Add a coupon"** section (code, expiry, in-store note). The default affiliate flow stays exactly as fast as today.
- **Products tab** rows show the kind tag + a compact coupon summary. **Earnings** shows **code copies** beside taps; in-store copies are labeled **"redemption not tracked"**.
- **Do NOT design:** checkout/cart/payments, coupon auto-apply, QR or tracked in-store redemption, bundles/drops, multiple coupons on one product.

## Product at a glance (memory — from design-handoff.md)
**What it is:** A creator turns their content into a page where every post is shoppable; a follower taps a post and buys — no account, no friction.

**Three roles:** Shopper (never needs an account to shop; optional account only to follow/comment) · Creator (email sign-in; owns ≤5 profiles; invites ≤3 Managers) · Business (email sign-in; posts requirements, runs collab threads). One email account can hold any mix.

**Two golden rules:** (1) an account is never the price of shopping — no wall on the arrive→retailer path; (2) v1 handles no money — Buy forwards to the creator's affiliate link.

**Five journeys:** shopper tap→see→buy (3 taps, target) · shopper's one optional account (Follow/Comment → sign-in → /following) · creator sign-up→connect→profile→tag→live (the "my reel is now shoppable" magic moment) · Admin↔Manager · business↔creator collab (two doors → thread → both Accept terms → "Agreed, settles off-platform").

**Screen inventory:** `/` Landing · `/[handle]` Creator page (shop window) · post view · product page · sign-in / check-email / verify · /following · dashboard (home, posts, tagging editor, products, collabs, settings) · business home · collab thread · 404 / error / loading skeletons.

**Landing (`/`) requirements:** headline value prop ("shoppable creator pages"); explicit "no login to shop" promise; role router (Creator → sign-in/demo · Business → /collabs · shopper → sample creator page); footer. NO sign-in wall, no link implying shopping needs an account. Richer/heavier than shop pages is OK (not on the shopper hot path).

**Design tokens engineering consumes (deliverable):** `--color-primary`(+fg), `--color-accent`(+fg), `--surface`, `--surface-muted`, `--text`, `--text-muted`, `--border`, `--ring`, radius scale, type scale (display + body), spacing scale — both light and dark. Component base is shadcn/ui.

**Open questions (handoff §10):** dashboard nav (text tabs vs bottom bar) · dark-first vs light-first default · desktop grid columns · empty-state art style · "Agreed" state treatment.

**Out of v1:** referral rewards, wishlists, aggregated feed, ratings, media kits, on-platform payments, TikTok, AI tag suggestions, >5 profiles / >3 managers, vanity usernames, creator-to-creator collabs. (Note: **coupons are now IN** — see "Product card — three faces" above; still out are coupon auto-apply, QR/tracked in-store redemption, bundles/drops, and multiple coupons per product.)

## Working files
- `Plugfolio Brand.html` — rendered brand book (root copy). `PlugMark.dc.html` — logo component (root). `image-slot.js` — image placeholder web component (root).
- `uploads/Plugfolio Prototype.dc (1).html` — full interactive prototype (all screens, mobile/desktop, light/dark).
- `Plugfolio UI.dc.html` — standalone full-screen landing extracted from the prototype (viewport + theme tweaks).
