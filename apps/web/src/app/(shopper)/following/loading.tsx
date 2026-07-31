import { cn, measure, Skeleton, SkeletonScreen } from "@plugfolio/ui";

/**
 * Following, while it streams. A column of rows — the shape the page is,
 * and the one thing a skeleton here has to get right, because a follow list
 * runs long and a wrong row height moves the whole scroll.
 */
export default function Loading() {
  return (
    <SkeletonScreen
      label="Loading the creators you follow"
      className={cn(measure(), "py-8")}
    >
      <Skeleton className="h-9 w-44" />
      <Skeleton className="rounded-pill mt-4 h-[54px] w-full max-w-[420px]" />

      <div className="mt-8 space-y-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="border-border bg-card rounded-tile flex items-center gap-4 border px-4 py-3.5"
          >
            <Skeleton className="size-[52px] shrink-0 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="mt-2 h-3 w-52" />
            </div>
            <Skeleton className="rounded-pill h-9 w-24 shrink-0" />
          </div>
        ))}
      </div>
    </SkeletonScreen>
  );
}
