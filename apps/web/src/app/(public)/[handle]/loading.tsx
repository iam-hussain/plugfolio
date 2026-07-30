import { Skeleton, SkeletonScreen } from "@plugfolio/ui";

/**
 * The creator page, while it streams.
 *
 * This is the surface a stranger meets first — they tapped a link in a bio
 * and know nothing about us yet — so the wait has to look like the page
 * they were promised, at the width and rhythm it actually renders at
 * (max-w-[1180px], px-5 / lg:px-11, cover → avatar → identity → chips →
 * grid). Same container, same steps, so nothing shifts on arrival.
 *
 * No text is faked. A grey bar where a name goes is honest; the word
 * "Loading…" where a creator's name goes is a sentence the page never
 * meant to say.
 */
export default function Loading() {
  return (
    <SkeletonScreen
      label="Loading this creator's page"
      className="mx-auto w-full max-w-[1180px] px-5 pb-14 lg:px-11"
    >
      {/* Cover — the tallest thing on the page and the one whose absence
          would move everything below it. */}
      <Skeleton className="rounded-tile h-[168px] w-full" />

      {/* Identity: avatar overlapping the cover, exactly as the header sets it. */}
      <div className="-mt-11 flex flex-wrap items-start gap-4">
        <Skeleton className="size-[88px] shrink-0 rounded-full" />
        <div className="flex-1 pt-12">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="mt-2.5 h-4 w-64" />
          <Skeleton className="mt-4 h-4 w-full max-w-[46ch]" />
          <Skeleton className="mt-2 h-4 w-full max-w-[34ch]" />

          {/* Socials + the share row. */}
          <div className="mt-3.5 flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="size-10 rounded-full" />
            ))}
          </div>
        </div>
        <Skeleton className="rounded-pill mt-12 h-11 w-28" />
      </div>

      {/* Shelves. */}
      <div className="mt-6 flex gap-2 overflow-hidden">
        {[64, 92, 48, 72, 56].map((w, i) => (
          <Skeleton key={i} className="rounded-image h-10 shrink-0" style={{ width: w }} />
        ))}
      </div>

      {/* The grid. Eight tiles because that is roughly one screenful — enough
          to hold the scroll position, not so many that a fast response
          paints a wall of grey for a frame. */}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="rounded-image aspect-square w-full" />
        ))}
      </div>
    </SkeletonScreen>
  );
}
