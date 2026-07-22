"use client";

import { useState } from "react";
import { CommentForm, type CommentIdentityOption } from "./comment-form";

/**
 * The "Reply" affordance under a top-level comment (ADR-0013: one level).
 * Signed-in only — the parent renders nothing for anonymous readers.
 */
export type ReplyToggleProps = {
  profileId: string;
  productId?: string;
  parentId: string;
  ownHandle: string;
  identities: readonly CommentIdentityOption[];
  defaultAsProfileId: string | null;
};

export function ReplyToggle({
  profileId,
  productId,
  parentId,
  ownHandle,
  identities,
  defaultAsProfileId,
}: ReplyToggleProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-primary text-xs underline"
      >
        Reply
      </button>
    );
  }

  return (
    <div className="pt-2">
      <CommentForm
        profileId={profileId}
        productId={productId}
        parentId={parentId}
        ownHandle={ownHandle}
        identities={identities}
        defaultAsProfileId={defaultAsProfileId}
        placeholder="Write a reply…"
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-muted-foreground pt-1 text-xs underline"
      >
        Cancel
      </button>
    </div>
  );
}
