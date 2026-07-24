"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { setPostHidden } from "../api";

/**
 * Hide a post from the public page, or bring it back (brief 07). Content
 * work — Admin and Managers alike. Hiding never deletes anything.
 */
export function HidePostButton({
  profileId,
  postId,
  hidden,
}: {
  profileId: string;
  postId: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const toggle = useMutation({
    mutationFn: () => setPostHidden(postId, { profileId, hidden: !hidden }),
    onSuccess: () => router.refresh(),
  });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
    >
      {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      {toggle.isPending ? "Saving…" : hidden ? "Show on page" : "Hide from page"}
    </Button>
  );
}
