import { Skeleton, SkeletonScreen } from "@plugfolio/ui";

/**
 * The dashboard body, while it streams.
 *
 * It lives HERE and not at the app root on purpose. A loading file replaces
 * everything below the layout it sits in, so a root-level one throws away
 * the dashboard shell — the brand bar, the profile switcher and the section
 * tabs all blink out and come back on every navigation, and the back room
 * looks like it is rebooting each time you press a tab.
 *
 * Nested here, the shell stays mounted and only the body swaps. Which is
 * also true: the shell already has everything it needs to render.
 *
 * Width matches the shell's own column (max-w-2xl) so nothing reflows.
 */
export default function Loading() {
  return (
    <SkeletonScreen label="Loading your dashboard">
      {/* Page header: eyebrow over title, and the action that usually sits
          opposite it. */}
      <div className="flex items-end justify-between gap-3 pb-6">
        <div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-2 h-7 w-44" />
        </div>
        <Skeleton className="rounded-pill h-10 w-28" />
      </div>

      {/* Two cards. Most dashboard screens open with a card and a list, so
          this is the shape that fits the widest set of them without
          pretending to know which one is coming. */}
      <div className="space-y-3.5">
        <div className="border-border bg-card rounded-tile border p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="size-[60px] shrink-0 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-56" />
            </div>
          </div>
        </div>

        <div className="border-border bg-card rounded-tile border p-5">
          <Skeleton className="h-5 w-32" />
          <div className="mt-4 space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3.5">
                <Skeleton className="rounded-image size-[52px] shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="mt-2 h-3 w-3/5" />
                </div>
                <Skeleton className="size-9 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonScreen>
  );
}
