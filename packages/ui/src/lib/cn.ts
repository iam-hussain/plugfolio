import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Merge conditional class names, resolving Tailwind conflicts (last wins).
 *
 * tailwind-merge has to be TOLD about our type scale (§7). It knows Tailwind's
 * own `text-xs…text-9xl` are font sizes and assumes every other `text-…` is a
 * colour — so `text-micro` looked like a colour to it, and
 * `cn("… text-background … text-micro …")` quietly dropped the colour as the
 * losing duplicate.
 *
 * That is not theoretical: it is why Explore's "+N" pill rendered ink-on-ink
 * and looked like an empty black circle. Any component carrying both a size and
 * a colour in one `cn()` was one class-order edit away from the same thing, and
 * it fails invisibly — no error, no type, just a colour that never arrives.
 *
 * Listing the scale here fixes the whole class of bug in one place. Add a step
 * to `packages/config/tailwind/preset.ts` and add it here in the same change.
 */
const FONT_SIZES = [
  "pico",
  "nano",
  "micro",
  "label",
  "copy",
  "body",
  "title",
  "name",
  "name-md",
  "name-lg",
  "display-sm",
  "display",
  "display-lg",
  "display-xl",
  "display-2xl",
];

const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: FONT_SIZES }] } },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
