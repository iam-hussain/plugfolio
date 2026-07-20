"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { agreeCollab, sendCollabMessage } from "../api";

/**
 * The thread's client actions: send a message, accept the terms. "Agreed"
 * needs BOTH sides; money changes hands off-platform (§2.3).
 */
export type ThreadActionsProps = {
  collabId: string;
  /** Whether the caller's side has already accepted. */
  hasAgreed: boolean;
  otherSideAgreed: boolean;
};

export function ThreadActions({ collabId, hasAgreed, otherSideAgreed }: ThreadActionsProps) {
  const router = useRouter();
  const [body, setBody] = useState("");

  const send = useMutation({
    mutationFn: () => sendCollabMessage(collabId, { body }),
    onSuccess: () => {
      setBody("");
      router.refresh();
    },
  });
  const agree = useMutation({
    mutationFn: () => agreeCollab(collabId),
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col gap-3">
      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (body.trim()) send.mutate();
        }}
      >
        <label className="flex-1">
          <span className="sr-only">Message</span>
          <input
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={1000}
            placeholder="Message…"
            className="border-border bg-background w-full rounded-md border p-2 text-sm"
          />
        </label>
        <Button type="submit" size="sm" disabled={send.isPending || !body.trim()}>
          Send
        </Button>
      </form>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          {otherSideAgreed ? "The other side has accepted." : "The other side hasn't accepted yet."}
        </p>
        <Button
          variant={hasAgreed ? "ghost" : "accent"}
          size="sm"
          onClick={() => agree.mutate()}
          disabled={hasAgreed || agree.isPending}
        >
          {hasAgreed ? "You accepted" : "Accept terms"}
        </Button>
      </div>
    </div>
  );
}
