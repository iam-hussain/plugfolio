"use client";

import { useState } from "react";
import { ClaimSheet } from "@/features/account-auth";

/**
 * The anonymous state of the comment composer: the dashed band whose action
 * opens the inline claim sheet (brief 04) instead of navigating away.
 * Reading comments stays account-free either way.
 */
export function CommentClaim() {
  const [claiming, setClaiming] = useState(false);

  return (
    <p className="border-border text-muted-foreground rounded-xl border border-dashed p-4 text-center text-[13.5px]">
      <button
        type="button"
        onClick={() => setClaiming(true)}
        className="text-primary font-semibold"
      >
        Sign in
      </button>{" "}
      to comment — shopping never needs an account.
      <ClaimSheet open={claiming} onOpenChange={setClaiming} action="comment" />
    </p>
  );
}
