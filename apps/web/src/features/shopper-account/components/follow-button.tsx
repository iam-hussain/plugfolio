"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { followProfile, unfollowProfile } from "../api";

/**
 * Follow toggle on the creator page. Anonymous shoppers see it as a door to
 * sign-in — never a wall on the page itself (§2.2); signed-in shoppers toggle.
 */
export type FollowButtonProps = {
  profileId: string;
  isAuthenticated: boolean;
  initiallyFollowing: boolean;
};

export function FollowButton({ profileId, isAuthenticated, initiallyFollowing }: FollowButtonProps) {
  const router = useRouter();

  const toggle = useMutation({
    mutationFn: () =>
      initiallyFollowing ? unfollowProfile({ profileId }) : followProfile({ profileId }),
    // Server state is the truth; refresh re-renders with the new follow state.
    onSuccess: () => router.refresh(),
  });

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="sm" className="rounded-pill px-5" onClick={() => router.push("/signin")}>
        Follow
      </Button>
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
