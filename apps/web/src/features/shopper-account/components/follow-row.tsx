"use client";

import type { FollowedCreator } from "@plugfolio/core";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  FollowBadge,
  FollowIdentity,
  FollowRowShell,
} from "@plugfolio/ui";
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
  // No display name means the handle IS the name — printing it as both lines
  // stacked "@lena" on top of "@lena".
  const name = creator.displayName ?? `@${creator.username}`;
  const handle = creator.displayName ? `@${creator.username}` : null;

  const toggle = useMutation({
    mutationFn: (unfollow: boolean) =>
      unfollow
        ? unfollowProfile({ profileId: creator.id })
        : followProfile({ profileId: creator.id }),
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
    <FollowRowShell gone={gone}>
      <FollowIdentity
        asChild
        dimmed={gone}
        avatar={
          <Avatar className="size-[52px]">
            {creator.avatarUrl ? <AvatarImage src={creator.avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-active text-primary font-display text-body font-bold">
              {creator.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        }
        name={name}
        handle={handle}
        meta={meta}
      >
        <Link href={`/${creator.username}`} />
      </FollowIdentity>

      {gone ? (
        <div className="ml-auto flex items-center gap-3">
          <span role="status" className="text-muted-foreground text-micro font-bold">
            Unfollowed
          </span>
          <Button size="sm" onClick={() => toggle.mutate(false)} disabled={toggle.isPending}>
            Undo
          </Button>
        </div>
      ) : (
        <>
          <FollowBadge tone={badge.isNew ? "new" : "quiet"}>{badge.label}</FollowBadge>
          <div className="ml-auto flex items-center gap-3">
            {failed ? (
              <span role="alert" className="text-destructive text-micro font-semibold">
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
    </FollowRowShell>
  );
}
