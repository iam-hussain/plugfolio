"use client";

import type { FollowedCreator } from "@plugfolio/core";
import { Avatar, AvatarFallback, AvatarImage, Badge, Button } from "@plugfolio/ui";
import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { followProfile, unfollowProfile } from "../api";

/**
 * One row of /following (design following.html). Rows, not cards in a grid — a
 * follow list is scanned down a column of names, and rows fill the measure.
 *
 * Unfollow is undo, not "are you sure?". A confirm dialog taxes every
 * deliberate unfollow to protect the rare accidental one, and on a phone it's
 * a modal over what you were reading. The row STAYING — dimmed, with Undo —
 * is what makes the dialog unnecessary rather than merely skipped: you can't
 * re-follow someone you can no longer find in a list of hundreds. It stays
 * until the page is left.
 */
export type FollowRowProps = {
  creator: FollowedCreator;
  /** Pre-formatted on the server so the row renders the same on both sides. */
  meta: string;
  /** "4 new posts", "Nothing new", "Quiet 3 months". */
  badge: { label: string; isNew: boolean };
};

export function FollowRow({ creator, meta, badge }: FollowRowProps) {
  const [gone, setGone] = useState(false);
  const [failed, setFailed] = useState(false);
  const name = creator.displayName ?? `@${creator.username}`;

  const toggle = useMutation({
    mutationFn: (unfollow: boolean) =>
      unfollow ? unfollowProfile({ profileId: creator.id }) : followProfile({ profileId: creator.id }),
    onMutate: (unfollow) => {
      setFailed(false);
      setGone(unfollow);
    },
    onError: (_error, unfollow) => {
      setGone(!unfollow);
      setFailed(true);
    },
  });

  return (
    <div
      data-gone={gone ? "yes" : "no"}
      className="border-border bg-card rounded-tile hover:border-primary data-[gone=yes]:bg-background flex flex-wrap items-center gap-4 border px-[18px] py-3.5 transition-colors data-[gone=yes]:border-dashed"
    >
      <Link
        href={`/${creator.username}`}
        className="flex min-w-0 flex-[1_1_260px] items-center gap-3.5 no-underline"
      >
        <Avatar className={`size-[52px] ${gone ? "opacity-50" : ""}`}>
          {creator.avatarUrl ? <AvatarImage src={creator.avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-active text-primary font-display text-lg font-bold">
            {creator.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className={`min-w-0 ${gone ? "opacity-50" : ""}`}>
          <b className="block truncate text-[13px] font-bold">{name}</b>
          <span className="text-muted-foreground mt-0.5 block truncate text-[0.9375rem]">
            @{creator.username}
          </span>
          <span className="text-faint mt-0.5 block truncate text-xs">{meta}</span>
        </span>
      </Link>

      {gone ? (
        <div className="ml-auto flex items-center gap-3">
          <span role="status" className="text-muted-foreground text-xs font-bold">
            Unfollowed
          </span>
          <Button size="sm" onClick={() => toggle.mutate(false)} disabled={toggle.isPending}>
            Undo
          </Button>
        </div>
      ) : (
        <>
          <Badge variant={badge.isNew ? "default" : "outline-muted"} className="tabular-nums">
            {badge.label}
          </Badge>
          <div className="ml-auto flex items-center gap-3">
            {failed ? (
              <span role="alert" className="text-destructive text-xs font-semibold">
                Didn&apos;t save
              </span>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => toggle.mutate(true)}
              disabled={toggle.isPending}
              aria-label={`Unfollow ${name}`}
            >
              Following
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
