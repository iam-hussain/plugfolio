import type { FollowedCreator } from "@plugfolio/core";
import { describe, expect, it } from "vitest";
import { badgeFor, metaLine, plural, sinceLabel } from "./follow-labels";

const NOW = new Date("2026-07-31T12:00:00Z");
const daysBefore = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

const creator = (over: Partial<FollowedCreator> = {}): FollowedCreator =>
  ({
    id: "p1",
    username: "mayamoves",
    displayName: null,
    avatarUrl: null,
    postCount: 18,
    productCount: 42,
    newPostCount: 0,
    followedAt: daysBefore(120),
    lastPostAt: daysBefore(3),
    ...over,
  }) as FollowedCreator;

describe("plural", () => {
  it("only pluralises past one", () => {
    expect(plural(1, "post")).toBe("1 post");
    expect(plural(0, "post")).toBe("0 posts");
    expect(plural(2, "post")).toBe("2 posts");
  });
});

describe("sinceLabel", () => {
  it("names today and yesterday rather than counting them", () => {
    expect(sinceLabel(NOW, NOW)).toBe("Last looked today");
    expect(sinceLabel(daysBefore(1), NOW)).toBe("Last looked yesterday");
  });

  it("switches from days to months at 30", () => {
    expect(sinceLabel(daysBefore(29), NOW)).toBe("Last looked 29 days ago");
    expect(sinceLabel(daysBefore(30), NOW)).toBe("Last looked 1 month ago");
    expect(sinceLabel(daysBefore(70), NOW)).toBe("Last looked 2 months ago");
  });

  it("never reads as the future when a clock is skewed", () => {
    expect(sinceLabel(new Date(NOW.getTime() + 86_400_000), NOW)).toBe("Last looked today");
  });
});

describe("metaLine", () => {
  it("climbs days → months → years", () => {
    expect(metaLine(creator({ followedAt: daysBefore(0) }), NOW)).toContain("followed today");
    expect(metaLine(creator({ followedAt: daysBefore(5) }), NOW)).toContain("followed 5 days ago");
    expect(metaLine(creator({ followedAt: daysBefore(60) }), NOW)).toContain(
      "followed 2 months ago",
    );
    expect(metaLine(creator({ followedAt: daysBefore(400) }), NOW)).toContain(
      "followed 1 year ago",
    );
  });

  it("counts posts and things", () => {
    expect(metaLine(creator({ postCount: 1, productCount: 1 }), NOW)).toBe(
      "1 post · 1 thing · followed 4 months ago",
    );
  });
});

describe("badgeFor", () => {
  it("leads with new posts when there are any", () => {
    expect(badgeFor(creator({ newPostCount: 3 }), NOW)).toEqual({
      label: "3 new posts",
      isNew: true,
    });
  });

  it("distinguishes never-posted from gone-quiet from recently-quiet", () => {
    expect(badgeFor(creator({ lastPostAt: null }), NOW).label).toBe("No posts yet");
    expect(badgeFor(creator({ lastPostAt: daysBefore(3) }), NOW).label).toBe("Nothing new");
    expect(badgeFor(creator({ lastPostAt: daysBefore(65) }), NOW).label).toBe("Quiet 2 months");
  });

  it("only ever flags new when a post is actually new", () => {
    expect(badgeFor(creator({ newPostCount: 0, lastPostAt: null }), NOW).isNew).toBe(false);
  });
});
