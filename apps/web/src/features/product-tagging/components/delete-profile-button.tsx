"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { deleteProfile } from "../api";

/**
 * The one destructive Settings action (brief 10, Admin-only): deleting the
 * profile frees a slot and takes the page — and everything on it — down.
 */
export function DeleteProfileButton({
  profileId,
  username,
}: {
  profileId: string;
  username: string;
}) {
  const router = useRouter();
  const remove = useMutation({
    mutationFn: () => deleteProfile(profileId),
    onSuccess: () => {
      router.push("/dashboard");
      router.refresh();
    },
  });

  return (
    <div className="flex items-center justify-between gap-3">
      {remove.isError ? (
        <p role="alert" className="text-destructive text-micro">
          {remove.error.message}
        </p>
      ) : (
        <p className="text-muted-foreground text-micro">
          Deletes @{username} and everything on it. This frees a profile slot.
        </p>
      )}
      <Button
        variant="destructive"
        size="sm"
        disabled={remove.isPending}
        onClick={() => {
          if (
            window.confirm(
              `Delete @${username}? The page, its posts, products and earnings history disappear. This can't be undone.`,
            )
          ) {
            remove.mutate();
          }
        }}
      >
        {remove.isPending ? "Deleting…" : "Delete profile"}
      </Button>
    </div>
  );
}
