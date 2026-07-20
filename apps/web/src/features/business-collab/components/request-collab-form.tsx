"use client";

import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestCollab } from "../api";

/**
 * Door two (lean journey): a business browsing a creator page sends a collab
 * request straight to the creator's Collabs tab.
 */
export type RequestCollabFormProps = {
  profileId: string;
};

export function RequestCollabForm({ profileId }: RequestCollabFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = useMutation({
    mutationFn: () => requestCollab({ profileId, message }),
    onSuccess: () => {
      setMessage("");
      setSent(true);
      router.refresh();
    },
  });

  if (sent) {
    return <p className="text-muted-foreground text-sm">Request sent — check your Collabs.</p>;
  }

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (message.trim()) submit.mutate();
      }}
    >
      <label className="flex-1">
        <span className="sr-only">Collab request message</span>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={1000}
          placeholder="We'd love a reel featuring our product…"
          className="border-border bg-background w-full rounded-md border p-2 text-sm"
        />
      </label>
      <Button type="submit" variant="outline" size="sm" disabled={submit.isPending || !message.trim()}>
        Request collab
      </Button>
    </form>
  );
}
