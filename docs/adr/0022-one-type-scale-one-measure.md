# ADR-0022 — One type scale, one page measure, and routes that only load

## Context

§7 already said tokens are the only source of colour, space and type, and §8
already said visual state goes through CVA. An audit of the whole frontend found
the rules had been written but never had anything behind them:

- **268 arbitrary `text-[…]` classes.** 121 were exact duplicates of tokens that
  already existed (`text-[13px]` = `text-label` ×76, `text-[0.9375rem]` =
  `text-copy` ×45). Another 268 sites used Tailwind's own `text-xs/sm/base/lg/
  xl/2xl` — a *second* scale, so single screens were drawing from both.
- **Three page measures.** 1200 with a 40px gutter (top bar, creator page, back
  room), 1180 with a 44px one (footer, explore, account, every loading
  skeleton), and 1080 (marketing). The shared top bar and the shared footer of
  the *same shell* were 20px out of alignment with each other, and each new
  screen inherited whichever it happened to be copied from.
- **~25 places branching styling with a ternary** inside `cn()` or a template
  literal, which is the CVA rule broken in a shape the rule didn't name.
- **1,281 lines of JSX inside four `app/` route files**, so the product's
  central surfaces had no home in `features/` and could not be story-rendered.
- **Components re-typed by hand that the design system already had** —
  `CommentSection`, `Segmented`/`SegmentedOption`, `SortButton`,
  `DetailSectionHeading`, `MessageBubble`. The hand copies had already drifted
  off the design's hover and pressed states.

The common cause is not carelessness: every one of these is invisible in review.
A reviewer cannot see that `text-[13px]` equals `text-label`, or that this
screen's `max-w-` differs from the footer's, or that `@plugfolio/ui` already
exports the thing being written.

## Decision

**1. One type scale, and it is closed.** `pico 10 · nano 11 · micro 12 ·
label 13 · copy 15 · body 17 · title 22 · name 24 · name-md 28 · name-lg 32`,
plus fluid `display-sm · display · display-lg · display-xl · display-2xl` for
headlines. Arbitrary sizes and Tailwind's default scale are both out of bounds
in our code. A size the scale hasn't got is added to the preset with a reason —
not inlined. The generated shadcn primitives keep the `text-sm` they shipped
with, so `shadcn add` stays diffable; the boundary is "did we write it".

**2. One page container: `measure()` from `@plugfolio/ui`.** A CVA recipe, not a
component, because callers need it on `<main>`, `<header>`, `<div>` and `<nav>`
alike. Three named widths: `inner` (1200, the page), `narrow` (1080, long-form
marketing), `reading` (760, a column of prose). Hand-writing
`mx-auto w-full max-w-[…] px-…` is how the misalignment happened and is out.

**3. A boolean that swaps classes is a CVA variant.** `cond ? "bg-a" : "bg-b"`
is the same defect as a hardcoded hex, and gets the same answer.

**4. Extend with `asChild`, never an escape-hatch prop.** A prop that lets a
caller replace a component's internals means the component no longer owns its
layout, and every caller pastes that layout back in.

**5. Routes load; features render.** A `page.tsx` holds `generateMetadata`, the
params, the service calls and the auth check, then returns one `<FeatureView/>`.

## Consequences

- The rules are now checkable. One grep in the §11 checklist catches off-scale
  type, a hand-rolled page measure, and a class-picking ternary; it prints
  nothing today.
- `@storybook/addon-a11y` runs axe on every story, so §7's "AA in both themes"
  finally has something enforcing it rather than a reviewer's eye.
- The footer now aligns with the top bar. That is a real, if small, visual
  change on every shopper screen, along with sub-pixel type shifts wherever an
  off-scale size snapped to its nearest step.
- `node:crypto` is stubbed for Storybook, so a component may value-import
  `@plugfolio/core` without the signed device token (ADR-0002) killing the whole
  preview build. That trap had been silently shaping what could have a story.
- Cost: five new preset steps and a handful of new files per split screen. The
  scale is bigger than the design's own list because the product had genuinely
  drifted onto sizes the design never named; the steps are where the code
  already was, not new latitude.

## Status

Accepted.
