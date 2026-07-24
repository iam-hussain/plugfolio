"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClaimSheet } from "@/features/account-auth";
import { followProfile, unfollowProfile } from "../api";

/**
 * Follow toggle on the creator page. Anonymous shoppers get the inline claim
 * sheet over the page they're on (brief 04) — never a wall on the page
 * itself (§2.2); signed-in shoppers toggle.
 */
export type FollowButtonProps = {
  profileId: string;
  isAuthenticated: boolean;
  initiallyFollowing: boolean;
};

export function FollowButton({ profileId, isAuthenticated, initiallyFollowing }: FollowButtonProps) {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);

  const toggle = useMutation({
    mutationFn: () =>
      initiallyFollowing ? unfollowProfile({ profileId }) : followProfile({ profileId }),
    // Server state is the truth; refresh re-renders with the new follow state.
    onSuccess: () => router.refresh(),
  });

  if (!isAuthenticated) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="rounded-pill px-5"
          onClick={() => setClaiming(true)}
        >
          Follow
        </Button>
        <ClaimSheet open={claiming} onOpenChange={setClaiming} action="follow" />
      </>
    );
  }

  return (
    <Button
      variant={initiallyFollowing ? "ghost" : "outline"}
      size="sm"
      className="rounded-pill px-5"
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
    >
      {initiallyFollowing ? "Following" : "Follow"}
    </Button>
  );
}
