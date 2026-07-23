"use client";

import { Button, Input } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateMemberHandle } from "../api";

/** Edit the member handle (ADR-0009): public identity only, never a login. */
export type HandleFormProps = {
  currentHandle: string;
};

export function HandleForm({ currentHandle }: HandleFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(currentHandle);

  const save = useMutation({
    mutationFn: () => updateMemberHandle({ username }),
    onSuccess: () => router.refresh(),
  });

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (username.trim()) save.mutate();
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground" aria-hidden>
          @
        </span>
        <label className="min-w-0 flex-1">
          <span className="sr-only">Your handle</span>
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            minLength={3}
            maxLength={30}
            pattern="[a-z0-9][a-z0-9._\-]{2,29}"
            title="3–30 characters: letters, numbers, dots, dashes"
          />
        </label>
        <Button
          type="submit"
          size="sm"
          disabled={save.isPending || username === currentHandle || !username.trim()}
        >
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
      {save.isError ? (
        <p role="alert" className="text-destructive text-xs">
          {save.error.message}
        </p>
      ) : null}
      {save.isSuccess ? <p className="text-muted-foreground text-xs">Saved.</p> : null}
    </form>
  );
}
