"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClaimSheet } from "@/features/account-auth";
import { followProfile, unfollowProfile } from "../api";

/**
 * Follow toggle on the creator page. Anonymous shoppers get the inline claim
 * sheet over the page they're on (brief 04) — never a wall on the page
 * itself (§2.2); signed-in shoppers toggle.
 *
 * The label flips on click, not on the server's answer. Rendering straight
 * from `initiallyFollowing` meant the button sat there unchanged through a
 * round-trip plus a full RSC re-render — long enough on a phone to read as a
 * dead button and get tapped twice. Same optimistic move as `FollowRow`:
 * flip, revert if the write fails, and let `router.refresh()` catch the
 * follower count up behind it.
 */
export type FollowButtonProps = {
  profileId: string;
  isAuthenticated: boolean;
  initiallyFollowing: boolean;
};

export function FollowButton({
  profileId,
  isAuthenticated,
  initiallyFollowing,
}: FollowButtonProps) {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  // null = "no local opinion, show the server's". Set on click, dropped again
  // the moment the refreshed prop agrees — so the server stays the truth and a
  // failed write reverts to it rather than lying.
  const [pendingState, setPendingState] = useState<boolean | null>(null);
  const following = pendingState ?? initiallyFollowing;
  const [failed, setFailed] = useState(false);

  useEffect(() => setPendingState(null), [initiallyFollowing]);

  const toggle = useMutation({
    mutationFn: (next: boolean) =>
      next ? followProfile({ profileId }) : unfollowProfile({ profileId }),
    onMutate: (next) => {
      setFailed(false);
      setPendingState(next);
    },
    onError: () => {
      setPendingState(null);
      setFailed(true);
    },
    // Server state is the truth; refresh brings the follower count with it.
    onSuccess: () => router.refresh(),
  });

  // Follow is the creator's accent, like every committed action on their page
  // (DESIGN §.btn--accent). Once you follow it steps back to the white pill
  // (§.btn--following): the ask has been answered, and a filled button that
  // only undoes itself keeps asking.
  if (!isAuthenticated) {
    return (
      <>
        <Button variant="action" className="px-5" onClick={() => setClaiming(true)}>
          Follow
        </Button>
        <ClaimSheet open={claiming} onOpenChange={setClaiming} action="follow" />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button
        variant={following ? "secondary" : "action"}
        className="px-5"
        onClick={() => toggle.mutate(!following)}
        // Still disabled in flight — the label already moved, so this reads as
        // "saving" rather than dead, and it keeps a double-fire (the in-app
        // browser habit, §6.8) from racing follow against unfollow.
        disabled={toggle.isPending}
        aria-busy={toggle.isPending}
      >
        {following ? "Following" : "Follow"}
      </Button>
      {failed ? (
        <span role="alert" className="text-destructive text-micro font-semibold">
          Didn&apos;t save — try again
        </span>
      ) : null}
    </div>
  );
}
