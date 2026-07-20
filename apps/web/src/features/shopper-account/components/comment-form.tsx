"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addComment } from "../api";

/**
 * Comment box for signed-in shoppers. Anonymous visitors get a sign-in door
 * instead (rendered by the parent) — reading stays account-free (§2.2).
 */
export type CommentFormProps = {
  profileId: string;
};

export function CommentForm({ profileId }: CommentFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");

  const submit = useMutation({
    mutationFn: () => addComment({ profileId, body }),
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
