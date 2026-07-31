import { cva, type VariantProps } from "class-variance-authority";

/**
 * The page container — one measure and one gutter for every screen.
 *
 * There were three of these in the wild: 1200 with a 40px gutter (top bar,
 * creator page, back room), 1180 with a 44px one (footer, explore, account,
 * the loading skeletons) and 1080 (marketing). Which meant the shared top bar
 * and the shared footer of the *same shell* were misaligned by 20px, and every
 * new screen picked whichever it copied from. One CVA, no literals, no drift.
 *
 * It's a class recipe rather than a component because callers need it on
 * `<main>`, `<header>`, `<div>` and `<nav>` alike — an `as` prop would be a
 * worse version of `className`.
 */
export const measure = cva("mx-auto w-full px-5", {
  variants: {
    width: {
      /** The design's container (--inner): 1200 wide, 20/40px gutter. */
      inner: "max-w-inner lg:px-10",
      /** Long-form marketing — a notch in from the page. */
      narrow: "max-w-narrow lg:px-10",
      /** A column of prose — a thread, a brief, an email. */
      reading: "max-w-reading lg:px-10",
    },
  },
  defaultVariants: { width: "inner" },
});

export type MeasureVariants = VariantProps<typeof measure>;
