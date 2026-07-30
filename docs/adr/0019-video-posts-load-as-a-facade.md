# ADR-0019 — A video post loads as a facade, never as an embed

## Context

A creator's post is often a reel or a video, not a still. The post view has to
show the thing the post *is* — a photo post shows the photo, a reel shows the
reel — so the media slot must hold both.

The obvious implementation is to drop the provider's `<iframe>` on the page.
That breaks a promise the rest of the product keeps:

- **An embed sets third-party cookies the moment it mounts.** YouTube, Instagram
  and TikTok all do. It would happen on a page a shopper reached with no
  account, having agreed to nothing — on the one surface whose entire premise is
  that shopping never asks anything of you (§2.2, ADR-0002).
- **It is also the heaviest thing on the page**, on a surface whose visitors
  mostly arrive inside an in-app browser on a phone (§2.5).

There is a third problem an embed alone doesn't solve: **in-app browsers
regularly refuse to play embedded video at all.** Instagram's and TikTok's
in-app webviews are exactly where our traffic comes from, and exactly where a
silent black rectangle is most likely.

## Decision

**The media slot loads as a facade.** A video post renders its poster frame, a
play control, and the provider's name — and only fetches the real player when
the shopper presses play.

- **Nothing reaches the provider until asked.** No iframe, no script, no pixel
  is mounted on load. Pressing play is the shopper's request, and it is the
  first moment anything is sent.
- **The provider is named before the press, not after.** A shopper about to hand
  a request to YouTube is told it is YouTube while they can still decide.
- **The tap-out link is always present**, under the frame, whether or not the
  embed works — so an in-app browser that refuses to play still gets the shopper
  to the video instead of sitting there broken.
- **Aspect is the provider's, not ours.** 16:9 for YouTube; 9:16 for Instagram
  and TikTok, capped at 420px and centred in the measure. A reel letterboxed
  into 16:9 wastes half the frame, and a landscape video cropped to 9:16 loses
  the subject.
- **Data:** `Post.mediaKind` (`still` | `youtube` | `instagram` | `tiktok`,
  unset = still), `Post.embedUrl` (never rendered until play), `Post.sourceUrl`
  (the tap-out). `Post.mediaUrl` stays required and becomes the poster — which
  is why an existing photo post needs no migration.

## Consequences

- The poster is load-bearing. A video post with no poster shows a dark frame
  with a play button, which is worse than a still — so the import path has to
  fetch one, and until it does, creators paste it like they paste a product
  image.
- The counts stay honest: a play is not a tap, and pressing play records
  nothing. Only opening a retailer does (§6.6).
- Autoplay is not available and won't be. Autoplay requires the embed to be
  mounted, which is the thing this ADR exists to avoid.
- The facade is one component (`MediaSlot` + the embed facade in
  `@plugfolio/ui`), so a fourth provider is a case in one file.

## Status

Accepted. Recorded in `plugfolio-lean-journey.md` (the creator journey) and
`docs/implementation/shopper-surface.md`.
