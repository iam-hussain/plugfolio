"use client";

import { Button } from "@plugfolio/ui";
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
      <label htmlFor="member-handle" className="text-sm font-medium">
        Your handle
      </label>
      <p className="text-muted-foreground text-xs">
        How you appear when you follow or comment. Not a login — you still sign in by email.
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground" aria-hidden>
          @
        </span>
        <input
          id="member-handle"
          value={username}
          onChange={(event) => setUsername(event.target.value.toLowerCase())}
          minLength={3}
          maxLength={30}
          pattern="[a-z0-9][a-z0-9._\-]{2,29}"
          title="3–30 characters: letters, numbers, dots, dashes"
          className="border-border bg-background flex-1 rounded-md border p-2 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={save.isPending || username === currentHandle || !username.trim()}
        >
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
      {save.isError ? (
        <p role="alert" className="text-muted-foreground text-xs">
          {save.error.message}
        </p>
      ) : null}
      {save.isSuccess ? <p className="text-muted-foreground text-xs">Saved.</p> : null}
    </form>
  );
}
