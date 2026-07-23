"use client";

import { Button, Input } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { approachRequirement } from "../api";

/** Door one, creator side: approach a posted requirement with an opener. */
export type ApproachFormProps = {
  requirementId: string;
  profileId: string;
};

export function ApproachForm({ requirementId, profileId }: ApproachFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  const submit = useMutation({
    mutationFn: () => approachRequirement({ requirementId, profileId, message }),
    onSuccess: () => {
      setMessage("");
      router.refresh();
    },
  });

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (message.trim()) submit.mutate();
      }}
    >
      <label className="min-w-0 flex-1">
        <span className="sr-only">Your opener</span>
        <Input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={1000}
          placeholder="I'd love to make this — here's my idea…"
        />
      </label>
      <Button type="submit" size="sm" disabled={submit.isPending || !message.trim()}>
        {submit.isPending ? "Sending…" : "Approach"}
      </Button>
      {submit.isError ? (
        <p role="alert" className="text-destructive text-xs">
          {submit.error.message}
        </p>
      ) : null}
    </form>
  );
}
