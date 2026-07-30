"use client";

import { Button, Switch, SwitchLabel } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { setPostHidden } from "../api";

/**
 * Hide a post from the public page, or bring it back. Content work — Admin and
 * Managers alike. Hiding never deletes anything.
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
    <Button variant="outline" onClick={() => toggle.mutate()} disabled={toggle.isPending}>
      {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      {toggle.isPending ? "Saving…" : hidden ? "Show on page" : "Hide from page"}
    </Button>
  );
}

/**
 * The same write, as the row control (DESIGN dashboard.html §.switch).
 *
 * A real switch, because "Hide from page" as a button made you read the label
 * to learn the current state — a switch shows it. It sits in the row rather
 * than two screens away in the editor, so a creator can take five posts down
 * without opening five pages.
 */
export function PostVisibilitySwitch({
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
    mutationFn: (next: boolean) => setPostHidden(postId, { profileId, hidden: !next }),
    onSuccess: () => router.refresh(),
  });

  return (
    <>
      <Switch
        checked={!hidden}
        disabled={toggle.isPending}
        onCheckedChange={(next) => toggle.mutate(next)}
        aria-label={hidden ? "Show this post on your page" : "Hide this post from your page"}
        className="h-6 w-[42px] [&_[data-slot=switch-thumb]]:size-[18px]"
      />
      <SwitchLabel>{hidden ? "Hidden" : "On page"}</SwitchLabel>
    </>
  );
}
