"use client";

import { Button, Input } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { SendHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { agreeCollab, sendCollabMessage } from "../api";

/**
 * The thread's client actions: send a message, accept the terms. "Agreed"
 * needs BOTH sides; money changes hands off-platform (§2.3). Accept is the
 * view's one accent moment (brief 12).
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
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (body.trim()) send.mutate();
        }}
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Message</span>
          <Input
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={1000}
            placeholder="Message…"
          />
        </label>
        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
          disabled={send.isPending || !body.trim()}
        >
          <SendHorizontal className="size-4" />
        </Button>
      </form>
      {send.isError || agree.isError ? (
        <p role="alert" className="text-destructive text-xs">
          {(send.error ?? agree.error)?.message}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
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
