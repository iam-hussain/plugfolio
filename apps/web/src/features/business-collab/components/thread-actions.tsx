"use client";

import { AcceptRow, AcceptStatus, Button, Input } from "@plugfolio/ui";
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
        <p role="alert" className="text-destructive text-micro">
          {(send.error ?? agree.error)?.message}
        </p>
      ) : null}
      {/* Status left, action right — the order the decision is actually
          made in: you read whether they have accepted before deciding
          whether you do. Once you have, the button states that rather than
          offering the action again; an enabled button there invites a
          second press that means nothing. */}
      <AcceptRow>
        <AcceptStatus>
          {otherSideAgreed ? "The other side has accepted." : "The other side hasn't accepted yet."}
        </AcceptStatus>
        <Button
          variant={hasAgreed ? "ghost" : "accent"}
          onClick={() => agree.mutate()}
          disabled={hasAgreed || agree.isPending}
        >
          {hasAgreed ? "You accepted" : "Accept terms"}
        </Button>
      </AcceptRow>
    </div>
  );
}
