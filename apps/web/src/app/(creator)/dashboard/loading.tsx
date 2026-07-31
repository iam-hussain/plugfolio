import { DashBody, Skeleton, SkeletonScreen } from "@plugfolio/ui";

/**
 * The dashboard body, while it streams.
 *
 * The shell is a layout now, so it stays mounted and only this swaps —
 * which is why there is no chrome drawn here. An earlier version of this
 * file claimed that was true before it was: every page rendered the shell
 * itself, so loading.tsx replaced the chrome too and had to redraw it.
 * Hoisting the shell into layout.tsx made the claim honest and let this
 * file shrink to what it should always have been.
 */
export default function Loading() {
  return (
    <SkeletonScreen label="Loading your dashboard">
      <DashBody>
        {/* Page header: eyebrow over title, and the action opposite it. */}
        <div className="flex items-end justify-between gap-3 pb-6 pt-8">
          <div>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-2.5 h-7 w-44" />
          </div>
          <Skeleton className="rounded-pill h-10 w-28" />
        </div>

        {/* A card and a list — the shape most dashboard screens open with,
            without pretending to know which one is coming. */}
        <div className="space-y-3.5">
          <div className="border-border bg-card rounded-tile border p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="size-[60px] shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-4 w-56" />
              </div>
              <Skeleton className="rounded-pill h-10 w-28 shrink-0" />
            </div>
          </div>

          <div className="border-border bg-card rounded-tile border p-5">
            <Skeleton className="h-5 w-32" />
            <div className="mt-4 space-y-2.5">
              {[0, 1, 2, 3].map((i) => (
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
      </DashBody>
    </SkeletonScreen>
  );
}
