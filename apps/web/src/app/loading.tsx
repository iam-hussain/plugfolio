import { SkeletonScreen } from "@plugfolio/ui";

/**
 * The root fallback — deliberately almost nothing.
 *
 * This file catches every segment that has no loading.tsx of its own, which
 * is most of them, and they share no layout. It used to draw a centred
 * circle over two bars: a shape that matches no page in the product, so
 * whichever one arrived did so with a jump. A skeleton that guesses wrong
 * is worse than no skeleton — it promises a layout and then breaks it.
 *
 * So this reserves nothing and claims nothing. It holds the page height so
 * the footer does not leap up, announces the wait for anyone who cannot see
 * the screen, and gets out of the way. Segments whose shape IS known —
 * /[handle], /explore, /following, /dashboard — each have their own file
 * next to the page they precede, where the bones can be right.
 *
 * Most surfaces here are server-rendered and arrive whole, so this should
 * rarely be seen at all. That is the intended outcome, not a gap.
 */
export default function Loading() {
  return <SkeletonScreen label="Loading" className="min-h-[60vh]" />;
}
