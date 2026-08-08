import type { FollowedCreator } from "@plugfolio/core";
import { plural } from "../../lib/plural";

export { plural };

/**
 * The words on the Following page.
 *
 * Pure and framework-free (§8), because they are the only real logic on that
 * screen: everything else there is layout. They lived inside the page
 * component, where a boundary like "29 days is days, 30 is months" had nowhere
 * to be tested.
 *
 * All three take `now` rather than reading the clock, so the server and the
 * client can't disagree about what "6 days ago" means.
 */
const DAY_MS = 86_400_000;

export function agoInDays(from: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - from.getTime()) / DAY_MS));
}

/** "Last looked 6 days ago" — the denominator for every count on the page. */
export function sinceLabel(since: Date, now: Date): string {
  const days = agoInDays(since, now);
  if (days === 0) return "Last looked today";
  if (days === 1) return "Last looked yesterday";
  if (days < 30) return `Last looked ${days} days ago`;
  return `Last looked ${plural(Math.floor(days / 30), "month")} ago`;
}

/** "18 posts · 42 things · followed 4 months ago" */
export function metaLine(creator: FollowedCreator, now: Date): string {
  const days = agoInDays(creator.followedAt, now);
  const followed =
    days < 1
      ? "today"
      : days < 30
        ? `${plural(days, "day")} ago`
        : days < 365
          ? `${plural(Math.floor(days / 30), "month")} ago`
          : `${plural(Math.floor(days / 365), "year")} ago`;
  return `${plural(creator.postCount, "post")} · ${plural(creator.productCount, "thing")} · followed ${followed}`;
}

/**
 * The badge is the point of the page: it answers "who should I look at" without
 * merging anyone's posts into a stream. Quiet rows say how long instead.
 */
export function badgeFor(creator: FollowedCreator, now: Date): { label: string; isNew: boolean } {
  if (creator.newPostCount > 0) {
    return { label: plural(creator.newPostCount, "new post"), isNew: true };
  }
  if (!creator.lastPostAt) return { label: "No posts yet", isNew: false };
  const months = Math.floor(agoInDays(creator.lastPostAt, now) / 30);
  return { label: months >= 1 ? `Quiet ${plural(months, "month")}` : "Nothing new", isNew: false };
}
