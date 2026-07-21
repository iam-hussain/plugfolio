"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addComment } from "../api";

/**
 * Comment box for signed-in users. Anonymous visitors get a sign-in door
 * instead (rendered by the parent) — reading stays account-free (§2.2).
 *
 * Identity (ADR-0009): users with profile memberships get a "commenting as"
 * picker (personal @handle + each profile); everyone else sees plain text.
 * The default is per-page (this page's own profile when a member, else the
 * personal handle) and per-comment — never a sticky "acting as" mode.
 */
export type CommentIdentityOption = {
  id: string;
  username: string;
};

export type CommentFormProps = {
  profileId: string;
  /** The commenter's member handle, for the "commenting as" label. */
  ownHandle: string;
  /** Profiles the commenter can speak as (empty for plain shoppers). */
  identities: readonly CommentIdentityOption[];
  /** Preselected identity: this page's profile when the user is a member. */
  defaultAsProfileId: string | null;
};

export function CommentForm({
  profileId,
  ownHandle,
  identities,
  defaultAsProfileId,
}: CommentFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [asProfileId, setAsProfileId] = useState(defaultAsProfileId ?? "");

  const submit = useMutation({
    mutationFn: () => addComment({ profileId, body, asProfileId: asProfileId || null }),
    onSuccess: () => {
      setBody("");
      router.refresh();
    },
  });

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (body.trim()) submit.mutate();
      }}
    >
      {identities.length > 0 ? (
        <label className="text-muted-foreground flex items-center gap-2 text-xs">
          Commenting as
          <select
            value={asProfileId}
            onChange={(event) => setAsProfileId(event.target.value)}
            className="border-border bg-background rounded-md border p-1 text-xs"
          >
            <option value="">@{ownHandle} (you)</option>
            {identities.map((identity) => (
              <option key={identity.id} value={identity.id}>
                {identity.username} · Creator
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-muted-foreground text-xs">Commenting as @{ownHandle}</p>
      )}
      <label htmlFor="comment-body" className="sr-only">
        Add a comment
      </label>
      <textarea
        id="comment-body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={500}
        rows={2}
        placeholder="Add a comment…"
        className="border-border bg-background rounded-md border p-2 text-sm"
      />
      <div className="flex items-center justify-between">
        {submit.isError ? (
          <p role="alert" className="text-muted-foreground text-xs">
            {submit.error.message}
          </p>
        ) : (
          <span />
        )}
        <Button type="submit" size="sm" disabled={submit.isPending || !body.trim()}>
          {submit.isPending ? "Posting…" : "Post"}
        </Button>
      </div>
    </form>
  );
}
