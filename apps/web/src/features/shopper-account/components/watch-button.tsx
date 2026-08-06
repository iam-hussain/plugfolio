"use client";

import type { WatchKind } from "@plugfolio/core";
import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClaimSheet } from "@/features/account-auth";
import { removeFromWatchlist, saveToWatchlist } from "../api";

/**
 * Save to the watchlist — on a post or a product. The same shape as
 * `FollowButton`: anonymous shoppers get the inline claim sheet over the page
 * they're on (brief 04), never a wall on the page itself (§2.2); signed-in
 * shoppers toggle, and the label flips on the click rather than on the
 * round-trip, so a phone doesn't read it as a dead button.
 *
 * It steps back to the quiet pill once saved: the ask has been answered, and a
 * filled button that only undoes itself keeps asking.
 */
export type WatchButtonProps = {
  kind: WatchKind;
  targetId: string;
  isAuthenticated: boolean;
  initiallyWatched: boolean;
  /**
   * "pill" on a detail page, where the words are the ask; "icon" on the
   * watchlist itself, where every row is already saved and the control is a
   * corner affordance over the card, not a headline.
   */
  display?: "pill" | "icon";
  /**
   * On the watchlist itself every row is already saved, so the honest verb is
   * "Remove" (v2 §saved) — not a "Saved" state that reads as a fact.
   */
  verb?: "save" | "remove";
};

export function WatchButton({
  kind,
  targetId,
  isAuthenticated,
  initiallyWatched,
  display = "pill",
  verb = "save",
}: WatchButtonProps) {
  const icon = display === "icon";
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  // null = "no local opinion, show the server's" — so a failed write reverts
  // to the truth instead of lying.
  const [pendingState, setPendingState] = useState<boolean | null>(null);
  const watched = pendingState ?? initiallyWatched;
  const [failed, setFailed] = useState(false);

  useEffect(() => setPendingState(null), [initiallyWatched]);

  const toggle = useMutation({
    mutationFn: (next: boolean) =>
      next ? saveToWatchlist({ kind, targetId }) : removeFromWatchlist({ kind, targetId }),
    onMutate: (next) => {
      setFailed(false);
      setPendingState(next);
    },
    onError: () => {
      setPendingState(null);
      setFailed(true);
    },
    onSuccess: () => router.refresh(),
  });

  if (!isAuthenticated) {
    return (
      <>
        <Button variant="outline" size={icon ? "icon-sm" : "md"} onClick={() => setClaiming(true)}>
          <Bookmark aria-hidden className="size-4" />
          {icon ? <span className="sr-only">Save for later</span> : "Save"}
        </Button>
        <ClaimSheet open={claiming} onOpenChange={setClaiming} action="save" />
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button
        variant={watched ? "secondary" : "outline"}
        size={icon ? "icon-sm" : "md"}
        onClick={() => toggle.mutate(!watched)}
        // Still disabled in flight — the label already moved, so this reads as
        // "saving" rather than dead, and a double-fire (§6.8) can't race a save
        // against its own removal.
        disabled={toggle.isPending}
        aria-busy={toggle.isPending}
      >
        {watched ? (
          <BookmarkCheck aria-hidden className="size-4" />
        ) : (
          <Bookmark aria-hidden className="size-4" />
        )}
        {icon ? (
          <span className="sr-only">{watched ? "Remove from watchlist" : "Save for later"}</span>
        ) : watched ? (
          verb === "remove" ? (
            "Remove"
          ) : (
            "Saved"
          )
        ) : (
          "Save"
        )}
      </Button>
      {failed ? (
        <span role="alert" className="text-destructive text-micro font-semibold">
          Didn&apos;t save — try again
        </span>
      ) : null}
    </div>
  );
}
