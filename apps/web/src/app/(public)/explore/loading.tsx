import { Skeleton, SkeletonScreen } from "@plugfolio/ui";

/**
 * Explore, while it streams: the search field and the scope chips first,
 * then the creator row, then the wall.
 *
 * The controls are bones too, deliberately. Painting a real, usable search
 * box over an empty page invites someone to type into a field whose form
 * has not mounted — the keystrokes go nowhere and the page looks broken
 * rather than slow.
 */
export default function Loading() {
  return (
    <SkeletonScreen
      label="Loading creators and products"
      className="mx-auto w-full max-w-[1180px] px-5 pb-14 pt-6 lg:px-11"
    >
      <Skeleton className="h-9 w-40" />

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Skeleton className="rounded-pill h-[54px] w-full max-w-[420px]" />
        <Skeleton className="rounded-pill h-[54px] w-24" />
      </div>
      <div className="mt-3.5 flex gap-2">
        {[52, 76, 62, 84].map((w, i) => (
          <Skeleton key={i} className="rounded-pill h-10" style={{ width: w }} />
        ))}
      </div>

      {/* Creators. */}
      <Skeleton className="mt-9 h-6 w-28" />
      <div className="mt-4 flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="w-[152px] shrink-0">
            <Skeleton className="rounded-image aspect-square w-full" />
            <Skeleton className="mt-2.5 h-4 w-28" />
            <Skeleton className="mt-1.5 h-3 w-20" />
          </div>
        ))}
      </div>

      {/* The wall. */}
      <Skeleton className="mt-9 h-6 w-32" />
      <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="rounded-tile aspect-[4/5] w-full" />
        ))}
      </div>
    </SkeletonScreen>
  );
}
